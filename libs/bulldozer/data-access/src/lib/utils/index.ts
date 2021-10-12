import { Idl } from '@project-serum/anchor';
import * as idlJson from './idl.json';

export * from './constants';
export * from './serializer';
export * from './dummy-wallet';
export const idl = idlJson as Idl;
