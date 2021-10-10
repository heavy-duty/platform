use anchor_lang::error;
use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
  #[msg("Invalid attribute kind")]
  InvalidAttributeKind,
  #[msg("Invalid attribute modifier")]
  InvalidAttributeModifier,
  #[msg("Invalid mark attribute")]
  InvalidMarkAttribute,
  #[msg("Invalid account kind")]
  InvalidAccountKind,
  #[msg("Invalid account modifier")]
  InvalidAccountModifier,
  #[msg("Missing Collection Account")]
  MissingCollectionAccount,
  #[msg("Invalid Collection Account")]
  MissingPayerAccount,
  #[msg("Invalid Payer Account")]
  MissingSpace,
  #[msg("Invalid Close Account")]
  MissingProgram,
  #[msg("Missing Account")]
  MissingAccount,
  #[msg("Invalid Account")]
  InvalidAccount,
}
