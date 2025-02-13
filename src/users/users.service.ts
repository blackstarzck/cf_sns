import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>
    ) {
        
    }

    async getUsers() {
        const users = await this.usersRepository.find();

        return users;
    }

    async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
        // 1. nickname 중복이 없는지 확인
        // old: findOne() → 만약에 조건에 해당되는 값이 있으면 반환, 없으면 null 반환
        // new: exist() → 만약에 조건에 해당되는 값이 있으면 true 반환
        const nicknameExists = await this.usersRepository.exists({
            where: { nickname: user.nickname }
        });

        if(nicknameExists) throw new BadRequestException('이미 존재하는 nickname 입니다.');

        const emailExists = await this.usersRepository.exists({
            where: { email: user.email }
        });

        if(emailExists) throw new BadRequestException('이미 가입한 email 입니다.');

        const userObj = this.usersRepository.create({
            nickname: user.nickname,
            email: user.email,
            password: user.password
        });
        const newUser = await this.usersRepository.save(userObj);

        return newUser;
    }

    async getUserByEmail(email: string) {
        return await this.usersRepository.findOne({
            where: { email }
        });
    }
}
