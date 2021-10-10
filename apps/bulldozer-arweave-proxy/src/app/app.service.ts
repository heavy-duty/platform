import * as arweave from '@heavy-duty/arweave';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async storeInstructionBody(code: string): Promise<{ txId: string }> {
    const txId = await arweave.init().then((data) =>
      arweave
        .saveData(code, data.arweave, data.testWeave, data.walletKey)
        .then((result) => {
          return result;
        })
    );

    return { txId: txId };
  }
}
