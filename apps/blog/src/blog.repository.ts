import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Blog } from './schemas/blog.schema';
import { Connection, Model } from 'mongoose';
import { Profile } from '../../profile/src/schemas/profile.schema';

@Injectable()
export class BlogRepository extends AbstractRepository<Blog> {
  protected readonly logger = new Logger(BlogRepository.name);

  constructor(
    @InjectModel(Blog.name) blogModel: Model<Blog>,
    @InjectModel(Profile.name) profileModel: Model<Profile>,
    @InjectConnection() connection: Connection
  ) {
    super(blogModel, connection);
  }
}
