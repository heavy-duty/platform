import { IsString } from 'class-validator';

export class FunctionBodyDTO {
  @IsString()
  code: string;
}
