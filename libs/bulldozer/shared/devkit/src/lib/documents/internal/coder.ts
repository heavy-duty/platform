import { BorshAccountsCoder } from '@heavy-duty/anchor';
import { IDL } from '../../programs';

export const borshCoder = new BorshAccountsCoder(IDL);
