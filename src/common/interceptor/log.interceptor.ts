import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        /**
         * Request
         * 
         * Response
        */
        const now = new Date();
        const req = context.switchToHttp().getRequest();
        const path = req.originalUrl;

        console.log(`[REQUEST] ${path} ${now.toLocaleString('kr')}`);

        // next.handle()을 실행하는 순간
        // 라우트의 로직이 전부 실행되고 응답이 반환된다.
        // observable로 응답을 받을 수 있다.
        return next.handle().pipe(
            // tap(res => console.log("WHAT?? ", res)),
            tap(() => {
                console.log(`[RESPONSE] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}ms`);
            })
        );
    }
}