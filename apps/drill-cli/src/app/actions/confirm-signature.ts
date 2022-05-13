import { AnchorProvider } from '@heavy-duty/anchor';

export const confirmSignature = async (
  provider: AnchorProvider,
  signature: string
): Promise<boolean> => {
  try {
    await provider.connection.confirmTransaction(signature, 'confirmed');
    return true;
  } catch (e) {
    console.log('Something go wrong: ', e);
    return false;
  }
};
