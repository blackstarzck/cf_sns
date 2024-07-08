import { ValidationArguments } from "class-validator";

export const stringValidationMessage = (args: ValidationArguments) => {
    return `${args.property}은 문자열로 입력해주세요.`;
}