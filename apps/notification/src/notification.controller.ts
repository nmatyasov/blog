import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RMQCommand, RmqService } from '@app/common';

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqService: RmqService
  ) {}

  @Get()
  getHello(): string {
    return this.notificationService.getHello();
  }

  @EventPattern(RMQCommand.POST_CREATED)
  async eventPostCreated(@Payload() data: any, @Ctx() ctx: RmqContext) {
    this.notificationService.postCreated(data);
    this.rmqService.ack(ctx);
  }

  @EventPattern(RMQCommand.POST_PUBLISHED)
  async eventPostPublished(@Payload() data: any, @Ctx() ctx: RmqContext) {
    this.notificationService.postPublished(data.post);
    this.rmqService.ack(ctx);
  }

  @MessagePattern(RMQCommand.SEND_FEED_ADDED)
  async msgCommentAdded(@Payload() data: any, @Ctx() ctx: RmqContext) {
    this.notificationService.feedAdded(data);
    this.rmqService.ack(ctx);
  }
}
