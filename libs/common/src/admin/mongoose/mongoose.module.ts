import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.schema';
import { BlogSchema, Blog } from '../../../../../apps/blog/src/schemas/blog.schema';
import {
  ProfileSchema,
  Profile,
} from '../../../../../apps/profile/src/schemas/profile.schema';
import { FeedSchema, Feed } from '../../../../../apps/feed/src/schemas/feed.schema';
import { DatabaseModule } from '@app/common/database/database.module';

import { AdminJS } from 'adminjs';
import { AdminModule } from '@adminjs/nestjs/src';
import AdminJSMongoose from '@adminjs/mongoose/lib';

/**STOP https://github.com/SoftwareBrothers/adminjs-nestjs/issues/58 */

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    AdminModule.createAdminAsync({
      imports: [DatabaseModule],
      useFactory: () => ({
        auth: {
          authenticate,
          cookieName: 'admin_panel',
          cookiePassword: 'secret',
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: 'secret',
        },
        adminJsOptions: {
          rootPath: '/admin',
          resources: [Admin, Blog, Profile, Feed],
        },
      }),
    }),
  ],
})
export class AdminMongooseModule {}
