# Deploy Instructions

The following instructions will give you to use and deploy some components of Drill Ecosystem, which include:

- Drill CLI
- Drill Github Gateway
- Drill Gateway
- Web Client
- Drill Anchor Program
- 2 Github actions

All apps are alive in the same repository, under a NX monorepo. You can always use our official DRILL CLI, and our already deployed Drill Program -> DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1

## Pre configuration

Remember, Drill is a tool aiming to create a board with bounties in an existing Github repository. Be wise in choosing the repo(s) you want to use.

Clone the official monorepo from [here](https://github.com/heavy-duty/platform/).

Then, install all the dependencies using:

```bash
>> npm i
```

To deploy, you can use whatever you want. Let’s illustrate this, here we use: Firebase and Vercel

- Firebase for the Web Client.
- Vercel for the Drill's GithubApp and the Gateway.

**NOTE**: For this guide we’re assuming you already have Firebase and Vercel configured and logged in.

Make sure you have your solana config pointing to devnet. You can verify with this command:

```bash
>> solana config set --url https://api.devnet.solana.com

Config File: /home/andresmgsl/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/user/.config/solana/custom.keypair.json
Commitment: confirmed

```

Let’s keep it simple before we start. First, you need a mint for the board, you can use an existing mint or create a new one. You can skip this step if you already have a token you would like to use (like [BRICK](https://explorer.solana.com/address/BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg?cluster=devnet)). But in case you need to create a new mint, don’t forget to use the spl-token cli.

<details><summary><b>See how to create a new mint instruction...</b></summary>

```bash
>> spl-token create-token --decimals 6

Creating token 6mrkA1K5rXAxuEgE2LZw3rSQRSobHYYvRu9jBhzUV2Q4

>> spl-token create-account 6mrkA1K5rXAxuEgE2LZw3rSQRSobHYYvRu9jBhzUV2Q4 --owner zkDdkx2yJPg2qXzt6TdXewnL7R6tdBiffhaPMPKTZa9

Creating account 3oLzm6bdviLkV1sxYTgCSVSQbTsF5hGGaDf8xw3d9uQo

>> spl-token mint 6mrkA1K5rXAxuEgE2LZw3rSQRSobHYYvRu9jBhzUV2Q4 500 3oLzm6bdviLkV1sxYTgCSVSQbTsF5hGGaDf8xw3d9uQo

Minting 500 tokens
  Token: 6mrkA1K5rXAxuEgE2LZw3rSQRSobHYYvRu9jBhzUV2Q4
  Recipient: 3oLzm6bdviLkV1sxYTgCSVSQbTsF5hGGaDf8xw3d9uQo

```

</details>
<br>

Just one more step before the beginning. We need a new wallet and fund it with some SOLs (we would need it later in the process).

Creating a new wallet dedicated solely to the board is very important. This way you can pass the secret key without compromising your other wallets.

<details><summary><b>See how to create a new wallet instruction...</b></summary>

```bash
>> solana-keygen new -o /home/user/.config/solana/drill-testing-app.json
```

Remember to have some SOLs to correctly initialized the wallet. To avoid any troubles is important that you create the board using the CLI and the wallet you just created (the same authority used in the board, should be used in a _SOLANA_SECRET_KEY_ environment variable that we will use for the Github app).

Make sure you update your wallet info on you solana config.yaml file located at
_/home/user/.config/solana/cli/config.yaml_ to match the new wallet created.

</details>
<br>

Alright, we’re all set. Let’s start by creating a new Board: use the Drill CLI to do it (using the next command inside the monorepo). Note that if you deploy a custom solana program, you have to update the .env file located at apps/drill-cli to point it to your program id. If not, you can continue without any modification using the default [drill program](https://explorer.solana.com/address/DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1?cluster=devnet). Also, to avoid any troubles is important that you create the board using the the wallet you just created as the selected in your solana config.yml:

**NOTE**: The CLI uses your config.yaml to settle the solana configuration for the entire process.

<details><summary><b>See how to create a new board instruction...</b></summary>

```bash
>> drill create-board <your-github-username>/<your-repository-nam> <lockTime-in-ms> <mint-public-key>
```

if you don`t have the Drill CLI installed, use the local drill cli in the monorepo with the follow command:

```bash
>> nx run drill-cli:create-board --githubRepository <your-github-username>/<your-repository-nam> --lockTime <time-in-ms> --acceptedMint <mint-public-key>
```

**NOTE**: All this data is for the example, be sure to replace it with your own data and should look something like this:

```bash
>> drill create-board  andresmgsl/nextjs-typescript-seed 1 BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg

or

>> nx run drill-cli:create-board --githubRepository andresmgsl/nextjs-typescript-seed --lockTime 1 --acceptedMint BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg
```

If the repo have a board already created, you will get an error. You can check if the board was successfully created using the following command (again, replace with your own values):

```bash
>> nx run drill-cli:get-board --githubRepository andresmgsl/nextjs-typescript-seed

Getting board data: "andresmgsl/nextjs-typescript-seed"

Board: "andresmgsl/nextjs-typescript-seed" (409320044)
Board Public Key: 4tL3PaLkmujSB1fZB5Z8e3TMca5pTNpjoa3WTw27NQkh

```

</details>
<br>

The last step to fully configure your repo is to install the GithubApp in the repository. Before you do this, run the following command:

```bash
>> nx serve drill-github-app

INFO (server): Listening on http://localhost:3000
INFO (server): Connected
```

After running the command we mentioned above, you would have to open localhost:3000 and install a new GithubApp in the repository which you use to create the board. Feel free to choose the name of your brand new GithubApp.

Then, an .env file will be created in the root folder of the monorepo. This file contains important data that we need to deploy.

**NOTE**: If you delete the .env file, you will need to execute this process again.

Let's get this party started! Go install the GithubApp:

1. Register the app

   ![Drill github app website](../.docs/drill/assets/drill_install_app.png)

2. Name it

   ![Github app name input](../.docs/drill/assets/register_github_app.png)

3. Select the repo or repos where you want to install the GithubApp

   ![Github app select repo input](../.docs/drill/assets/install-app-in-repo.png)

There you go! Now you can close the localhost:3000 server and open the .env file located in the root folder. Keep it at hand, we’ll be using it later.

Now, it's time to deploy the _Drill-Github-App_ in this monorepo. Don’t forget, you'll have to add some settings to the GithubApp you just installed.

## Drill Github Application

This is a Node app built using [Protobot](https://github.com/probot/probot).

Let’s see what we need to start. Go check that you have successfully installed the GithubApp in the repo (or repos) where you want to use the bounty program. Also, make sure that you have already generated the .env file and add ACCEPTED_MINT, the RPC_URL, the COMMITMENT, and the SOLANA_SECRET_KEY into it.

**NOTE**: The _SOLANA_SECRET_KEY_ must be the same we used to create the board. Using another secret key would result in errors.

Finally, you should have something like this: (remove all the " in the PRIVATE_KEY if it has any)

```env
ACCEPTED_MINT=<PublicKey-Mint>
PROGRAM_ID=<PublicKey-Program>
APP_ID=<Github-app-id>
PRIVATE_KEY=<GithubApp-Private-Key>
WEBHOOK_SECRET=<number>
GITHUB_CLIENT_ID=<your-installed-github-app-id>
GITHUB_CLIENT_SECRET=<your-installed-github-app-secret>
RPC_URL=<solana-rpc-url>
COMMITMENT=<solana-commitment-value>
SOLANA_SECRET_KEY=<array-numbers-wallet-private-key>
```

after replacing it with your own data, you would have something like this:

```env
ACCEPTED_MINT=BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg
PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1
APP_ID=204140
PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nM.....==\n-----END RSA PRIVATE KEY-----\n
WEBHOOK_SECRET=0c4bb3a92c7f4bab57655c9493ca3de5179abe18
GITHUB_CLIENT_ID=Iv1.45dadd03490f854b
GITHUB_CLIENT_SECRET=abc93c28bfc2fa5fc8e89a2b94de1a20f8989f04
RPC_URL=https://api.devnet.solana.com
COMMITMENT=confirmed
SOLANA_SECRET_KEY=[26,210,8,56, ... ,205,136,237,44,1,247,245,68,234]
```

To deploy, you can use the following command.

```bash
>> nx run drill-github-app:deploy
```

Add all the environment variables, one by one, to the Vercel environment of your app (website settings) and redeploy the whole app running the same command.

![Vercel environment variables](../.docs/drill/assets/vercel_environment_file.png)

With the Vercel URL, go to the GithubApp Settings on the website and update the Webhook URL.

**NOTE**: Avoid ending your URL with a /, it would cause you troubles.

Go to your Github _settings -> applications -> < your-app-name >_ and change the Webhook URL to match the Drill-Github-App you just deployed (check the vercel domain of your app).

![Github app webhook url setting](../.docs/drill/assets/github_webhook_url.png)

Now, every Issue with the label **_'drill:bounty'_** will have a bounty enabled to receive funds in the Mint we previously created. Go check yourself, create a new issue, and add the 'drill:bounty' label.

You can check all the transfers you make by running:

```bash
>> drill get-bounty <github-username>/<user-repo-name> <number-of-issue>
```

if you don`t have the Drill CLI installed, use the local drill cli in the monorepo with the follow command:

```bash
>> nx run drill-cli:get-bounty --githubRepository <github-username>/<user-repo-name> --issueNumber <number-of-issue>
```

With the Drill GithubApp up and running, it’s time to deploy the Drill Gateway.

## Drill Gateway

Yes, you guessed it! Here we have another Node app. This one has two main functions: (1) authenticates you via Github, and (2) enables you to claim the bounty once the issue is done and closed.

Now, lets deploy the Drill Gateway in the same way you just deployed the Drill-Github-Gateway :

```bash
>> nx run drill-gateway:deploy
```

**NOTE**: Remember that you need to replace the data with your own values as we did before. You should have something like this (we’ll change the Web Client URL later, so for now you can use something like _http://localhost:4200_):

```text
PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1
GITHUB_CLIENT_ID=Iv1.9c188b...bcb34f6
GITHUB_CLIENT_SECRET=8ac0bdb013b...89e238d41102187485789
WEB_CLIENT_URL=http://localhost:4200
RPC_URL=https://api.devnet.solana.com
COMMITMENT=confirmed
SOLANA_SECRET_KEY=[26,210,8,56,4,82,89,57, ... ,237,44,1,247,245,68,234]
```

Add the environment variables to the Vercel environment of your app and redeploy it (like we did a moment ago).

Done! Now it’s time to work on the web client.

## Drill Web client

We suggest using Firebase for deployment. The web client is written in Angular and Firebase is really friendly with this kind of apps. But hey! You can use Vercel or any platform you want.

Time to update the _`environment.prod.ts`_ file located at apps/drill-web-client/src/environments:

- Change the clientID with the githubClientID you already have from previous steps.
- Update the githubRepository with the _< username >/< name >_ of your Github repository.
- Use the domain of the Vercel Gateway app already deployed to update the GatewayURL (check the Vercel to get the app domain).
- If you are not using the default Drill Anchor Program, you have to manually match the programId with the id of your program.

**NOTE**: Be sure to use all the data from the early steps, like the URL of the recently deployed gateway and the Github id you got when the GithubApp was installed.

We’re all set to build the web client using:

```bash
>> nx build drill-web-client

⠦ Generating browser application bundles (phase: building)...

```

To deploy it, use Firebase (you will need to configure some things).

Select the correct deploy directory as shown above (dist/apps/drill-web-client), and configure it as a single-page app.

```bash
>> firebase init

... // select only hosting

=== Hosting Setup

✔  Firebase initialization complete!


>> firebase deploy

...

✔  Deploy complete!

Hosting URL: https://testin-drill.web.app

```

## Last steps

Now with this new Web Client URL, you have to update the _WEB_CLIENT_URL_ environment variable of the Gateway vercel app.

Bear with me, we're almost finished. Go to your Github Settings and update the GithubApp to have the Callback URL point to **_< Web CLient URL >/login_** (as we did with the _Webhook URL_ in early steps). After this, you need to redeploy your Vercel Gateway app.

In the web client, look for the environment.production.ts file and update the redirectURL value with _< Web CLient URL >/login_ and, again, you know it, redeploy it.

For your final step, install Github actions to keep the tool synchronized with your repo (or repos).

**NOTE**: please verify that none of the URLs used in Vercel, neither the GithubApp configuration nor the web client environments, have any "/" at the end.

## Github actions

Don’t worry, we got you. For this, you just have to add Github actions on a _main.yaml_ file under _.github/workflows/_ directory of your Github repository.

**NOTE**: You might have to create this file and directory in case it doesn’t exist yet.

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'

jobs:
  vault_updater_job:
    runs-on: ubuntu-latest
    name: A job to update all vaults' amounts.
    steps:
      - name: Vault Updater
        id: vault-updater
        uses: heavy-duty/drill-vault-updater-action@v1.0.54

        with:
          token: ${{secrets.GITHUB_TOKEN}}
          rpc-endpoint: ${{ secrets.RPC_ENDPOINT }}
          program-id: ${{ secrets.PROGRAM_ID }}
          github-repository: ${{ github.repository }}
          cluster: ${{ secrets.CLUSTER }}
      - name: Get Vault Updater Result
        run: echo "The result was ${{ steps.vault-updater.result }}"
  board_cleaner_job:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    name: A job to clean all claimed bounties.
    steps:
      - name: Board Cleaner
        id: board-cleaner
        uses: heavy-duty/drill-board-cleaner-action@v1.0.5
        with:
          token: ${{secrets.GITHUB_TOKEN}}
          rpc-endpoint: ${{ secrets.RPC_ENDPOINT }}
          program-id: ${{ secrets.PROGRAM_ID }}
          github-repository: ${{ github.repository }}
      - name: Get Board Cleaner Result
        run: echo "The result was ${{ steps.board-cleaner.result }}"
```

Then, add the corresponding secrets to your Github repo configuration (see _< repo-url >/settings/secrets/actions_), and there you go!

Down here you can see the repository secret’s values of the example we created:

```text
RPC_ENDPOINT=https://api.devnet.solana.com
PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1
CLUSTER=devnet
```

![Github action environment variables](../.docs/drill/assets/github_actions_secrets.png)

Congrats my fren! You effectively finished the Drill Ecosystem setup. With everything up and running, go have some fun and test the bounty program for your issues!

## FAQ

If you have any errors, please be sure you use the correct env vars in all the platforms (Vercel, Github, and Firebase). Some commons errors are:

1. You added a wrong Private Key in the Drill-Github-Gateway deployed on Vercel. Avoid using ", so instead of this:

   ```text
   PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nM.....==\n-----END RSA PRIVATE KEY-----\n"
   ```

   you should have something more like this:

   ```text
   PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nM.....==\n-----END RSA PRIVATE KEY-----\n
   ```

2. You created a new board using the CLI with a different Program ID that the one used in the GITHUB or VERCEL environment variables

3. You mustn't end the URL with “/”. Any of the URLs we use in the example have it at the end. For example, avoid doing things like:

   ```text
   ...
   redirectUri: 'http://localhost:4200/login/',
   githubOAuth: 'https://github.com/login/oauth/authorize/',
   gatewayUrl: 'http://localhost:3333/',
   ...
   ```

   instead, do this:

   ```text
   ...
   redirectUri: 'http://localhost:4200/login',
   githubOAuth: 'https://github.com/login/oauth/authorize',
   gatewayUrl: 'http://localhost:3333',
   ...
   ```

4. Always remove the Dist folder of the app you want to deploy. Sometimes, NCC generates other files instead of replacing the existing ones.

5. If the board is not being created, be sure to set your repo as public. We currently do not accept private repositories.

6. If the drill website keeps redirecting you to the unauthorized state, check if you have the correct redirectUri in the environment.prod.ts and in the GithubApp Settings (in the Github website).
