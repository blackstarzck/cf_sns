import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersModel
    ]),
  ],
  exports: [UsersService], // 다른 모듈에서도 사용할 수 있도록
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
