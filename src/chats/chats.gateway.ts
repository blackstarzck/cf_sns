import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    namespace: 'chats' // ws://localhost:3000/chats
})
export class ChatsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server; // socket.io 서버 객체.

    // web socket 이 연결되면 실행되는 메서드
    handleConnection(socket: Socket, ...args: any[]) {
        console.log(`on connect called: ${socket.id}`);
    }

    @SubscribeMessage('enter_chat')
    enterChart(
        @MessageBody() data: number[],
        @ConnectedSocket() socket: Socket
    ) {
        for(const chatId of data){
            // Socket.join();
            socket.join(chatId.toString());
        }
    }

    // socket.on('send_message', (message) => {}))
    @SubscribeMessage('send_message')
    sendMessage(
        @MessageBody() message: { message: string, chatId: number },
        @ConnectedSocket() socket: Socket
    ) {
        // console.log("message: ", message);

        // this.server.emit('receive_message', 'hello from server~!'); // ← 모든 클라이언트에게 메시지를 보낸다

        // 서버에서 보낸(emit) 메시지를 listening 하기 위해서는,
        // 포스트맨에서 Events 탭에 receive_message 이벤트를 등록해야 한다.

        // ↓ namespace: chats 으로 연결되어 있고 chatId 방에 있는 모든 클라이언트에게 메시지를 보냅니다.
        this.server.in(
            message.chatId.toString()
        ).emit('receive_message', message.message); // namespace: chats 으로 연결되어 있는 모든 클라이언트에게 메시지를 보냅니다.
    }
}