import { Environment } from './types';

export const environment: Environment = {
  production: true,
  rpcEndpoint: 'http://localhost:8899',
  rpcWebsocket: 'ws://localhost:8900',
  network: 'localhost',
  broadcasterWebsocket: 'ws://localhost:3333',
};
