import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './cont/default-comment-find-options.const';
import { UpdateCommentDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner): Repository<CommentsModel> {
    return qr ? qr.manager.getRepository<CommentsModel>(CommentsModel) : this.commentsRepository;
  }

  async getCommentById(id: number){
    const find = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: { id }
    });

    if(!find) throw new NotFoundException(`id: ${id} Comment 는 존재하지 않습니다.`);

    return find;
  }

  async createComment(author: UsersModel, postId: number, postDto: CreateCommentDto){
    const comment = this.commentsRepository.create({
      author,
      post: {
        id: postId
      },
      ...postDto
    });

    return await this.commentsRepository.save(comment);
  }

  async paginateComments(dto: PaginateCommentsDto, postId: number){
    return await this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        relations: ['author'],
        where: {
          post: {
            id: postId
          }
        }
      },
      `posts/${postId}/comments`
    );
  }

  async updateComment(id: number, dto: UpdateCommentDto){
    const comment = await this.commentsRepository.findOne({
      where: { id }
    });
    
    if(!comment) throw new BadRequestException(`id: ${id} Comment 는 존재하지 않습니다.`);

    const prevComment = await this.commentsRepository.preload({
      id,
      ...dto
    });
    const newComment = await this.commentsRepository.save(prevComment);
    return newComment;
  }

  async deleteComment(id: number){
    const comment = await this.commentsRepository.findOne({
      where: { id }
    });
    
    if(!comment) throw new BadRequestException(`id: ${id} Comment 는 존재하지 않습니다.`);
    
    await this.commentsRepository.delete(id);

    return id;
  }
}
