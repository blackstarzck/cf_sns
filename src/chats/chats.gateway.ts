import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from "@nestjs/websockets";
import {
    Server,
    Socket
} from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { EnterChatDto } from "./dto/enter-chat.dto";
import { CreateMessagesDto } from "./messages/dto/create-messages.dto";
import { ChatMessagesService } from "./messages/messages.service";
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { SocketCatchHttpExceptionFilter } from "src/common/exception-filter/socket-catch-http.exception-filter";
import { SocketBearerTokenGuard } from "src/auth/guard/socket/socket-bearer-token.guard";
import { UsersModel } from "src/users/entity/users.entity";
import { UsersService } from "src/users/users.service";
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({
    namespace: 'chats' // ws://localhost:3000/chats
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: ChatMessagesService,
        private readonly userService: UsersService,
        private readonly authService: AuthService
    ){}

    @WebSocketServer()
    server: Server; // socket.io 서버 객체.

    // lifecycle method
    afterInit(server: any) {
        // 파라미터 server 와 this.server 는 같은 객체이다.
        console.log(`after gateway init: ${server}`);
    }

    // lifecycle method
    handleDisconnect(client: any) {
        console.log(`on disconnect called: ${client.id}`);
    }

    // lifecycle method
    // websocket 이 연결되면 실행되는 메서드, OnGatewayConnection 인터페이스를 구현해야 한다.
    async handleConnection(socket: Socket & { user: UsersModel }) {
        console.log(`on connect called: ${socket.id}`);

        const headers = socket.handshake.headers;
        const rawToken = headers['authorization']; // Bearer xxxx
    
        if(!rawToken){
            socket.disconnect();
            // throw new WsException('토큰이 없습니다!');
        }
    
        try{
          const token = this.authService.extractTokenFromHeader(rawToken, true);
          const payload = this.authService.verifyToken(token);
          const user = await this.userService.getUserByEmail(payload.email);
      
          // 사용자정보를 socket 객체에 저장하고, socket event 핸들러에서 사용할 수 있다.
          socket.user = user;
    
          return true;
        }catch(e){
            socket.disconnect();
        //   throw new WsException('토큰이 유효하지 않습니다.');
        }
    }

    // websocket 의 gateway 에서도 class-validator 의 validation pipe 를 이용할 수 있다.
    // 아래와 같이 핸들러 마다 번거롭지만 각각 설정해줘야 한다.
    // 그런데, 이렇게 ValidationPipe 만 설정하면 internal server error 가 클라이언트쪽에서 발생하고,
    // 서버는 BadRequestException 을 발생시킨다.
    // 그 이유는, 우선, DTO 에서는 유효성 검사를 통과했지만, exception filter 에서 에러를 잡지 못한 것이다.
    // API 에서의 모든 exception 들은 HTTP 를 extend 하고 있지만, websocket 은 HTTP 가 아니기 때문에 exception 을 잡지 못한다.
    // 그렇기 때문에 try catch 문에서는 에러를 잡을 수 없어서 WsException 객체를 생성해주어야 한다.
    // API 에서 처럼 exception filter 를 사용할 수 없기 때문에 websocket 에서는 exception 을 잡기 위해서 WsException 을 사용해야 한다.
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        },
        whitelist: true,
        forbidNonWhitelisted: true
    })) // class-validator 를 사용하기 위한 pipe
    @UseFilters(SocketCatchHttpExceptionFilter) // socket 의 exception 을 잡기 위한 filter
    // ↓ 토큰의 유무를 확인 후 headers 에 있는 토큰을 검증하기 위한 guard
    // 단점: 만료기간이 있는 토큰으로 인해, 계속해서 토큰을 검증해야 한다.
    // 만약 connect 상태에서 토큰이 만료된다면,  SocketBearerTokenGuard 에 의해 exception 이 발생한다.
    // @UseGuards(SocketBearerTokenGuard) 
    @SubscribeMessage('create_chat')
    async createChat(
        @MessageBody() data: CreateChatDto,
        @ConnectedSocket() socket: Socket & { user: UsersModel } // SocketBearerTokenGuard 가 통과되면, socket 객체에 user 프로퍼티가 추가된다.
    ) {
        const chat = await this.chatsService.create(data);
    }

    @SubscribeMessage('enter_chat')
    // @UseGuards(SocketBearerTokenGuard)
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        },
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    @UseFilters(SocketCatchHttpExceptionFilter)
    async enterChart(
        @MessageBody() data: EnterChatDto, // 방의 id 를 리스트로 받는다. 유저1은 1번, 2번.. 여러개의 방에 들어갈 수 있다.
        @ConnectedSocket() socket: Socket & { user: UsersModel }
    ) {
        // for (const chatId of data) {
        //     // Socket.join();
        //     socket.join(chatId.toString()); // 방에 입장
        // }
        for(const chatId of data.chatIds){
            const exists = await this.chatsService.checkIfChatExist(chatId);

            if(!exists){
                /**
                 * 아래 exception 에러에 대한 객체를 받기 위해서는 psotman 에서 Events 탭에 exception 이벤트를 등록해야 한다.
                 */
                throw new WsException({
                    code: 100,
                    message: `존재하지 않는 chat 입니다. chatId: ${chatId}`
                });
            }
        }
        socket.join(data.chatIds.map(x => x.toString()));
    }

    // socket.on('send_message', (message) => {}))
    @SubscribeMessage('send_message')
    @UsePipes(new ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true
        },
        whitelist: true,
        forbidNonWhitelisted: true
    }))
    @UseFilters(SocketCatchHttpExceptionFilter)
    async sendMessage(
        @MessageBody() dto: CreateMessagesDto,
        @ConnectedSocket() socket: Socket & { user: UsersModel }
        
    ) {
        const chatExists = await this.chatsService.checkIfChatExist(dto.chatId);

        if(!chatExists) throw new WsException(`존재하지 않는 채팅방입니다. Chat ID: ${dto.chatId}`);

        // 메시지 생성 후 message 변수에 저장
        const message = await this.messagesService.createMessage(dto, socket.user.id);
        /**
         * 여기서 receive_message 는 클라이언트에서 보낸 메시지를 받는 이벤트 이름이다.
         * postman 에서 Event 탭에 receive_message 이벤트를 등록하고 listening 을 체크해줘야 한다.
         */


        // console.log("message: ", message);

        // this.server.emit('receive_message', 'hello from server~!'); // ← 모든 클라이언트에게 메시지를 보낸다

        // 서버에서 보낸(emit) 메시지를 listening 하기 위해서는,
        // 포스트맨에서 Events 탭에 receive_message 이벤트를 등록해야 한다.

        // ↓ namespace: chats 으로 연결되어 있고 chatId 방에만 있는 모든 클라이언트에게 메시지를 보냅니다.
        // this.server.in(
        //     message.chatId.toString()
        // ).emit('receive_message', message.message); // namespace: chats 으로 연결되어 있는 모든 클라이언트에게 메시지를 보냅니다.


        // ↓ 브로드 캐스팅. 나를 제외한 모든 클라이언트에게 메시지를 보냅니다.
        // socket 의 emit 메서드는 "연결된 사용자" 에게만 보주는 기능을 한다.
        socket.to(message.chat.id.toString()).emit('receive_message', message.message); // 방에 있는 모든 클라이언트에게 메시지를 보냅니다.
    }
}