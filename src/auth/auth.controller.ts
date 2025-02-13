import { Body, Controller, Post, Headers, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe, PasswordPipe } from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { AccessTokenGuard, RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(
    @Headers('authorization') rawToken: string // Header 에서 authorization 키의 값을 가져옴
  ){
    const token = this.authService.extractTokenFromHeader(rawToken, true); // Bearer {token} → {token}
    const newTOken = this.authService.rotateToken(token, false);

    return { accessToken: newTOken };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(
    @Headers('authorization') rawToken: string // Header 에서 authorization 키의 값을 가져옴
  ){
    const token = this.authService.extractTokenFromHeader(rawToken, true); // Bearer {token} → {token}
    const newTOken = this.authService.rotateToken(token, true);

    return { refreshToken: newTOken };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string, // Header 에서 authorization 키의 값을 가져옴
    // @Body('email') email: string,
    // @Body('password') password: string
    @Request() req // guard 에서 세팅한 Request 오브젝트에 UsersModel 정보가 계속 담겨있다.
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, false); // email:password → base64
    const credentials = this.authService.decodeBasicToken(token); // base64 → [email, password]

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic()
  postRegisterEmail(
    @Body() body: RegisterUserDto
    // @Body('email') email: string,
    // @Body('nickname') nickname: string,
    // @Body('password', new MaxLengthPipe(8), new MinLengthPipe(3)) password: string
  ) {
    return this.authService.registerWithEmail(body);
  }
}
