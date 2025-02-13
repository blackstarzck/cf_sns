import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    /**
     * UsersService 를 사용하기 위해 UsersModule을 import 하고
     * UsersModule 에서는 UsersService를 export 해야 한다.
     */
    UsersModule,
    JwtModule.register({})
  ],
  exports: [AuthService], // 다른 모듈에서도 사용할 수 있도록
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
