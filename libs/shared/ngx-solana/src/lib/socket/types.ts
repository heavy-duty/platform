import {
  AccountInfo,
  RpcResponseAndContext,
  SignatureResult,
} from '@solana/web3.js';

export interface RpcResultNotification {
  jsonrpc: string;
  id: string;
  result: number;
}

export interface RpcAccountParamsNotification {
  result: RpcResponseAndContext<AccountInfo<Buffer>>;
  subscription: number;
}

export interface RpcNotification<T> {
  jsonrpc: string;
  method: string;
  params: T;
}

export interface RpcSignatureParamsNotification {
  result: RpcResponseAndContext<SignatureResult>;
  subscription: number;
}

export type RpcMessage =
  | RpcResultNotification
  | RpcNotification<null>
  | RpcNotification<RpcSignatureParamsNotification>
  | RpcNotification<RpcAccountParamsNotification>;
