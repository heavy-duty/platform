import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import TestWeave from 'testweave-sdk';

const test_wallet = 'MlV6DeOtRmakDOf6vgOBlif795tcWimgyPsYYNQ8q1Y';

export const init = async () => {
  console.log('DETRON DE', Arweave);
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

  transaction.addTag('Content-Type', 'text/plain');
  await arweave.transactions.sign(transaction, wallet);
  await arweave.transactions.post(transaction);
  console.log('transaction create: ', transaction);
  await testWeave.mine();

  const status = await arweave.transactions.getStatus(transaction.id);
  console.log('Data Saved with follow status: ', status);

  return transaction.id;
};

export const getLastData = async (arweave: Arweave) => {
  const lastId = await arweave.wallets.getLastTransactionID(test_wallet);
  console.log('lastID', lastId);
  const message = await arweave.transactions.getData(lastId, {
    decode: true,
    string: true,
  });

  return message;
};

export const ArweaveSdk = () => {
  console.log('this is arweave');
  return 'arweave-sdk';
};
