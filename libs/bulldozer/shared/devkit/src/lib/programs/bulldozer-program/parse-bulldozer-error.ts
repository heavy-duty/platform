import { parseIdlErrors, translateError } from '@heavy-duty/anchor';
import { IDL } from './bulldozer';

const bulldozerIdlErrors = parseIdlErrors(IDL);

export const parseBulldozerError = (error: string) => {
  throw translateError(error, bulldozerIdlErrors);
};
