import { plainToInstance } from "class-transformer";
import {
  map,
  Observable,
} from "rxjs";

import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from "@nestjs/common";

interface ClassContructor {
  new (...args: any[]): {};
}

export const Serialize = (dto: ClassContructor) => {
  return UseInterceptors(new SerializeInterceptor(dto));
};

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassContructor) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // run something before a request is handled by a request handler

    return handler.handle().pipe(
      map((data: any) => {
        // Run something before the respsone is sent out
        const serializable = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, // don't expose fields without `@Expose`
        });
        return serializable;
      }),
    );
  }
}
