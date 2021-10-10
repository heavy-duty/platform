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
  InvalidCollectionAccount,
  #[msg("Missing Payer Account")]
  MissingPayerAccount,
  #[msg("Invalid Payer Account")]
  InvalidPayerAccount,
  #[msg("Missing Space")]
  MissingSpace,
  #[msg("Invalid Close Account")]
  InvalidCloseAccount,
}
