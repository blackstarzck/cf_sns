import { IsOptional, IsString } from "class-validator";
import { PostsModel } from "../entity/posts.entity";
import { PickType } from "@nestjs/mapped-types";

// Pick, Omit, Partial → Type을 반환
// PickType, OmitType, PartialType → 값을 반환


// export class CreatePostDto extends Pick<PostsModel, 'title' | 'content'> {
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
    // @IsString({ message: '제목은 문자열로 입력해주세요.' })
    // title: string;

    // @IsString({ message: '내용은 문자열로 입력해주세요.' })
    // content: string;

    @IsString({
        each: true // 모든 값이 string
    })
    @IsOptional()
    images: string[];
}