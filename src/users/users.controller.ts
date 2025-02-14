import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialization: 직렬화: 현재 시스템에서 사용되는 데이터의 구조를 다른 시스템에서도 쉽게 사용할 수 있는 포맷으로 변환
   *  - class 의 object 에서 JSON 포맷으로 변환
   * 
   * deserialization: 역질렬화
   */
  @IsPublic()
  getUsers() {
    return this.usersService.getUsers();
  }

  // @Post()
  // postUser(
  //   @Body('nickname') nickname: string,
  //   @Body('email') email: string,
  //   @Body('password') password: string
  // ){
  //   return this.usersService.createUser({ nickname, email, password });
  // }
}
