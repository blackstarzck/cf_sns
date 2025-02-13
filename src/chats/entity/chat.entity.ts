import { BaseModel } from "src/common/entity/base.entity";
import { UsersModel } from "src/users/entity/users.entity";
import { Entity, ManyToMany, OneToMany } from "typeorm";
import { MessagesModel } from "../messages/entity/messages.entity";

@Entity()
export class ChatsModel extends BaseModel {
  // primary key 끼리 연결된다.
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[]

  @OneToMany(() => MessagesModel, (message) => message.chat, { cascade: true })
  messages: MessagesModel;
}