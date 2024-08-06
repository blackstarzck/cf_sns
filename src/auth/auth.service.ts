import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService, getConfigToken } from '@nestjs/config';
import { ENV_HASH_ROUNDS_KEY, ENV_JWT_SECRET_KEY } from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ) {
        
    }
    /**
     * 1. 사용자가 회원가입을 하면 accessToken 과 refreshToken을 발급받는다.
     * 2. 로그인 할때는 Header에 Basic 토큰을 담아 요청을 보낸다.
     *    Basic 토큰은 '이메일:비밀번호'를 base64로 인코딩한 값이다.
     *    예) {authorization: 'Basic { token }'}
     * 3. 아무나 접근할 수 없는 정보를 접근할떄는 accessToken 을 Header에 추가해서 요청과 함께 보낸다.
     *    예) {authorization : 'Bearer { token }'}
     * 4. 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
     *    예를들어서 현재 로그인한 사용자가 작성한 포스트만 가져오려면
     *    토큰의 sub 값에 입력되어 있는 사용자의 포스트만 따로 필터링 할 수 있다.
     *    특정 사용자의 토큰이 없다면 다른 사용자의 포스트를 가져오려고 할때 401 에러를 반환한다. (접근하지 못하게 한다.)
     */

    /**
     * JSON 형태
     * {authorization: 'Basic { token }'}
     * {authorization: 'Bearer { token }'}
     */

    extractTokenFromHeader(header: string, isBearer: boolean) {
        const splitToken = header.split(' ');
        const prefix = isBearer ? 'Bearer' : 'Basic';

        if(splitToken.length !== 2 || splitToken[0] !== prefix){
            throw new UnauthorizedException('[1] 잘못된 토큰 형식입니다.');
        };

        const token = splitToken[1];
        return token;
    }

    /**
     * 1. 토큰을 디코딩한다. email:password
     * 2. 디코딩된 토큰을 ':'로 나눈다. => [email, password]
     * 3. 이렇게 반환시킨다. { email: email, password: password }
     */
    decodeBasicToken(base64String: string){
        const decoded = Buffer.from(base64String, 'base64').toString('utf8'); // Buffer 는 Node.js 에서 제공하는 객체
        const split = decoded.split(':');

        if(split.length !== 2) throw new UnauthorizedException('[2] 잘못된 토큰 형식입니다.');

        const email = split[0];
        const password = split[1];

        return { email, password };
    }

    verifyToken(token: string){
        try{
            return this.jwtService.verify(token, {
                secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
            });
        }catch(e){
            throw new UnauthorizedException('토큰이 만료되었거나 잘못된 토큰입니다.');
        };

    }

    rotateToken(token: string, isRefreshToken: boolean){
        const decoded = this.verifyToken(token);

        if(decoded.type !== 'refresh'){
            throw new UnauthorizedException('토큰 재발급은 Refresh 토큰만 가능합니다.');
        };

        return this.signToken({ ...decoded }, isRefreshToken);
    }


    /**
     * 기능 정리
     * 1. registerWithEmail
     *  - email, nickname, password를 입력받고 사용자를 생성한다.
     *  - 생성이 완료되면 accessToken 과 refreshToken을 반환한다. (회원가입 후 다시 로그인)
     * 
     * 2. loginWithEmail
     *  - email, password를 입력받고 사용자 검증을 진행한다.
     *  - 검증이 완료되면 accessToken 과 refreshToken을 반환한다. (로그인)
     * 
     * 3. loginUser
     *  - 1과 2에서 필요한 accessToken 과 refreshToken을 반환하는 로직
     * 
     * 4. signToken
     *  - 3에서 필요한 accessToken 과 refeshToken을 sign 하는 로직
     * 
     * 5. authenticateWithEmailAndPassword
     *  - 2에서 로그인을 진행할때 필요한 기본적인 검증 진행
     *      1. email이 존재하는지
     *      2. password가 일치하는지
     *      3. 모두 통과되면 찾은 사용자 정보 반환
     *      4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
     */

    
    loginUser(user: Pick<UsersModel, 'email' | 'id'>){
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        };
    }

    signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access'
        }
        // password 와 같은 중요한 정보는 payload에 넣지 않는다.
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
            expiresIn: isRefreshToken ? 3600 : 300 // ms
        });
    }

    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>){
        const existingUser = await this.usersService.getUserByEmail(user.email);

        if(!existingUser){
            throw new UnauthorizedException('사용자 정보가 없습니다.');
        };

        /**
         * 1. 사용자가 입력한 비밀번호
         * 2. 기존 hash 와 사용자 정보에 저장되어 있는 hash 비교 
         */
        const passOk = await bcrypt.compare(
            user.password, // 순수 비밀번호 (bcrypt.compare() 에서 자동으로 salt를 가져와 비교한다.)
            existingUser.password // hash 로 저장되어 있는 비밀번호
        );
        if(!passOk){
            throw new UnauthorizedException('비밀번호가 틀렸습니다.');
        };

        return existingUser;
    }

    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>){
        const existingUser = await this.authenticateWithEmailAndPassword(user);

        return this.loginUser(existingUser);
    }

    async registerWithEmail(user: RegisterUserDto){
        const { nickname, email, password } = user;
        const hash = await bcrypt.hash(
            user.password,
            +this.configService.get<string>(ENV_HASH_ROUNDS_KEY)  // round: hash를 생성할 때 사용할 salt의 길이(값이 클수록 보안이 높아지지만 느려짐, npm bcrypt 참고)
        );
        // salt 는 hash() 에서 자동으로 생성되어 저장된다.

        const newUser = await this.usersService.createUser({
            ...user,
            password: hash
        });

        return this.loginUser(newUser); // 가입 후 바로 로그인하기 위해 토큰 생성
    }
}
