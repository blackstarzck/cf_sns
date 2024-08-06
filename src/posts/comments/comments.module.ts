import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { CommonModule } from 'src/common/common.module';
import { UsersModel } from 'src/users/entity/users.entity';
import { PostsModel } from '../entity/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PostExistsMiddleware } from './middleware/post-exists.middleware';
import { PostsModule } from '../posts.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommonModule,
    PostsModule,
    TypeOrmModule.forFeature([
      CommentsModel
    ])
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
