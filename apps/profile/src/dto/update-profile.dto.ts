import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProfileDto {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  nickName: string;

  firstName?: string;

  lastName?: string;

  avatar?: string;

  birthday?: Date;
}
