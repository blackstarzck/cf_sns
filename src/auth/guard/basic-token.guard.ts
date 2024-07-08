/**
 * 1. 요청객체를 불러오고
 *    authorization header 로 부터 토큰을 가져온다.
 *    
 * 2. authService.extractTokenFromHeader 을 이용해서 사용할 수 있는 형태의 토큰을 추출한다.
 * 3. authService.decodeBasicToken 을 이용해서 email 과 password 를 추출한다.
 * 4. email 과 password 를 이용해서 사용자를 가져온다.
 *    authService.authenticateWithEmailAndPassword
 * 5. 찾아낸 사용자를 (1) 요청 객체에 붙혀준다.
 *    → 라이프싸이클이 끝날떄까지 guard 서 들고 있어 사용할 수 있도록한다.
 *    → 매번 데이터베이스에 접근하지 않도록 한다.
 */

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";


@Injectable()
export class BasicTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService
    ){ }
    
    // 통과여부를 경정하는 필수 메서드
    async canActivate(context: ExecutionContext): Promise<boolean> { 
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];

        if(!rawToken){
            throw new UnauthorizedException('토큰이 필요합니다.');
        };

        const token = this.authService.extractTokenFromHeader(rawToken, false);
        const { email, password } = this.authService.decodeBasicToken(token);
        const user = await this.authService.authenticateWithEmailAndPassword({ email, password });

        req.user = user;
        return true;
    }
}