import {
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';
import { CreateUserRequest } from 'apps/auth/src/users/dto/create-user.request';
import { RMQCommand, SuccessResponse } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateProfileDto } from 'apps/profile/src/dto/update-profile.dto';
import { Types } from 'mongoose';
import { Profile } from 'apps/profile/src/schemas/profile.schema';

export interface TokenPayload {
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject('PROFILE') private profileClient: ClientProxy
  ) {}

  async login(user: User) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      email: user.email,
    };
    /*ATTENTION */
    /*clear password*/
    delete user.password;

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION')
    );

    const token = this.jwtService.sign(tokenPayload);
    return { token, expires };
  }

  async register(request: CreateUserRequest): Promise<SuccessResponse> {
    const user = await this.usersService.createUser(request);
    const { _id, email } = user;

    /**Cоздаем профиль пользователя*/
    const profile = await lastValueFrom(
      this.profileClient.send(RMQCommand.USER_ADDED, { _id, email })
    );
    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async setAvatar(
    id: Types.ObjectId,
    filename: string,
    userId: Types.ObjectId
  ): Promise<SuccessResponse> {
    if (userId !== id) {
      throw new HttpException('You have not permission', HttpStatus.FORBIDDEN);
    }
    const profile = await lastValueFrom(
      this.profileClient.send(RMQCommand.PROFILE_UPDATE, {
        _id: id,
        avatar: filename,
      })
    );

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async getProfileView(id: Types.ObjectId): Promise<SuccessResponse> {
    const profile = await lastValueFrom(
      this.profileClient.send(RMQCommand.GET_PROFILE_ACTIVITY, { _id: id })
    );
    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async getProfile(
    id: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<SuccessResponse> {
    if (userId !== id) {
      throw new HttpException('You have not permission', HttpStatus.FORBIDDEN);
    }

    const profile = await lastValueFrom(
      this.profileClient.send(RMQCommand.GET_PROFILE_CARD, { _id: id })
    );
    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: profile,
    };
    return profileResponseDto;
  }

  async updateProfile(
    id: Types.ObjectId,
    profileUpdateDto: UpdateProfileDto,
    userId: Types.ObjectId
  ): Promise<SuccessResponse> {
    if (userId !== id) {
      throw new HttpException('You have not permission', HttpStatus.FORBIDDEN);
    }

    const profile = await lastValueFrom(
      this.profileClient.send(RMQCommand.PROFILE_UPDATE, {
        _id: id,
        ...profileUpdateDto,
      })
    );

    const profileResponseDto: SuccessResponse = {
      statusCode: HttpStatus.OK,
      message: 'Succefull',
      data: [profile],
    };
    return profileResponseDto;
  }
}
