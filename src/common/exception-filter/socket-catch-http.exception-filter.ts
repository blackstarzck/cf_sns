import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";


@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> { // 여기서 HttpException 은 socket 에서 발생한 exception 이다.
  catch(exception: HttpException, host: ArgumentsHost): void {
      const socket = host.switchToWs().getClient(); // .API 에서 사용하는 host.switchToHttp() 와 다르다.
      const message = {
        data: exception.getResponse(),
      };

      // listen 하는 곳에서 exception 이벤트를 받아서 처리할 수 있다.
      // socket 의 emit 메서드는 "연결된 사용자" 에게만 보주는 기능을 한다.
      socket.emit('exception', message);
    }
}