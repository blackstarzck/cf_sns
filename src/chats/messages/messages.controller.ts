import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ChatMessagesService } from "./messages.service";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: ChatMessagesService
  ){}

  @Get()
  paginateMessages(
    @Param('cid', ParseIntPipe) id: number,
    @Query() dto: BasePaginationDto
  ){
    return this.messagesService.paginateMessages(
      dto,
      {
        where: {
          chat: { id }
        },
        relations: ['author', 'chat']
      }
    );
  }
}