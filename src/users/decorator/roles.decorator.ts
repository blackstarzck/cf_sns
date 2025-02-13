import { SetMetadata } from "@nestjs/common";
import { RolesEnum } from "../const/roles.const";

export const ROLES_KEY = 'user_roles';

// @Roles(RolesEnum.ADMIN) <- admin 이 아니라면 사용할 수 없게 만드는 데코레이터
// SetMetadata 는 메타데이터를 설정하는 데코레이터이다. 메타데이터는 런타임에 사용할 수 있는 데이터이다. 이 데코레이터는 user_roles 라는 키로 role 값을 설정한다.
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);