import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsEmail } from 'class-validator';
import { Blog } from '../../../blog/src/schemas/blog.schema';
import { Feed } from '../../../feed/src/schemas/feed.schema';

@Schema({ versionKey: false })
export class Profile extends AbstractDocument {
  /* id relation One to One with User Schema */
  @Prop()
  _id: Types.ObjectId;

  @Prop({ unique: true })
  user: Types.ObjectId;

  @Prop({
    IsEmail,
    unique: true,
  })
  email: string;

  @Prop({
    unique: true,
  })
  nickName: string;

  @Prop({
    IsOptional,
  })
  firstName?: string;

  @Prop({
    IsOptional,
  })
  lastName?: string;

  @Prop({
    IsOptional,
  })
  avatar?: string;

  @Prop({
    IsOptional,
  })
  birthday?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Blog', required: true })
  posts?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Feed', required: true })
  feeds?: Types.ObjectId[];
}
export const ProfileSchema = SchemaFactory.createForClass(Profile);
