import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chat.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateChatDto } from './dto/paginate-chat-dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService
  ){}

  paginateChats(dto: PaginateChatDto){
    return this.commonService.paginate(dto, this.chatsRepository, {
      relations: { users: true }
    }, 'chats');
  }

  async create(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      users: dto.userIds.map(id => ({ id }))
    });
    return this.chatsRepository.findOne({ where: { id: chat.id } })
  }

  async checkIfChatExist(chatId: number){
    const exists = await this.chatsRepository.exists({ where: { id: chatId } });
    return exists
  }
}
