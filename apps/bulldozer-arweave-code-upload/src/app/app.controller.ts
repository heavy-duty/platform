import { Body, Controller, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { FunctionBodyDTO } from './dto/function-body.dto.';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/storeInstructionBody')
  async storeInstructionBody(@Body() body: FunctionBodyDTO) {
    const txId = await this.appService.storeInstructionBody(body.functionBody);
    return txId;
  }
}
