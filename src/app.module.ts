import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, Req, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entity/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entity/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ENV_DB_DATABASE_KEY, ENV_DB_HOST_KEY, ENV_DB_PASSWORD_KEY, ENV_DB_PORT_KEY, ENV_DB_USERNAME_KEY } from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddleWare } from './common/middleware/log.middleware';
import { ChatsModule } from './chats/chats.module';
import { ChatsModel } from './chats/entity/chat.entity';
import { MessagesModel } from './chats/messages/entity/messages.entity';
import { CommentsModule } from './posts/comments/comments.module';
import { CommentsModel } from './posts/comments/entity/comments.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    UsersModule,
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // 데이터베이스 타입
      host: process.env[ENV_DB_HOST_KEY],
      port: +process.env[ENV_DB_PORT_KEY],
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [
        PostsModel,
        UsersModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel
      ],
      synchronize: true // 개발환경에서는 편의상 true, 프로덕션 환경에서는 false
    }),
    AuthModule,
    CommonModule,
    ServeStaticModule.forRoot({
      // 이미지 파일 보는 경로를 설정해준다.
      // controller 에 있는 경로와 곂치면 안되기 때문에 주의해야함.
      // 예를 들어, /public/posts/xxx.jpg 라는 경로로 요청이 들어와야 한다.
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public'
    }),
    ChatsModule,
    CommentsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // 모든 자식 모듈들에게 적용된다. @Expose, @Exclude 데코레이터를 사용할 수 있다.
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ],
})
export class AppModule implements NestModule {
  // traffic 과 관련된 로그들을 미들웨어로 처리하면 좋다.
  
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleWare).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    });
  }
}
