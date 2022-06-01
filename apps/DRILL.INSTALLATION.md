# Deploy Instructions

These are the instructions to use and deploy some of the components of Drill Ecosystem, which is composed of:

- Drill CLI
- Drill Github Gateway
- Drill Gateway
- Web Client
- Drill Anchor Program
- 2 Github actions

All this apps live in the same repository, under a NX monorepo. I will assume you already deployed the CLI and the Anchor program. You always can use our already deployed Drill Program -> DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1

## Pre configuration

Remember, Drill is a tool aimed to create a board with bounties in an existing Github repository, so be sure you have already the repo you want to use.

Clone the official monorepo from [here](https://github.com/heavy-duty/platform/).

Then, install all the dependencies using:

```bash
>> npm i
```

To deploy, you can use whatever you want, but for this example, we will use:

- Vercel for the Drill's GithubApp and the Gateway.
- Firebase for the Web Client.

**NOTE**: For this guide we'll assume you already have vercel configure and logged in.

Make sure you have your solana config pointing to devnet, to verify this you can use the following command:

```bash
>> solana config set --url https://api.devnet.solana.com

Config File: /home/andresmgsl/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/user/.config/solana/custom.keypair.json
Commitment: confirmed

```

Now, you need a mint for the board, so you can create one, or use an existing mint. For create a new one, you will need the spl-token cli. You can skip this step if you already have a token you would like to use. (like [BRICK](https://explorer.solana.com/address/BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg?cluster=devnet))

<details><summary><b>See instruction how to create a new mint...</b></summary>

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

Just one step before start, lets create a new wallet and fund it with some SOLs, you'll need this later in the process.

> Is important to create a new wallet used only for the board, so you can pass the secret key without compromising any of your wallets.

<details><summary><b>See instruction how to create a new wallet...</b></summary>

```bash
>> solana-keygen new -o /home/user/.config/solana/drill-testing-app.json
```

Remember to have some SOLs to correctly initialized the wallet. To avoid any troubles is important that you create the board using the CLI and the wallet you just created (the same authority used in the board, should be used in a _SOLANA_SECRET_KEY_ environment variable that we will use for the Github app).

Make sure you update your wallet info on you solana config.yaml file located at
_/home/user/.config/solana/cli/config.yaml_ to match the new wallet created.

</details>
<br>

So lets start, first we have to create a new Board, so use the Drill CLI to do it, using the next command inside the monorepo. If you deploy a custom solana program, remember to update the .env file located at _apps/drill-cli_ to point to your program id, if not, you can continue without any modification using the default [drill program](https://explorer.solana.com/address/DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1?cluster=devnet):

**NOTE**: The CLI use your config.yaml to determine the solana configuration to use for the entire process.

<details><summary><b>See instruction how to create a new board...</b></summary>

```bash
>> nx run drill-cli:create-board --githubRepository <your-github-username>/<your-repository-nam> --lockTime <time-in-ms> --acceptedMint <mint-public-key>
```

**NOTE**: All this data is for the example, be sure to replace it with your own data and should look something like this:

```bash
>> nx run drill-cli:create-board --githubRepository andresmgsl/nextjs-typescript-seed --lockTime 1000000 --acceptedMint BR1CK2GpuUqNUrS8Kk7WDXXiSMaAppKFPhkzbXxFZtVg
...
```

If the repo have a board already created, you will get an error. You can check if the board was successfully created using the following command (again, replace with your own values):

```bash
>> nx run drill-cli:get-board --githubRepository andresmgsl/nextjs-typescript-seed

Getting board data: "andresmgsl/nextjs-typescript-seed"

Board: "andresmgsl/nextjs-typescript-seed" (409320044)
Board Public Key: 4tL3PaLkmujSB1fZB5Z8e3TMca5pTNpjoa3WTw27NQkh
...

```

</details>
<br>

The last step to fully configure your repo will be the installation of the Github app in the repository. To do this, first you have to run the following command:

```bash
>> nx serve drill-github-app

INFO (server): Listening on http://localhost:3000
INFO (server): Connected
```

The first time you run that command, it will tell you to open _localhost:3000_ and install a new Github app in the repository you use to create the board; you can choose the name you want for your Github app.

After that, an .env file will be created in the root folder of the monorepo, this file contains some important data that we will need in the deploy process.

**NOTE**: If you delete the .env file, you will need to execute this process again.

Let's install the Github app!

1. Register the app

   ![Drill github app website](../.docs/drill/assets/drill_install_app.png)

2. Enter a name you want

   ![Github app name input](../.docs/drill/assets/register_github_app.png)

3. Select the repo or repos where you want to install the Github app

   ![Github app select repo input](../.docs/drill/assets/install-app-in-repo.png)

There you go! Now you can close the _localhost:3000_ server and open the .env file located the root folder. We will use this file later.

Now, it's time to deploy the _Drill-Github-App_ app in this monorepo, after that you will add some settings to the Github app you just installed.

## Drill Github Gateway

This is a Node app built using [Protobot](https://github.com/probot/probot). Before you start is important to understand in detail everything you need.

First you will need to have the Github app successfully installed in the repo(s) where you want to use the bounty program. Also you need to have the .env file already generated by our previous installation process; additionally, you have to add the _ACCEPTED_MINT_, the _RPC_URL_, the _COMMITMENT_, and the _SOLANA_SECRET_KEY_, to the .env file.

**NOTE**: _SOLANA_SECRET_KEY_ is the secret key from the Solana wallet previous created for the board. Be sure to use the same key you use to create the board, if not you would have errors.

Finally, you should have something like this: (remove all the " in the _PRIVATE_KEY_ if have any)

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

after replacing with your own data, you will have something like this:

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

To deploy, first you have to build it.

```bash
ncc build apps/drill-github-app/src/main.ts --license licenses.txt --minify --out dist/apps/drill-github-app
--
vercel deploy --prod dist/apps/drill-github-app
```

Add all the environment variables, one by one, to the vercel environment of your app (in the website settings) and redeploy the whole app.

Before redeploy, be sure to remove the last dist folder to avoid conflicts, run:

```bash
>> rm -r dist/apps/drill-github-app
```

Then with the vercel url, go to the Github app settings on the Github website and update the webhook URL.

**NOTE**: Avoid ending your url with a /, it would cause you troubles.

Go to your Github _settings -> applications -> < your-app-name >_ , there you have to change the Webhook URL to match the Drill-Github-App you just deployed (check the vercel domain of your app).

![Github app webhook url setting](../.docs/drill/assets/github_webhook_url.png)

Now, every Issue with the label **_'drill:bounty'_** will have a bounty enabled to receive funds in the Mint we previously created. Go and check your self, create a new issue and add the **_'drill:bounty'_** label.

You can check all the transfer you make by running:

```bash
>> nx run drill-cli:get-bounty --githubRepository <github-username>/<user-repo-name> --issueNumber <number-of-issue>

```

With the Drill GithubApp already deployed and working, is time to deploy the Drill Gateway.

## Drill Gateway

This is a Node app that have two main functions, the first one is authenticate you with github, and the second its letting you claim your bounty once the issue have been done and closed. So, lets deploy the Gateway in the same way you just deployed the Drill-Github-Gateway :

```bash
ncc build apps/drill-gateway/src/main.ts --license licenses.txt --minify --out dist/apps/drill-gateway
```

```bash
vercel deploy --prod dist/apps/drill-gateway
```

**NOTE**: Remember, you need to replace the data with your own values as we did before. You should have something like this (we will change the Web Client URL later, so you can use something like _http://localhost:4200_ for now):

```text
PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1
GITHUB_CLIENT_ID=Iv1.9c188b...bcb34f6
GITHUB_CLIENT_SECRET=8ac0bdb013b...89e238d41102187485789
WEB_CLIENT_URL=http://localhost:4200
RPC_URL=https://api.devnet.solana.com
COMMITMENT=confirmed
SOLANA_SECRET_KEY=[26,210,8,56,4,82,89,57, ... ,237,44,1,247,245,68,234]
```

![Vercel environment variables](../.docs/drill/assets/vercel_environment_file.png)

Add the environment variables to the vercel environment of your app and redeploy it. (like you did before)

Done! now, is time to work in the web client.

## Web client

To deploy the web client we suggest using firebase, this because the web client is wrote in angular and firebase is really friendly with this kind of apps. But again, you can use vercel or whatever platform you want.

<details><summary><b>See instruction how login and use firebase...</b></summary>

Lets login in firebase:

```bash
>> firebase login
...

```

Then, create a new project in the console, using this link -> https://console.firebase.google.com/, or directly with the firebase CLI.

</details>
<br>

Now you will need to update the _environment.prod.ts_ file located at _apps/drill-web-client/src/environments_ as follows:

- Update the clientID with the githubClientID you already have on your .env file.
- Update the githubRepository with the _< username >/< name >_ of your Github repository.
- Update GatewayURL with the domain of the vercel Gateway app already deployed (check the vercel domain of the app).
- Update the programId with the id of your program. (If not using the default Drill)

**NOTE**: Be sure to use all the data from the early steps, like the URL of the recent deployed gateway and the github id you got when the github app was installed.

Build the web client using:

```bash
>> nx build drill-web-client

⠦ Generating browser application bundles (phase: building)...

```

And deploy it using Firebase (you will need to config some things)

> Select the correct deploy directory as showed above. (dist/apps/drill-web-client), and configure as a single-page app.

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

The same way you have to go to your Github settings and update the Github app to have the Callback URL point to _< Web CLient URL >/login_. After this you need to redeploy your vercel Gateway app.

In the web client, look for the _environment.production.ts_ file and update the redirectURL value with _< Web CLient URL >/login_
and redeploy it.

Finally, as the last step you have to install the Github actions to keep the tool synchronized with your repo.

**NOTE**: please verify that none of the URLs used in vercel, the Github app configuration or the web client environments haven`t any "/" at the end.

## Github actions

For this, you just have to add this github actions on a _main.yaml_ file under _.github/workflows/_ directory of your Github repository.

**NOTE**: you have to create this file and directory if not exists.

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
        uses: heavy-duty/drill-vault-updater-action@v1.0.49
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

Then add the corresponding secrets to your Github repo configuration (see _< repo-url >/settings/secrets/actions_) and there you go!

The corresponding values for the secrets in this example are:

```text
RPC_ENDPOINT=https://api.devnet.solana.com
PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1
CLUSTER=devnet
```

![Github action environment variables](../.docs/drill/assets/github_actions_secrets.png)

Congrats, you successfully finished the Drill Ecosystem setup!
With all stuff are already configured and running, now you can go and test the bounty program for your issues!

## FAQ

If you have any error, please be sure you use the correct env vars in all the platforms (Vercel, Github and Firebase). Some commons errors are:

1. You added a wrong Private Key in the Drill-Github-Gateway deployed on Vercel. You have to avoid use ", so instead of this

   ```text
   PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nM.....==\n-----END RSA PRIVATE KEY-----\n"
   ```

   you should have

   ```text
   PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nM.....==\n-----END RSA PRIVATE KEY-----\n
   ```

2. You create a new board using the CLI with a Program ID different that the used in the GITHUB or VERCEL environment variables

3. You never should end the URL with an /, neither of the URL we use o generate here have a / at the end. For example, avoid this:

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

4. Always remove the Dist folder of the app you want to deploy, NCC sometimes generate others files instead of replacing the existing ones.

5. If the board is not being created, be sure the repo is public, currently we don't accept private repositories

6. If the drill website always redirect you to the unauthorized state, be sure you have the correc redirectUri in the environment.prod.ts and in the GithubApp Settings (Github website)
