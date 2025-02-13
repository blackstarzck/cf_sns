import { PickType } from "@nestjs/mapped-types";
import { MessagesModel } from "../entity/messages.entity";
import { IsNumber } from "class-validator";

export class CreateMessagesDto extends PickType(MessagesModel, ['message']){
  @IsNumber()
  chatId: number;


  // access token 으로 유저를 확인하는 것임 월래
  // @IsNumber()
  // authorId: number;
}