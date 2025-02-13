import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "src/posts/entity/posts.entity";
import { BaseModel } from "src/common/entity/base.entity";
import { IsEmail, IsString, Length, ValidationArguments } from "class-validator";
import { lengthValidationMessage } from "src/common/validation-message/length-validation-message";
import { stringValidationMessage } from "src/common/validation-message/string-validation-message";
import { emailValidationMessage } from "src/common/validation-message/email-validation-message";
import { Exclude, Expose } from "class-transformer";
import { ChatsModel } from "src/chats/entity/chat.entity";
import { MessagesModel } from "src/chats/messages/entity/messages.entity";
import { CommentsModel } from "src/posts/comments/entity/comments.entity";

@Entity()
//@Exclude() // 모두 숨길때 모델 쪽 데코레이터에 적용한다. 노출시키고자 하는 프로퍼티는 아래에서 @Expose 를 일일이 적용해야한다.
export class UsersModel extends BaseModel {
    @Column({
        length: 20,
        unique: true // 서버에서 확인하는 부
    })
    @IsString({ message: stringValidationMessage })
    @Length(1, 20, {
        // message: '닉네임은 1~20자 사이로 입력해주세요.'
        message: lengthValidationMessage
    })
    nickname: string;

    @Column({
        unique: true
    })
    @IsString({ message: stringValidationMessage })
    @IsEmail({}, { message: emailValidationMessage })
    email: string;

    /**
     * 실제로 존재하지 않는 프로퍼티를 만들어서 사용할 수 있다.
     */
    // @Expose()
    // get nicknameAndEmail(): string {
    //     return `${this.nickname}/${this.email}`;
    // }

    @Column()
    @IsString({ message: stringValidationMessage })
    @Length(3, 8, { // controller 에서도 사용할 수 있지만, entity 에서도 사용할 수 있다.
        message: lengthValidationMessage
    })
    @Exclude({
        toPlainOnly: true, // Response 일떄만 적용된다.
        // toClassOnly: true,
    }) 
    // controller 에서 @UseInterceptors(ClassSerializerInterceptor) 와 함께 써야한다.
    // @Expose, @Exclude 데코레이터를 사용하기 위해서는 controller 핸들러에서 매번 적용해야하는 번거로움이 있다.
    // app.module.ts 에서 provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor 를 사용하면 모든 자식 모듈에 적용된다.
    /**
     * Request
     * front 에서 back
     * plain object (JSON) -> class instance (dto) 로 변환
     * 
     * Response
     * back 에서 front
     * class instance (dto) -> plain object (JSON) 로 변환
     * 
     * toClassOnly: class instance 로 변환될때만. 즉, Request 일때만
     * toPlainOnly: plain object 로 변환될때만. 즉, Response 일때만
     * 
     * 두 개 모두 없을때는 둘다 적용된다.
     * 
     * 비밀번호의 경우,  front 에서 보낸건 받아야하고 반대로 back에서는 보낼 필요가 없다.
     * 그렇기 때문에 toPlainOnly: true 만 너어주면 된다. 응답할때만 숨기겠다는 뜻이다.
     * 
     */
    password: string;

    @Column({
        default: RolesEnum.USER,
    })
    role: RolesEnum

    @OneToMany(() => PostsModel, post => post.author)
    posts: PostsModel[]

    @ManyToMany(() => ChatsModel, chat => chat.users)
    @JoinTable()
    chats: ChatsModel[]

    @OneToMany(() => MessagesModel, message => message.author)
    messages: MessagesModel[];

    @OneToMany(() => CommentsModel, comment => comment.author)
    postComments: CommentsModel[];
}