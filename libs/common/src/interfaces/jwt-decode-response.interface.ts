export enum RolesEnum {
  ADMIN = 'admin',
  USER = 'user',
}

export interface JwtDecodeResponse {
  id: string;
  email: string;
  roles?: RolesEnum[];
  iat?: number;
  exp?: number;
  avatar?: string;
  nickName: string;
}
