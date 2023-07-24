import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RMQCommand, RmqService } from '@app/common';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly rmqService: RmqService
  ) {}

  @Get()
  getHello(): string {
    return this.profileService.getHello();
  }

  @MessagePattern(RMQCommand.USER_ADDED)
  async msgUserAdded(@Payload() data: any, @Ctx() ctx: RmqContext) {
    this.rmqService.ack(ctx);
    return await this.profileService.createProfile(data);
  }

  @MessagePattern(RMQCommand.PROFILE_UPDATE)
  async msgUpdateProfile(@Payload() data: any, @Ctx() ctx: RmqContext) {
    this.rmqService.ack(ctx);
    return await this.profileService.updateProfile(data);
  }

  @EventPattern(RMQCommand.REL_POST_PROFILE)
  async eventPostAdded(@Payload() data: any, @Ctx() ctx: RmqContext) {
    await this.profileService.addRelationPost(data);
    this.rmqService.ack(ctx);
  }
  @EventPattern(RMQCommand.REL_FEED_PROFILE)
  async eventFeedAdded(@Payload() data: any, @Ctx() ctx: RmqContext) {
    await this.profileService.addRelationFeed(data);
    this.rmqService.ack(ctx);
  }

  @EventPattern(RMQCommand.POST_PROFILE_REL_DELETED)
  async eventPostDeleted(@Payload() data: any, @Ctx() ctx: RmqContext) {
    console.log(data);
    await this.profileService.deleteRelationPost(data);
    this.rmqService.ack(ctx);
  }

  @EventPattern(RMQCommand.FEED_PROFILE_REL_DELETED)
  async eventFeedDeleted(@Payload() data: any, @Ctx() ctx: RmqContext) {
    await this.profileService.deleteRelationFeed(data);
    this.rmqService.ack(ctx);
  }

  @MessagePattern(RMQCommand.GET_PROFILE_CARD)
  async getProfile(@Payload() data: any, @Ctx() ctx: RmqContext) {
    await this.profileService.getProfile(data.userId);
    this.rmqService.ack(ctx);
  }

  @MessagePattern(RMQCommand.GET_PROFILE_ACTIVITY)
  async getProfileActivity(@Payload() data: any, @Ctx() ctx: RmqContext) {
    await this.profileService.getProfileActivity(data.userId);
    this.rmqService.ack(ctx);
  }
}
