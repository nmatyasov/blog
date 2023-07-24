import {
  Controller,
  Get,
  Param,
  Query,
  ValidationPipe,
  Post,
  Body,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Types } from 'mongoose';
import { ParseObjectIdPipe, JwtAuthGuard } from '@app/common';
import { PostFilterDto } from './dto/post.filter.dto';
import { PostCreateDto } from './dto/post.create.dto';
import { Blog } from './schemas/blog.schema';
import { PostUpdateDto } from './dto/post.update.dto';

import { CurrentUser } from '../../auth/src/current-user.decorator';
import { User } from '../../auth/src/users/schemas/user.schema';

import { Feed } from 'apps/feed/src/schemas/feed.schema';
import { PostFeedAddDto } from '../src/dto/post-add-comment.dto';
import { PostFeedsFilterDto } from '../src/dto/post-feeds.filter.dto';
import { PostSlugDto } from '../src/dto/post-slug.filter.dto';
import { multerOptions } from '@app/common/config/mutler.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from '@app/common/pipes/sharp-image.pipe';

@Controller('blog')
export class BlogController {
  rmqService: any;
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllPosts(@Query() filterDto: PostFilterDto) {
    return await this.blogService.getAllPosts(filterDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addPost(
    @Body(ValidationPipe) postCreateDto: PostCreateDto,
    @CurrentUser() user: User
  ): Promise<Blog> {
    return await this.blogService.addPost(postCreateDto, user._id);
  }

  // upload single file
  @Post('img')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerOptions.storage,
      fileFilter: multerOptions.fileFilter,
    })
  )
  async uploadFile(@UploadedFile(SharpPipe) file: string) {
    const result = {
      filename: file,
    };
    return {
      status: HttpStatus.OK,
      message: 'Image uploaded successfully!',
      data: result,
    };
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: User
  ): Promise<number | undefined> {
    return await this.blogService.deletePost(id, user._id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body(ValidationPipe) postUpdateDto: PostUpdateDto,
    @CurrentUser() user: User
  ): Promise<Blog | undefined> {
    return await this.blogService.updatePost(id, postUpdateDto, user._id);
  }

  @Post(':id/comment')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body(ValidationPipe) postFeedAddDto: PostFeedAddDto,
    @CurrentUser() user: User
  ): Promise<Feed> {
    return await this.blogService.addFeed(id, postFeedAddDto.text, user._id);
  }

  @Get(':id/comments')
  async getPostAllComments(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Query() filterDto: PostFeedsFilterDto
  ) {
    const filterQuery: PostFeedsFilterDto = { postId: id, ...filterDto };
    return await this.blogService.getPostAllFeeds(filterQuery);
  }

  @Get('post/:slug')
  async getPostBySlug(@Param('slug') slug: string) {
    return await this.blogService.getPostBySlug(slug);
  }

  @Get('alltags')
  async getAllListTags() {
    return await this.blogService.getAllListTags();
  }

  @Get(':id/tags')
  async getListTagsByAutor(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return await this.blogService.getListTagsByAuthor(id);
  }
  //ATTANTION
  //не перемещать. конфликтует с alltags
  @Get(':id')
  async getPostById(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return await this.blogService.getPostById(id);
  }
}
