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
  #[msg("Missing Payer Account")]
  MissingPayerAccount,
  #[msg("Missing Space")]
  MissingSpace,
  #[msg("Missing Program")]
  MissingProgram,
  #[msg("Missing Account")]
  MissingAccount,
  #[msg("Invalid Account")]
  InvalidAccount,
  #[msg("Missing Max")]
  MissingMax,
  #[msg("Missing Max Length")]
  MissingMaxLength,
  #[msg("Cant delete collection with attributes")]
  CantDeleteCollectionWithAttributes,
}
