import { BadRequestException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { PostsService } from "src/posts/posts.service";

@Injectable()
export class PostExistsMiddleware implements NestMiddleware{
  constructor(
    private readonly postsService: PostsService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if(!postId) {
      throw new BadRequestException('postId 가 존재하지 않습니다.');
    };

    const exists = await this.postsService.checkPostExistsById(+postId);

    if(!exists) {
      throw new BadRequestException('Post 가 존재하지 않습니다.');
    };

    next();
  }
}