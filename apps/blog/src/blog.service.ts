import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PostCreateDto } from './dto/post.create.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { QueryOptions, Types } from 'mongoose';
import { Blog } from './schemas/blog.schema';
import { PostFilterDto } from './dto/post.filter.dto';

import { RMQCommand } from '@app/common';
import { Feed } from '../../feed/src/schemas/feed.schema';
import { FeedCreateDto } from '../../feed/src/dto/feed.create.dto';
import { PostFeedsFilterDto } from '../../feed/src/dto/post-feeds.filter.dto';
import { MongoError } from 'mongodb';
import { FeedAlertDto } from 'apps/blog/src/dto/feed-alert.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    @Inject('NOTIF') private notifClient: ClientProxy,
    @Inject('FEED') private feedClient: ClientProxy,
    @Inject('PROFILE') private profileClient: ClientProxy,
    @Inject('FILES') private filesClient: ClientProxy
  ) {}

  async addPost(postCreateDto: PostCreateDto, userId: Types.ObjectId) {
    let tmpPost = {} as Blog;
    const slug = this.slugify(postCreateDto.title);
    const newPost = {
      ...postCreateDto,
      slug,
      dateCreated: new Date(),
      dateUpdated: null,
      author: new Types.ObjectId(userId),
      feeds: [],
    };

    const session = await this.blogRepository.startTransaction();
    try {
      tmpPost = await this.blogRepository.create(newPost, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      const err = new MongoError(error);
      err.code = error.code;
      throw err;
    }

    const post: Blog = await this.blogRepository.findOne(
      { _id: new Types.ObjectId(tmpPost._id) },
      [{ path: 'user', select: 'nickName avatar email' }]
    );

    //set relation profile 2 post
    await firstValueFrom(
      this.profileClient.emit(RMQCommand.REL_POST_PROFILE, {
        post: post._id,
        user: post.author,
      })
    );
    //send 
    await firstValueFrom(this.notifClient.emit(RMQCommand.POST_CREATED, post));
    return post;
  }

  async updatePost(
    _id: Types.ObjectId,
    postUpdateDto: PostUpdateDto,
    userId: Types.ObjectId
  ): Promise<Blog | undefined> {
    const currentPost = await this.blogRepository.findOne({
      _id: new Types.ObjectId(_id),
    });
    /**Проверяем есть ли доступ к редактированию */
    if (!this.userIsAuthor(userId, currentPost.author)) {
      throw new HttpException(
        'You are not the author of this article',
        HttpStatus.FORBIDDEN
      );
    }
    /**Годовим данные к изменению*/
    let updPost: Partial<Blog> = {
      ...postUpdateDto,
      dateUpdated: new Date(),
    };

    if (postUpdateDto?.title) {
      const slug = this.slugify(postUpdateDto.title);
      updPost = {
        ...postUpdateDto,
        slug,
      };
    }
    /**Начинаем */
    const session = await this.blogRepository.startTransaction();
    try {
      const tmpPost = await this.blogRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(currentPost._id) },
        { $set: updPost }
      );

      const post: Blog = await this.blogRepository.findOne(
        { _id: new Types.ObjectId(tmpPost._id) },
        [{ path: 'user', select: 'nickName avatar email' }]
      );
      /**если пост опубликован, то шлем письмо*/
      if (!post.draft) {
        await firstValueFrom(
          this.notifClient.emit(RMQCommand.POST_PUBLISHED, { post })
        );
      }

      await session.commitTransaction();
      return post;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
    }
  }

  async deletePost(
    _id: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<number | undefined> {
    const post = await this.blogRepository.findOne({
      _id: new Types.ObjectId(_id),
    });
    /**Проверяем есть ли доступ к редактированию */
    if (!this.userIsAuthor(userId, post.author)) {
      throw new HttpException(
        'You are not the author of this article',
        HttpStatus.FORBIDDEN
      );
    }
    const session = await this.blogRepository.startTransaction();

    try {
      const deletedCount = await this.blogRepository.deleteOne({
        _id,
      });
      Promise.all([
        /**Сообщили что пост удален */
        await firstValueFrom(
          this.notifClient.emit(RMQCommand.POST_DELETED, { post: _id })
        ),
        /**Удалили из профиля ссылку что пост удален */
        await firstValueFrom(
          this.profileClient.emit(RMQCommand.POST_PROFILE_REL_DELETED, {
            post: _id,
            author: userId,
          })
        ),
        /**Удалили комментарии на пост если есть комменты*/
        post.feeds.length &&
          (await firstValueFrom(
            this.feedClient.emit(RMQCommand.POST_FEED_REL_DELETED, {
              post: _id,
            })
          )),
      ]).then();
      await session.commitTransaction();
      return deletedCount;
    } catch (error) {
      await session.abortTransaction();
      const err = new MongoError(error);
      err.code = error.code;
      throw err;
    }
  }

  async getPostById(_id: Types.ObjectId): Promise<Blog> {
    const post: Blog = await this.blogRepository.findOne(
      { _id: new Types.ObjectId(_id) },
      [{ path: 'user', select: 'nickName avatar' }]
    );

    await this.blogRepository.findOneAndUpdate(
      { _id: post._id },
      { readCount: (post.readCount ?? 0) + 1 }
    );

    return post;
  }

  async getPostBySlug(slug: any): Promise<Blog> {
    const post: Blog = await this.blogRepository.findOne({ slug }, [
      { path: 'user', select: 'nickName avatar' },
    ]);

    await this.blogRepository.findOneAndUpdate(
      { _id: post._id },
      { readCount: (post.readCount ?? 0) + 1 }
    );
    return post;
  }

  async getAllPosts(filterDto: PostFilterDto): Promise<Blog[]> {
    const keyword: string = filterDto?.keyword?.trim() || '';
    const tag: string = filterDto?.tag?.trim() || '';
    const limit: number = filterDto?.limit || 10;
    const skip: number = filterDto?.skip || 0;

    //{ $text: { $regex: keyword, $options: 'i' }}
    let filter = {};
    if (keyword && !tag) {
      filter = { $text: { $search: keyword } };
    }
    if (!keyword && tag) {
      filter = { tags: { $all: [tag] } };
    }

    if (keyword && tag) {
      filter = {
        $or: [{ $text: { $search: keyword } }, { tags: { $all: [tag] } }],
      };
    }

    const queryOptions = {
      limit,
      skip,
    } as QueryOptions;

    const posts: Blog[] = await this.blogRepository.find(filter, queryOptions, [
      { path: 'user', select: 'nickName avatar' },
    ]);
    return posts;
  }

  async addFeed(_id: Types.ObjectId, text: string, userId: Types.ObjectId) {
    /**если не найдем такой документ то будет ошибка и не будем рассылать подписчикам сообщения*/
    await this.blogRepository.findOne({ _id });
    /**Формируем данные */
    const newFeed: FeedCreateDto = {
      text: text,
      author: new Types.ObjectId(userId),
      dateCreated: new Date(),
      post: _id,
    };

    const session = await this.blogRepository.startTransaction();
    try {
      const feed: Feed = await firstValueFrom(
        this.feedClient.send(RMQCommand.FEED_ADDED, { ...newFeed })
      );
      /**Добавляем к статье ссылку на отзыв */
      await this.blogRepository.findOneAndUpdate(
        { _id },
        {
          $push: { feeds: new Types.ObjectId(feed._id) },
        }
      );
      /**Добавляем отзыв в провиль пользователя */
      await firstValueFrom(
        this.profileClient.emit(RMQCommand.REL_FEED_PROFILE, {
          user: feed.author,
          feed: feed._id,
        })
      );

      /**отправляем автору сообщение о сомменте */
      const feedNotif = await this.createFeedAlert(feed);
      await firstValueFrom(
        this.notifClient.send(RMQCommand.SEND_FEED_ADDED, { ...feedNotif })
      );
      await session.commitTransaction();
      return feed;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
    }
  }

  /**Все отзывы к статье */
  async getPostAllFeeds(filterDto: PostFeedsFilterDto): Promise<Feed[]> {
    const feeds: Feed[] = await firstValueFrom(
      this.feedClient.send(RMQCommand.GET_ALL_FEEDS_BY_POST, {
        ...filterDto,
      })
    );

    return feeds;
  }

  /**Группированный список тэгов */
  async getAllListTags() {
    const queryOptions = {
      limit: 999999,
      skip: 0,
    } as QueryOptions;

    const posts: Blog[] = await this.blogRepository.find({}, queryOptions);
    const tags = await this.totalTags(posts);
    return tags;
  }

  async getListTagsByAuthor(author: Types.ObjectId) {
    const queryOptions = {
      limit: 999999,
      skip: 0,
    } as QueryOptions;

    const posts: Blog[] = await this.blogRepository.find(
      { author },
      queryOptions
    );
    const tags = this.totalTags(posts);
    return tags;
  }

  /*----------------------private------------------------------*/

  private async createFeedAlert(feed: Feed): Promise<FeedAlertDto> {
    const post: any = await this.blogRepository.findOne(
      { _id: new Types.ObjectId(feed.post) },
      [
        { path: 'user', select: 'nickName email' },
        {
          path: 'feeds',
          match: feed._id,
          select: 'author',
          populate: { path: 'user', select: 'nickName' },
        },
      ]
    );
    return {
      _id: feed._id,
      author: post.user.nickName,
      email: post.user.email,
      text: feed.text,
      user: post.feeds.user.nickName,
      slug: post.slug,
    };
  }

  //Check user is author or not
  private userIsAuthor(userId: Types.ObjectId, autorId: Types.ObjectId) {
    return userId.toString() === autorId.toString();
  }
  /** Count tags by posts*/
  private async totalTags(posts: Blog[]) {
    const countByTags = new Map();
    /**формируем Map */
    posts.map((post) => {
      post.tags?.map((tag) => {
        const count = countByTags.get(tag) || 0;
        countByTags.set(tag, count + 1);
      });
    });
    const arrObj = [];
    /**Конвертируем Map в Object */
    countByTags.forEach((value, key) => {
      arrObj.push({ key, value });
    });
    return arrObj;
  }

  /**Create slug*/
  private slugify(title: string): string {
    let slug: string;

    // convert to lower case
    slug = title.toLowerCase();

    // remove special characters
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
      ''
    );
    // The /gi modifier is used to do a case insensitive search of all occurrences of a regular expression in a string

    // replace spaces with dash symbols
    slug = slug.replace(/ /gi, '-');

    // remove consecutive dash symbols
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');

    // remove the unwanted dash symbols at the beginning and the end of the slug
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
  }
}
