# Bulldozer

Bulldozer is a low code platform that uses abstractions that are common for developers to build Solana programs, it’s powered by Anchor Framework. It gives developers the ability to manage their program’s ecosystem through a UI, hiding all the gory details so they can focus on the business logic.

It consists of an Anchor workspace and an Angular application, the Anchor workspace holds the content of the Bulldozer program, it's used as decentralized storage. The reason we store all the data on-chain is that we want to unlock real-time collaboration while building systems.

![screenshot of bulldozer](https://user-images.githubusercontent.com/7496781/137217166-403c0780-4808-48d7-964a-49d8720c168a.png)

## Running Locally

Bulldozer has only been tested in localhost, if you want to give it a test drive, make sure to have a local validator running using `solana-test-validator`.

In order to run Bulldozer in your local environment, you'll need to make sure you have installed globally these dependencies:

- @project-serum/anchor
- mocha
- ts-mocha
- typescript

Clone the repo in the desired location and `cd` to it. Run the commands below:

- npm i
- npx nx build bulldozer-programs
- npx nx deploy bulldozer-programs
- npx nx serve bulldozer-client

The first command will install all the necessary dependencies, the second command builds the Solana program, the third command deploys it to the location specified in solana config and the last one spins up a simple server to serve the Angular application.

NOTE: Make sure to point the solana config in your local environment to match the local instance you have running.

## Testing it

If you want to run the program's e2e tests you can call `npx nx test bulldozer-programs` from the root of the project. Make sure to kill any local instance of solana, it can make the tests fail.
