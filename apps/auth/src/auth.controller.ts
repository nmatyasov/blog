import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './users/schemas/user.schema';
import {
  ParseObjectIdPipe,
  RMQCommand,
  RequestWithUser,
  RmqService,
  SuccessResponse,
} from '@app/common';
import { CreateUserRequest } from './users/dto/create-user.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@app/common/config/mutler.config';
import { Types } from 'mongoose';
import { UpdateProfileDto } from 'apps/profile/src/dto/update-profile.dto';
import { Profile } from 'apps/profile/src/schemas/profile.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response
  ) {
    const { token, expires } = await this.authService.login(user);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });
    response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern(RMQCommand.VALIDATE_USER)
  async validateUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('register')
  async createUser(@Body() request: CreateUserRequest) {
    return this.authService.register(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    res.cookie('Authentication', '', {
      maxAge: 0,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body(ValidationPipe) profileUpdateDto: UpdateProfileDto,
    @CurrentUser() user: User
  ): Promise<SuccessResponse> {
    return await this.authService.updateProfile(id, profileUpdateDto, user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getprofile(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() user: User
  ): Promise<SuccessResponse> {
    return await this.authService.getProfile(id, user._id);
  }

  @Get('profile/:id/view')
  async viewpofile(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId
  ): Promise<SuccessResponse> {
    return await this.authService.getProfileView(id);
  }

  // upload single file
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multerOptions.storage,
      fileFilter: multerOptions.fileFilter,
    })
  )
  async uploadAvatar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User
  ): Promise<SuccessResponse> {
    return await this.authService.setAvatar(id, file.filename, user._id);
  }
}
