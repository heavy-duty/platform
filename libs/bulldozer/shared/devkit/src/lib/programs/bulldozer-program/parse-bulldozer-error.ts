import { parseIdlErrors, ProgramError } from '@heavy-duty/anchor';
import { IDL } from './bulldozer';

const bulldozerIdlErrors = parseIdlErrors(IDL);

export const parseBulldozerError = (error: string) => {
  throw ProgramError.parse(error, bulldozerIdlErrors);
};
