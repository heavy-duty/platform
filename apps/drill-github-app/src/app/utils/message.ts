import { BN } from '@heavy-duty/anchor';

export interface BoardMessageData {
	id: number;
	publicKey: string;
	lockTime: BN;
	authority: string;
}

export interface BountyMessageData {
	id: number;
	publicKey: string;
	vaultATA: string;
	vaultAmount: bigint;
}

export const getBountyEnabledCommentBody = (
	board: BoardMessageData,
	bounty: BountyMessageData,
	githubRepository: string,
	explorerUrl: string,
	boardPublicKeyUrl: string,
	boardAuthorityUrl: string,
	bountyPublicKeyUrl: string,
	bountyVaultPublicKeyUrl: string,
	imagePath: string
) => {
	const _initMessage = `
# 💰 Drill Bounty Program 💰

Drill was configured successfully, this issue has an active bounty. [Inspect the transaction](${explorerUrl}) in the Solana Explorer. Below you'll find more details about the Bounty you just created. If you want to get more info about this tool, please read our official doc [here](https://heavyduty.builders/)
`;

	const _boardInfo = `
## 💾 Board info

All about your board.

🔢 **ID**: ${board.id}.  
🔑 **Public Key**: [${board.publicKey}](${boardPublicKeyUrl})  
⏱️ **Lock Time (in seconds)**:${board.lockTime}  
🔒 **Auhtority**:[${board.authority}](${boardAuthorityUrl})
`;

	const _bountyInfo = `
## 🏦 Bounty info

All about your new bounty.

🔢 **ID**: ${bounty.id}.  
🔑 **Public Key**: [${bounty.publicKey}](${bountyPublicKeyUrl})  
🧰 **Vault ATA**:[${bounty.vaultATA}](${bountyVaultPublicKeyUrl})

> _You can use this information and our CLI to fetch more detailed data, like the Bump and others solana detail you may need in some cases._
`;

	const _solanaPay = `
## 🤳 Solana pay

Use the following QR to send funds to bounty vault, please be sure what you are doing before make the transfer, this can't be undone.

![Solana pay QR](https://raw.githubusercontent.com/${githubRepository}/master/${imagePath})

### 🪙💵 **CURRENT DEPOSIT AMOUNT: ${bounty.vaultAmount}** 💵🪙
`;

	const _disclaimer = `
## 🚨 Disclaimer

_PLEASE BE SURE YOU KNOW THIS REPO AND ALREADY SPOKE WITH SOME ADMIN. IS IMPORTANT TO KEEP IN MIND that THIS COMMENT (INCLUDING THE ADDRESS AND THE QR IMAGE) CAN BE MODIFIED FOR ANY PERSON WITH THE SUFFICIENT PRIVILEGE IN THIS REPO. DRILL NOR HEAVYDUTY BE RESPONSIBLE FOR ANY SCAM OR BAD USE OF THIS SOFTWARE._
`;

	const fullComment = `${_initMessage}\n---\n${_boardInfo}\n&nbsp;\n${_bountyInfo}\n---\n${_solanaPay}---\n${_disclaimer}\n`;

	return `${fullComment}\n`;
};

export const getBountyClosedCommentBody = (
	explorerUrl: string,
	bountyHunter?: string
) => {
	const title = '# 🔐 Bounty Closed';
	const description = `This issue's bounty is currently closed. [Inspect the transaction](${explorerUrl.toString()}) in the Solana Explorer.`;

	if (bountyHunter === undefined) {
		return `${title}\n${description}`;
	}

	const claim = `> @${bountyHunter} can claim this bounty.`;

	return `${title}\n${description}\n${claim}`;
};

export const getErrorCommentBody = (title: string, message: string) => {
	const description = `
\`\`\`sh
${message}
\`\`\`
`;

	return `${title}\n${description}`;
};

export const getBountyHunterChangedCommentBody = (
	explorerUrl: string,
	bountyHunter: string
) => {
	const title = '# 🕵🏻 Bounty Hunter Changed';
	const description = `This issue's bounty hunter has been recently changed. [Inspect the transaction](${explorerUrl.toString()}) in the Solana Explorer.`;
	const claim = `> @${bountyHunter} can claim this bounty.`;

	return `${title}\n${description}\n${claim}`;
};
