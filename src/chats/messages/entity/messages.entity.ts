import { IsString } from "class-validator";
import { ChatsModel } from "src/chats/entity/chat.entity";
import { BaseModel } from "src/common/entity/base.entity";
import { UsersModel } from "src/users/entity/users.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class MessagesModel extends BaseModel {
  // 메시지가 어떤 채팅방에 있는지
  @ManyToOne(() => ChatsModel, chat => chat.messages, { onDelete: 'CASCADE' })
  chat: ChatsModel;


  // 메시지가 어떤 유저에 의해 작성되었는지
  @ManyToOne(() => UsersModel, user => user.messages, { onDelete: 'CASCADE' })
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}