import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsIn, IsString } from "class-validator";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

export class PaginatePostDto extends BasePaginationDto {
    @IsNumber()
    @IsOptional()
    where__likeCount__more_than_or_equal?: number;

    @IsString()
    @IsOptional()
    where__title__i_like?: string;
}