import { PickType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { CommentsModel } from "../entity/comments.entity";

export class CreateCommentDto extends PickType(CommentsModel, ['comment']) { }