# Drill Github App Template

A template for a GitHub app made using Probot, the intention of this template is to be used by the Drill CLI to generate non-custodial GitHub apps that enable the Drill Bounty Program directly in GitHub.

Once you have linked your repo to a board it's a matter of deploying your GitHub app to your desired location and install your app into the repository. **Ideally**, you are only allowed to install the app in the repo matching the board.

## Setup

```sh
# Install dependencies
npm install

# Build the bot
npm run build

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t drill-poc .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> drill-poc
```

## Board management

After creating a board and linking it to your repo through a GitHub app install, you're all set to start adding bounties to your repo's issues.

> Boards consist of a set of bounties.

At the time of creation a board manager can define a lock time period, which defines how long a bounty hunter has to wait from the closing time to actually claim the bounty.

> The lock time gives board managers a grace period to change the bounty hunter in case of mistakes.

## Bounty creation

Adding bounty to an issue is quite simple, all it takes is adding a Drill-generated label to the issue. Once the label is picked up by the GitHub app, the label is removed and a _processing_ label is added.

The GitHub app needs access to the board's authority Keypair. Which has to be pre-funded since that wallet is responsible of covering the rent for the bounty-related accounts. Using the local Keypair, the GitHub app will send an instruction to initialize the bounty.

- On success: Remove _processing_ label, add _enabled_ label and send a comment with information about the bounty.
- On error: Remove _processing_ label, add _failed_ label and send a comment with the error message.

NOTE: Transaction is simulated before sending, if an error occurs during simulation: the _failed_ label is added in addition to the logs of the error.

Board managers are responsible of retrying failed bounties by putting back the bounty label.

## Closing bounty

When a bounty-enabled issue is closed, the app will send a transaction to mark the bounty as closed and if there's an assignee at the time of closing it's inferred as the bounty hunter. At the time of creation a board manager can define a lock time period, which defines how long a bounty hunter has to wait from the closing time to actually claim the bounty.

Similar to creating a bounty, the GitHub app will send and confirm the transaction. Different labels are added to let users know the state of the process. As soon as the issue is closed a _closing_ label is added and then:

- On success: Remove _closing_ label, add a _closed_ label and a comment stating that the bounty is closed and who's the _bounty hunter_ allowed to claim it.
- On error: Remove _closing_ label, add a _close-failed_ label and a comment with instructions on how to retry the process.

Retrying the process only takes adding a _manual-close_ label to the issue that will ultimately trigger the same flow as when the issue is closed.

## Set bounty hunter

Closed bounty-enabled issues can have their assignee changed by a code owner, in which case, the GitHub app picks the change and sends a transaction to change the bounty hunter. Errors and success are dealt in the same manner as the previous points.

## Bounty status tracking

Bounties may increase overtime as sponsors deposit into the vaults, in order to reduce the entry barrier, the total accumulated for the bounty is shown in a comment in the issue along with a Solana Pay QR that allows sponsors to deposit while their assets remain safe without having to connect their wallet with yet another dapp.

## Contributing

If you have suggestions for how drill-poc could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Daniel Marin <danielarturomt@gmail.com>
