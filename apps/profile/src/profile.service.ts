import { HttpStatus, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repositopy';
import { CreateProfileRequest } from './dto/create-profile.dto';
import { Profile } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Types } from 'mongoose';
import { PostProfileRelDto } from './dto/post-profile-rel.dto';
import { FeedProfileRelDto } from './dto/feed-profile-rel.dto';
import { SuccessResponse } from '@app/common';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createProfile(user: CreateProfileRequest): Promise<SuccessResponse> {
    const nickName: string = user.email.split('@', 1) + Date.now().toString();
    const newProfile = {
      user: new Types.ObjectId(user._id),
      nickName,
      email: user.email,
      posts: [],
      feeds: [],
    };

    const profile = await this.profileRepository.create({ ...newProfile });

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto
  ): Promise<SuccessResponse> {
    const _id = updateProfileDto._id;
    delete updateProfileDto._id;
    await this.profileRepository.findOne({
      _id: new Types.ObjectId(_id),
    });

    let profile: Profile;
    const session = await this.profileRepository.startTransaction();
    try {
      profile = await this.profileRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $set: UpdateProfileDto }
      );

      await session.commitTransaction();
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
    }

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async addRelationPost(data: PostProfileRelDto) {
    const { user, post } = data;
    await this.profileRepository.findOneAndUpdate(
      { user: new Types.ObjectId(user) },
      {
        $push: { posts: new Types.ObjectId(post) },
      }
    );
  }

  async addRelationFeed(data: FeedProfileRelDto) {
    const { user, feed } = data;
    await this.profileRepository.findOneAndUpdate(
      { user: new Types.ObjectId(user) },
      {
        $push: { feeds: new Types.ObjectId(feed) },
      }
    );
  }

  async deleteRelationFeed(data: FeedProfileRelDto) {
    const { user, feed } = data;
    await this.profileRepository.findOneAndUpdate(
      { user: new Types.ObjectId(user) },
      {
        $pull: { feeds: new Types.ObjectId(feed) },
      }
    );
  }

  async deleteRelationPost(data: PostProfileRelDto) {
    const { user, post } = data;
    console.log('deleteRelationPost ' + data);
    await this.profileRepository.findOneAndUpdate(
      { user: new Types.ObjectId(user) },
      {
        $pull: { posts: new Types.ObjectId(post) },
      }
    );
  }

  async getProfileRaw(_id: Types.ObjectId): Promise<Profile> {
    return await this.profileRepository.findOne({
      userId: new Types.ObjectId(_id),
    });
  }

  async getProfile(_id: Types.ObjectId): Promise<SuccessResponse> {
    const profile = await this.profileRepository.findOne({
      userId: new Types.ObjectId(_id),
    });

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async getProfileActivity(_id: Types.ObjectId): Promise<SuccessResponse> {
    const profile = await this.profileRepository.findOne({
      userId: new Types.ObjectId(_id),
    });

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }
}
