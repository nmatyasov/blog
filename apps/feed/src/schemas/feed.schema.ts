import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  versionKey: false,
  toJSON: {
    getters: true,
    virtuals: true,
  },
  toObject: {
    getters: true,
    virtuals: true,
  },
})
export class Feed extends AbstractDocument {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  text: string;

  @Prop()
  dateCreated: Date;

  @Prop({
    ref: 'Profile',
    type: Types.ObjectId,
    required: true,
  })
  author: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Blog',
    required: true,
  })
  post: Types.ObjectId;
}
export const FeedSchema = SchemaFactory.createForClass(Feed);

// Foreign keys definitions

FeedSchema.virtual('user', {
  ref: 'Profile',
  localField: 'author',
  foreignField: 'user',
  justOne: true, // for many-to-1 relationships
});
