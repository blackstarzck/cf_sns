import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, Query, Request, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto.';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransationInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';
import { RolesEnum } from 'src/users/const/roles.const';
import { Roles } from 'src/users/decorator/roles.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';


@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImageService: PostsImagesService,
    private readonly dataSource: DataSource
  ) {}

  // 1. GET /posts
  // 2. GET /posts/:id
  // 3. POST /posts
  // 4. PUT /posts
  // 5. DELETE /posts/:id

  @Get()
  // @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter) // main.ts. 에서 useGlobalFilters 로 설정해놨기 때문에 필요없다.
  @IsPublic()
  getPosts(
    @Query() query: PaginatePostDto
  ){
    // return this.postsService.getAllPosts();
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(
    @User() user: UsersModel
  ){
    await this.postsService.generatePosts(user.id);
    return true;
  }

  // @Get(':id/:name')
  @Get(':id')
  @IsPublic()
  getPost(
    @Param('name') name: string,
    @Param('id', ParseIntPipe) id: number // 파라미터가 여러개일 수 있다. :id/:name/:age 그 중 어떤 파라미터를 가져올지 Param 데코레이터 가져오고자 하는 파라미터 문자열을 넣어주면 된다
  ){
    return this.postsService.getPostById(id);
  }

  // A model, B model
  // Post API 로 A 모델을 저장하고, B 모델도 저장할때
  // await repository.save(A)
  // await repository.save(B)
  //
  // 만약 A 를 저장하다가 실패하면 B 를 저장하면 안될경우 all or nothing, 원상복구

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransationInterceptor)
  async postPosts(
    // @User() user: UsersModel, // 매번 authorId를 받아오는 것 보다, 어차피 Header 에 포함되어 있는 유저정보에서 가져오는 것이 더 효율적이다.
    @User('id') userId: number, // AccessTokenGuard 에서 이미 유저의 정보를 가져왔기 때문에, User 데코레이터를 통해 id 만 가져온다.
    //@Body('authorId') authorId: number, // 사용자 인증 없이 단순히 id 만으로 작성하는 것은 위험하다. 사용자 인증을 거쳐야 한다.
    // @Body('title') title: string,
    // @Body('content') content: string,
    // @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean
    @Body() body: CreatePostDto,
    /** 
     * 파이프 앞에 new 를 써도 되고 안써도 되지만, new 를 쓴 파이프는 매번 인슨터스를 생성.
     * new 가 없는 파이프는 DI 로써 기능한다. 새로운 인스턴스를 생성해서 사용하면 파라미터에 옵션을 넣을 수 있어 커스터마이징을 할 수 있다.
     * 반면 DI 로써 사용하면 파이프를 사용할 때 옵션을 넣을 수 없다.
    */
    @QueryRunner() qr: QR,
    // @Request() req: Request extends { queryRunner: QR } ? Request : { queryRunner: QR } 
  ){
    // const qr = req.queryRunner;

    // 1. SAVE 포스트를 만든다.
    const post = await this.postsService.createPost(userId, body, qr);

    // 2. SAVE 이미지 모델을 만든다.
    for(let i = 0; i < body.images.length; i++){
      await this.postsImageService.createPostImage({
        post,
        order: i,
        path: body.images[i],
        type: ImageModelType.POST_IMAGE
      }, qr);
    };

    return this.postsService.getPostById(post.id, qr);
  }

  /**
  * PUT은 전체 리소스를 업데이트 할 때 사용한다. PATCH는 부분 리소스를 업데이트 할 때 사용한다.
  * PUT은 리소스의 전체를 교체하는 것이기 때문에, 전체 리소스를 업데이트 할 때 사용한다.
  * 그렇기 때문에 PUT 은 업데이트할 모든 필드를 전달해야 한다.
  */
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    // @Body('title') title?: string,
    // @Body('content') content?: string
    @Body() body: UpdatePostDto
  ){
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @Roles(RolesEnum.ADMIN)
  deletePost(
    @Param('id', ParseIntPipe) id: number
  ){
    return this.postsService.deletePost(id);
  }

  // RBAC -> Role Based Access Control

}
