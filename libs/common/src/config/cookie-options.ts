import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
/*TODO: переделать под DI ConfigService*/

export const getCookieOptions = (
  configService: ConfigService,
  tokenExp: string
): CookieOptions => {
  const cookiesOptions: CookieOptions = {
    httpOnly: true,
    secure: JSON.parse(configService.get<string>('HTTPS_ONLY')),
    expires: new Date(
      Date.now() + parseInt(configService.get<string>(tokenExp)) * 1000
    ),
  };
  return {
    ...cookiesOptions,
  };
};
