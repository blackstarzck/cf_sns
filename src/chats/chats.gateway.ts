import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    namespace: 'chats' // ws://localhost:3000/chats
})
export class ChatsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

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
        this.server.in(
            message.chatId.toString()
        ).emit('receive_message', message.message); // namespace: chats 으로 연결되어 있는 모든 클라이언트에게 메시지를 보냅니다.
    }
}