import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     * Roles annotation 에 대한 metadata 를 가져온다.
     * 
     * Reflector 는 metadata 를 가져오는 역할을 한다.
     * getAllAndOverride 는 metadata 를 가져오는 역할을 한다.
     */
    const requiredRoles = this.reflector.getAllAndOverride(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass()
      ]
    );

    // Roles Annotation 을 사용하지 않았다면, true 를 반환한다.
    if(!requiredRoles) {
      return true;
    };
    const { user } = context.switchToHttp().getRequest();
    if(!user) {
      throw new UnauthorizedException('토큰을 제공해 주세요.')
    };
    if(user.role !== requiredRoles) {
      throw new ForbiddenException(`이 작업을 수행할 권한이 없습니다. ${requiredRoles}의 권한이 필요합니다.}`);
    };
    return true;
  }
}