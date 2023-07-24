import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedRepository } from './feed.repositopy';
import {
  Profile,
  ProfileSchema,
} from '../../profile/src/schemas/profile.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/feed/.env',
    }),
    RmqModule,
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: Feed.name,
        schema: FeedSchema,
      },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
})
export class FeedModule {}
