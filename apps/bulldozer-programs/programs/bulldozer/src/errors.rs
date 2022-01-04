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
  #[msg("Collection provided doesnt match attribute")]
  CollectionDoesntMatchAttribute,
  #[msg("Cant delete account with relations")]
  CantDeleteAccountWithRelations,
  #[msg("From provided doesnt match relation")]
  FromDoesntMatchRelation,
  #[msg("To provided doesnt match relation")]
  ToDoesntMatchRelation,
  #[msg("Cant delete instruction with arguments")]
  CantDeleteInstructionWithArguments,
  #[msg("Instruction provided doesnt match argument")]
  InstructionDoesntMatchArgument,
  #[msg("Cant delete instruction with accounts")]
  CantDeleteInstructionWithAccounts,
  #[msg("Instruction provided doesnt match account")]
  InstructionDoesntMatchAccount,
  #[msg("Cant delete application with collections")]
  CantDeleteApplicationWithCollections,
  #[msg("Application provided doesnt match collection")]
  ApplicationDoesntMatchCollection,
}
