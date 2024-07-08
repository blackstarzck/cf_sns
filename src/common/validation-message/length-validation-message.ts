import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments) => {
    /**
     * ValidationArguments 프로퍼티들
     * 1. value: 검즐되고 있는 값 (입력된 값)
     * 2. constraints: 파라미터에 입력된 제한 사항들/제약 사항들
     *  - constraints[0]: 최소 길이 - 1
     *  - constraints[1]: 최대 길이 - 20
     * 3. targetName: 유효성 검사를 진행하는 클래스의 이름 - UsersModel
     * 4. object: 유효성 검사를 진행하는 클래스의 인스턴스
     * 5. property: 유효성 검사를 진행하는 클래스의 프로퍼티 이름 - nickname
    */
    if(args.constraints.length === 2){
        return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}자 사이로 입력해주세요.`;
    }else{
        return `${args.property}은 ${args.constraints[0]}자 이상 입력해주세요.`;
    }
}