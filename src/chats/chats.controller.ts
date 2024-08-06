import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PaginateChatDto } from './dto/paginate-chat-dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  paginateChat(
    @Query() paginateChatDto: PaginateChatDto
  ) {
    return this.chatsService.paginateChats(paginateChatDto);
  }

}
