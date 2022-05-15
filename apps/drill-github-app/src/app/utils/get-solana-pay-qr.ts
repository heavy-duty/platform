import * as QRCode from 'qrcode';

export interface SolanaPayQr {
	base64: string;
}

export const getSolanaPayQR = async (
	bountyVaultPublicKey: string,
	acceptedMint: string
): Promise<SolanaPayQr> => {
	try {
		const solanaUrl = `solana:${bountyVaultPublicKey}?spl-token=${acceptedMint}&memo=Drill-Issue`;
		const qrImage = await QRCode.toDataURL(solanaUrl);

		return {
			base64: qrImage.split('base64,')[1] || 'null',
		};
	} catch (e) {
		console.log('ERROR');
		console.log(e);
		throw e;
	}
};
