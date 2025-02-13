import { IsOptional, IsString } from "class-validator";
import { PostsModel } from "../entity/posts.entity";
import { PartialType, PickType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";
import { stringValidationMessage } from "src/common/validation-message/string-validation-message";

// Pick, Omit, Partial → Type을 반환
// PickType, OmitType, PartialType → 값을 반환

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsString({ message: stringValidationMessage })
    @IsOptional()
    title?: string; // PartialType 으로해야지 ?: 를 사용할 수 있다.

    @IsString({ message: stringValidationMessage })
    @IsOptional()
    content?: string;
}