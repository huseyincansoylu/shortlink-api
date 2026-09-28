import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '../auth.constants.js';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
