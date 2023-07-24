import { Controller, Get, ValidationPipe } from '@nestjs/common';
import { FeedService } from './feed.service';
import { RMQCommand, RmqService } from '@app/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { PostFeedsFilterDto } from './dto/post-feeds.filter.dto';
import { Feed } from './schemas/feed.schema';
import { FeedCreateDto } from './dto/feed.create.dto';

@Controller('feed')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly rmqService: RmqService
  ) {}

  @Get()
  getHello(): string {
    return this.feedService.getHello();
  }

  @MessagePattern(RMQCommand.FEED_ADDED)
  async msgFeedAdded(
    @Payload(ValidationPipe) data: FeedCreateDto,
    @Ctx() ctx: RmqContext
  ) {
    const feed: Feed = await this.feedService.addFeed(data);
    this.rmqService.ack(ctx);
    return feed;
  }

  @MessagePattern(RMQCommand.GET_ALL_FEEDS_BY_POST)
  async msgAllFeedsByPost(
    @Payload(ValidationPipe) data: PostFeedsFilterDto,
    @Ctx() ctx: RmqContext
  ) {
    const feeds: Feed[] = await this.feedService.getAllFeedsByPost(data);
    this.rmqService.ack(ctx);
    return feeds;
  }

  @EventPattern(RMQCommand.POST_FEED_REL_DELETED)
  async eventFeedDeleted(@Payload() data: any, @Ctx() ctx: RmqContext) {
    console.log(data);
    await this.feedService.deleteFeedByPost(data);
    this.rmqService.ack(ctx);
  }
}
