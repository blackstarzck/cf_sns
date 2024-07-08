import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const QueryRunner = createParamDecorator((data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if(!req.queryRunner) throw new InternalServerErrorException('QueryRunnder Decorator를 사용하려면 TransactionInterceptor를 사용해야 합니다.');

    return req.queryRunner;
});