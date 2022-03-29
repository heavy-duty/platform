// This file can be replaced during build by using the `fileReplacements` array.

import { Environment } from './types';

export const environment: Environment = {
  production: false,
  rpcEndpoint: 'http://localhost:8899',
  rpcWebsocket: 'ws://localhost:8900',
  network: 'localhost',
  broadcasterWebsocket: 'ws://localhost:4040',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
