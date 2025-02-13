import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto.';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from 'src/common/const/env-keys.const';


export interface PostModel {
    id: number;
    author: string;
    title: string;
    content: string;
    likeCount: number;
    commentCount: number;
  }

@Injectable()
export class PostsService {

  constructor(
    @InjectRepository(PostsModel)
    private readonly postRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService
  ) { }

  async getAllPosts(){
    /* use-case 1 */
    // return this.postRepository.find({
    //   relations: ['author'],
    //   select: {
    //     id: true,
    //     title: true,
    //     content: true,
    //     likeCount: true,
    //     commentCount: true,
    //     author: {
    //       id: true,
    //       nickname: true
    //     }
    //   }
    // });

    /*
    * use-case 2: 메인 엔티티의 모든 컬럼 + 관계 맺은 엔티티의 특정 컬럼들을 select 할떄
    * use-case 1은 너무 길다.
    */
    const posts = await this.postRepository.find({
      relations: ['author', 'images']
    });
  
    // return posts.map(post => ({
    //   ...post,
    //   author: {
    //     id: post.author.id,
    //     nickname: post.author.nickname
    //   }
    // }));

    return posts;
  }

  async generatePosts(userId: number){
    for(let i = 0; i < 100; i++){
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목: ${i}`,
        content: `임의로 생성된 포스트 내용: ${i}`,
        images: []
      });
    }
  }

  // 오름차 순으로 정령하는 pagination만 구현
  async paginatePosts(dto: PaginatePostDto){
    // if(dto.page){
    //   return this.pagePaginatePosts(dto);
    // }else{
    //   return this.cursorPaginatePosts(dto);
    // };
    return await this.commonService.paginate(
      dto,
      this.postRepository,
      {
        relations: ['author', 'images', 'comments'],
      },
      'posts'
    );
  }

  async pagePaginatePosts(dto: PaginatePostDto){
    dto.page;
    const [ posts, count ] = await this.postRepository.findAndCount({
      skip: dto.take * (dto.page -1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt
      }
    });
    return {
      data: posts, totla: count
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto){
    const where: FindOptionsWhere<PostsModel> = { };

    if(dto.where__id__more_than){
      where.id = MoreThan(dto.where__id__more_than);
    } else if(dto.where__id__less_than){
      where.id = LessThan(dto.where__id__less_than);
    };

    const posts = await this.postRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt
      },
      take: dto.take
    });

    // 해당되는 포스트가 0개 이상이면
    // 마지막 포스트를 가져오고
    // 아니면 null
    const lastItem = posts.length > 0 && posts.length === dto.take ? posts[posts.length - 1] : null;
    const nextUrl = lastItem && new URL(`${this.configService.get<string>(ENV_PROTOCOL_KEY)}://${this.configService.get<string>(ENV_HOST_KEY)}/posts`); // node

    // 파라미터 세팅
    if(nextUrl){
      for(const key of Object.keys(dto)){
        if(dto[key]){
          if(key !== 'where__id_more_than' && key !== 'where__id_less_than') nextUrl.searchParams.append(key, dto[key]);
        };
      };
      let key = null;
      if(dto.order__createdAt === 'ASC') key = 'where__id_more_than';
      if(dto.order__createdAt === 'DESC') key = 'where__id_less_than';
      nextUrl.searchParams.append(key, lastItem.id.toString());
    };

    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null
    };
  }

  async getPostById(id: number, qr?: QueryRunner){
    const repository = this.getRepository(qr);
    
    const find = await repository.findOne({
      relations: ['author', 'images', 'comments'],
      where: { id }
    });

    if(!find) throw new NotFoundException();

    return find;
  }

  getRepository(qr?: QueryRunner): Repository<PostsModel> {
    return qr ? qr.manager.getRepository<PostsModel>(PostsModel) : this.postRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner){
    const repository = this.getRepository(qr);
    
    const post = repository.create({
      author: {
        id: authorId
      },
      ...postDto,
      images: [],
      likeCount: 0,
      commentCount: 0
    });
    
    return await repository.save(post);
  }

  async updatePost(postId: number, body: UpdatePostDto){
    const { title, content } = body;
    const find = await this.postRepository.findOne({ where: { id: postId } });
  
    if(!find) throw new NotFoundException();

    if(title) find.title = title;
    if(content) find.content = content;
  
    return await this.postRepository.save(find);;
  }

  async deletePost(id: number){
    const find = await this.postRepository.findOne({ where: { id } });
  
    if(!find) throw new NotFoundException();

    return this.postRepository.delete(id);
  }

  async checkPostExistsById(id: number){
    return this.postRepository.exists({
      where: { id }
    });
  }
}
