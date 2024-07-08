import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, NestInterceptor } from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransationInterceptor implements NestInterceptor {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        req.queryRunner = qr;

        return next.handle().pipe(
            catchError(async (e) => {
                await qr.rollbackTransaction();

                throw new InternalServerErrorException(e.message);
            }),
            tap(async () => {
                await qr.commitTransaction();
                await qr.release();
            })
        );
    }
}