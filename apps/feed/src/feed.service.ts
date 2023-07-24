import { Injectable, Logger } from '@nestjs/common';
import { FeedCreateDto } from './dto/feed.create.dto';
import { FeedRepository } from './feed.repositopy';
import { QueryOptions, Types } from 'mongoose';
import { PostFeedsFilterDto } from './dto/post-feeds.filter.dto';
import { Feed } from './schemas/feed.schema';
import { MongoError } from 'mongodb';

@Injectable()
export class FeedService {
  protected readonly logger = new Logger(FeedService.name);
  constructor(private readonly feedRepository: FeedRepository) {}

  async addFeed(data: FeedCreateDto): Promise<Feed> {
    const session = await this.feedRepository.startTransaction();

    const { post, author, text, dateCreated } = data;

    const feed = await this.feedRepository.create({
      post: new Types.ObjectId(post),
      author: new Types.ObjectId(author),
      text,
      dateCreated,
    });
    await session.commitTransaction();
    try {
    } catch (error) {
      await session.abortTransaction();
    }
    const resFeed: Feed = await this.getFeedById(feed._id);
    return resFeed;
  }

  async getAllFeedsByPost(filterQuery: PostFeedsFilterDto): Promise<Feed[]> {
    console.log(filterQuery);
    const limit: number = filterQuery?.limit || 10;
    const skip: number = filterQuery?.skip || 0;

    const queryOptions = {
      limit,
      skip,
    } as QueryOptions;
    const feeds: Feed[] = await this.feedRepository.find(
      { post: new Types.ObjectId(filterQuery.postId) },
      queryOptions,
      [{ path: 'user', select: 'nickName avatar' }]
    );
    return feeds;
  }

  async getFeedById(_id: Types.ObjectId): Promise<Feed> {
    const feed: Feed = await this.feedRepository.findOne({ _id }, [
      { path: 'user', select: 'nickName avatar' },
    ]);
    return feed;
  }
  getHello(): string {
    return 'Hello World!';
  }

  async deleteFeedByPost(data: any) {
    const { post } = data;
    try {
      await this.feedRepository.deleteMany({
        post,
      });
    } catch (error) {
      const err = new MongoError(error);
      err.code = error.code;
      throw err;
    }
  }
}
