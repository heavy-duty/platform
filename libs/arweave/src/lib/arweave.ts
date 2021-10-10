import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import TestWeave from 'testweave-sdk';

const test_wallet = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y';

export const init = async () => {
  const arweave: Arweave = Arweave.init({
    host: 'localhost',
    protocol: 'http',
    logging: true,
  });

  const testWeave = await TestWeave.init(arweave);
  const walletKey = testWeave.rootJWK;

  return {
    arweave,
    testWeave,
    walletKey,
  };
};

export const saveData = async (
  data: string,
  arweave: Arweave,
  testWeave: TestWeave,
  wallet: JWKInterface
) => {
  const transaction = await arweave.createTransaction({ data: data }, wallet);

  await arweave.transactions.sign(transaction, wallet);
  await arweave.transactions.post(transaction);

  await testWeave.mine();

  await arweave.transactions.getStatus(transaction.id);

  return transaction.id;
};

export const getLastData = async (arweave: Arweave) => {
  const lastId = await arweave.wallets.getLastTransactionID(test_wallet);

  const message = await arweave.transactions.getData(lastId, {
    decode: true,
    string: true,
  });

  return message;
};

export const ArweaveSdk = () => {
  return 'arweave-sdk';
};
