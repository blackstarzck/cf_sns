import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginatePostDto } from '../dto/paginate-post.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { TransationInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginateChatDto } from 'src/chats/dto/paginate-chat-dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentDto } from './dto/update-comments.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {

  }

  @Get()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateChatDto
  ){
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  getComment(
    @Param('commentId', ParseIntPipe) commentId: number,
  ){
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransationInterceptor)
  async postComment(
    @User() user: UsersModel,
    @Body() body: CreateCommentDto,
    @Param('postId', ParseIntPipe) postId: number
  ){
    const comment = await this.commentsService.createComment(user, postId, body);

    return this.commentsService.getCommentById(comment.id);
  }

  @Patch(':commentId')
  @UseGuards(AccessTokenGuard)
  async patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDto,
  ){
    return this.commentsService.updateComment(commentId, body);
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number
  ){
    return this.commentsService.deleteComment(commentId);
  }
}
