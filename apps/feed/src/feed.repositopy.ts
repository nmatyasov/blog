import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Feed } from './schemas/feed.schema';
import { Profile } from '../../profile/src/schemas/profile.schema';

@Injectable()
export class FeedRepository extends AbstractRepository<Feed> {
  protected readonly logger = new Logger(FeedRepository.name);

  constructor(
    @InjectModel(Feed.name) FeedModel: Model<Feed>,
    @InjectModel(Profile.name) profileModel: Model<Profile>,
    @InjectConnection() connection: Connection
  ) {
    super(FeedModel, connection);
  }
}
