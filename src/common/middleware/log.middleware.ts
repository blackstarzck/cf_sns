import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LogMiddleWare implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
        console.log(`REQUEST:  ${req.url}, ${req.method}, ${new Date().toLocaleString('kr')}`);
        next();
    }
}