import { parseIdlErrors, ProgramError } from '@project-serum/anchor';
import { IDL } from './bulldozer';

const bulldozerIdlErrors = parseIdlErrors(IDL);

export const parseBulldozerError = (error: Error) => {
  const translatedErr = ProgramError.parse(error, bulldozerIdlErrors);
  if (translatedErr === null) {
    throw error;
  }
  throw translatedErr;
};

export const getBulldozerError = (code: number) => {
  const errorMsg = bulldozerIdlErrors.get(code);

  if (errorMsg === undefined) {
    return null;
  }

  return new ProgramError(code, errorMsg, code + ': ' + errorMsg);
};
