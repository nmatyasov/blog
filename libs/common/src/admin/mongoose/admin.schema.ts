import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { genSalt, hash } from 'bcrypt';

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
export class Admin extends AbstractDocument {
  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;
}
export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', async function (next: any) {
  const user = this as unknown as Admin;

  if (this.isModified('password') || this.isNew) {
    const salt = await genSalt(10);
    user.password = await hash(user.password, salt);
  }
  next();
});
