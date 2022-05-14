export const getBountyEnabledCommentBody = (explorerUrl: string) => {
  const title = "# 💰 Bounty Enabled";
  const description = `This issue has an active bounty. [Inspect the transaction](${explorerUrl}) in the Solana Explorer.`;

  return `${title}\n${description}`;
};

export const getBountyClosedCommentBody = (
  explorerUrl: string,
  bountyHunter?: string
) => {
  const title = "# 🔐 Bounty Closed";
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
  const title = "# 🕵🏻 Bounty Hunter Changed";
  const description = `This issue's bounty hunter has been recently changed. [Inspect the transaction](${explorerUrl.toString()}) in the Solana Explorer.`;
  const claim = `> @${bountyHunter} can claim this bounty.`;

  return `${title}\n${description}\n${claim}`;
};