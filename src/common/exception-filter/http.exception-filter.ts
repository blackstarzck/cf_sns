import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException) // HTTP Exception 만 잡는다.
export class HttpExceptionFilter implements ExceptionFilter {
    catch(
        exception: HttpException, // 잡은 exception 을 받는다.
        host: ArgumentsHost // host 객체를 받는다. ExcutionContext 와 비슷하다??
    ) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();
        const status = exception.getStatus();

        response
            .status(status)
            .json({
                statusCode: status,
                message: exception.message,
                timestamp: new Date().toLocaleString('kr'),
                path: request.url
            });
    }
}