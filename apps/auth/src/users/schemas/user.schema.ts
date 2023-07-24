import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { genSalt, hash, compare } from 'bcrypt';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next: any) {
  const user = this as unknown as User;

  if (this.isModified('password') || this.isNew) {
    const salt = await genSalt(10);
    user.password = await hash(user.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return compare(candidatePassword, this.password);
};
/*
export interface User {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
*/
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret['password'];
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret['password'];
    return ret;
  },
});
