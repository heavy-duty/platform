import { Environment } from './types';

export const environment: Environment = {
  production: true,
  rpcEndpoint: 'https://api.devnet.solana.com',
  rpcWebsocket: 'wss://api.devnet.solana.com',
  network: 'devnet',
  broadcasterWebsocket: 'wss://broadcaster.heavyduty.builders',
};
