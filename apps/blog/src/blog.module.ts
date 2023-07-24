import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule, RmqModule, AuthModule } from '@app/common';
import {
  NOTIF_SERVICE,
  FEED_SERVICE,
  PROFILE_SERVICE,
  FILES_SERVICE,
} from '@app/common';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogController } from './blog.controller';
import { BlogRepository } from './blog.repository';
import { BlogService } from './blog.service';
import {
  Profile,
  ProfileSchema,
} from '../../profile/src/schemas/profile.schema';
import { Feed, FeedSchema } from '../../feed/src/schemas/feed.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/blog/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Feed.name, schema: FeedSchema },
    ]),
    RmqModule.register({
      name: NOTIF_SERVICE,
    }),
    RmqModule.register({
      name: FEED_SERVICE,
    }),
    RmqModule.register({
      name: PROFILE_SERVICE,
    }),
    RmqModule.register({
      name: FILES_SERVICE,
    }),
    AuthModule,
  ],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository],
})
export class BlogModule {}
