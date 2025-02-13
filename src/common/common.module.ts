import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer'
import { TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 10000000 // bytes
      },
      fileFilter: (req, file, callBack) => { // 유효성검사
        /**
         * callback(에러, boolean)
         * 
         * 에러: 에러가 발생하면 에러 객체를 전달하고, 그렇지 않으면 null을 전달합니다.
         * boolean: 파일을 받을지 말지 결정하는 boolean 값을 전달합니다.
         */
        const ext = extname(file.originalname) // 만약 xxx.jpg 의 확장자가 jpg라면 .jpg를 반환합니다.
        if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callBack(new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'), false);
        };
        return callBack(null, true)
      },
      storage: multer.diskStorage({
        destination: (req, file, callBack) => {
          callBack(null, TEMP_FOLDER_PATH) // 디렉토리가 있는지 꼭 확인해야함.
        },
        filename: (req, file, callBack) => {
          callBack(null, `${uuid()}${extname(file.originalname)}`); // 123123-123123-123123-123123.jpg
        }
      })
    })
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService]
})
export class CommonModule {}
