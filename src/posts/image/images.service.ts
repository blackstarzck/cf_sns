import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageModel } from "src/common/entity/image.entity";
import { QueryRunner, Repository } from "typeorm";
import { CreatePostImageDto } from "./dto/create-image.dto";
import { basename, join } from "path";
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from "src/common/const/path.const";
import { promises } from "fs";


@Injectable()
export class PostsImagesService {
  constructor(
      @InjectRepository(ImageModel)
      private readonly imageRepository: Repository<ImageModel>
  ) { }

  getRepository(qr?: QueryRunner): Repository<ImageModel> {
      return qr ? qr.manager.getRepository<ImageModel>(ImageModel) : this.imageRepository;
    }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner){
      const repository = this.getRepository(qr);

      // dto의 이미지 이름을 기반으로
      // 파일의 경로를 생성한다.
      const tempFilePath = join(
        TEMP_FOLDER_PATH,
        dto.path,
      );
  
      try{
        await promises.access(tempFilePath); // 파일이 존재하는지 확인, 만약에 존재하지 않는다면 에
      }catch(e){
        throw new BadRequestException('존재하지 않는 파일입니다.');
      };
  
      const fileName = basename(tempFilePath); // 파일의 이름만 가져오기, 예를들어, /a/b/c.jpg 라면 c.jpg 만 가져온다.
  
      // {프로젝트 경로}/public/posts/c.jpg
      const newPath = join(
        POST_IMAGE_PATH,
        fileName
      );
  
      const result = await repository.save({
        ...dto,
      });
  
      await promises.rename(tempFilePath, newPath); // 파일 이동
    }
}