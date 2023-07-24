import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProfileRequest {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  email: string;
}
