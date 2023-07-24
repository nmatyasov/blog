import { Types } from 'mongoose';
import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Feed } from '../../../feed/src/schemas/feed.schema';

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
export class Blog extends AbstractDocument {
  @Prop()
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop()
  dateCreated: Date | null;

  @Prop()
  dateUpdated: Date | null;

  @Prop({ default: true })
  draft: boolean;

  @Prop({
    unique: true,
  })
  slug: string;

  @Prop({
    ref: 'Profile',
    type: Types.ObjectId,
    required: true,
  })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Feed.name, required: true })
  feeds: Types.ObjectId[];

  @Prop()
  tags?: string[];

  /*Attenion */
  /*don’t use the @Prop() decorator on the url property its virtual*/
  url?: string;

  @Prop({ default: 0 })
  readCount?: number;

  @Prop()
  img?: string;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);

/*https://habr.com/ru/articles/174457/ на прод надо переключить поддержку multilanguage*/

BlogSchema.index({ title: 'text', description: 'text', body: 'text' });

// Foreign keys definitions

BlogSchema.virtual('user', {
  ref: 'Profile',
  localField: 'author',
  foreignField: 'user',
  justOne: true, // for many-to-1 relationships
});

// 'url' is the name of the virtual

BlogSchema.virtual('url').get(function () {
  const blog = this as unknown as Blog;
  // you are computing dynamic url
  return '/blog/post/' + blog.slug;
});
