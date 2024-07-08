import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image')) // 이미지를 업로드 할 때 사용하는 인터셉터
  @UseGuards(AccessTokenGuard)
  postImage(
    @UploadedFile() file: Express.Multer.File
  ){
    return {
      fileName: file.filename
    };
  }

}
