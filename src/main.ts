import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class-validator 를 사용하기 위해 ValidationPipe 를 사용한다.
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // entity 에 있는 프로퍼티에 디폴트 값을 넣고싶을때 설정한다. 만약 transform 이 없으면 값을 할당을 했더라도 할당된 값으로 인식하지 않는다.
    transformOptions: {
      // 이 옵션을 true 로 설정하면, 파이프가 타입을 변환할 수 있는 경우 자동으로 변환해준다.
      // URL 은 문자열이다. 그렇기때문에 class-validator 의 IsNumber 데코레이터를 사용하면 에러가 발생한다.
      // 이를 해결하기위해 class-validator 에서 제공하는 @Type 데코레이터를 사용할 수 있지만, enableImplicitConversion: true 를 설정해도 같은 효과를 낼 수 있다.
      enableImplicitConversion: true
    },
    whitelist: true, // DTO 에 없는 프로퍼티는 제거한다. 사용자가 보내는 허가되지 않은 프로퍼티를 제거한다. 만약 제 3자가 악의적으로 데이터에 접근하려고 할때, 이 옵션을 사용하면 보안에 도움이 된다.
    // 예를 들어, CreateUserDto 에 nickname, email, password 만 있는데, age 를 보내면 age 를 제거한다.
    forbidNonWhitelisted: true, // DTO 에 없는 프로퍼티가 있을때 에러를 발생시킨다. whitelist 가 true 일때만 사용할 수 있다.
    // 예를 들어, 만약 CreateUserDto 에 nickname, email, password 만 있는데, age 를 보내면 에러를 발생시킨다.
  }));

  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
