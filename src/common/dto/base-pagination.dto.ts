import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsIn } from "class-validator";

export class BasePaginationDto {
    @IsNumber()
    @IsOptional()
    page?: number;

    // 이전 마지막 데이터의 ID
    // 이 프로퍼티에 입력된 ID 보다 높은 ID 부터 값을 가져오기
    // @Type(() => Number) // URL 은 문자열이다. 그렇기때문에 숫자로 변환해주는 작업이 필요하다.
    @IsNumber()
    @IsOptional()
    where__id__more_than?: number;

    @IsNumber()
    @IsOptional()
    where__id__less_than?: number;

    // 정렬
    // createdAt 생성된 시간의 내림차/오름차 순으로 정렬
    @IsIn(['ASC', 'DESC']) // 정확한 값을 넣을때. 배열에는 여러개의 값이 들어갈 수 있고, 그 중 하나라도 포함되어 있어야 한다.
    @IsOptional()
    order__createdAt?: 'ASC' | 'DESC' = 'ASC' ; // <- main.ts 에서 useGlobalPipes의 인자 "ValidationPipe" 에서 transform: true 를 해주면, 값이 없을때 기본값을 설정할 수 있다.

    // 몇개의 데이터를 응답으로 받을
    @IsNumber()
    @IsOptional()
    take?: number = 20;
}