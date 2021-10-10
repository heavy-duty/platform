import { Body, Controller, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { FunctionBodyDTO } from './dto/function-body.dto.';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/instruction-body')
  async storeInstructionBody(@Body() body: FunctionBodyDTO) {
    const txId = await this.appService.storeInstructionBody(body.code);
    return txId;
  }
}
