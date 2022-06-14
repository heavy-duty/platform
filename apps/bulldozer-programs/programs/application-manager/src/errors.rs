use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("You don't have permission to update this application.")]
  UnauthorizedApplicationUpdate,
  #[msg("You don't have permission to set the authority of this application.")]
  UnauthorizedApplicationSetAuthority,
  #[msg("You don't have permission to delete this application.")]
  UnauthorizedApplicationDelete,
  #[msg("It's not possible to delete an application that has instructions.")]
  CantDeleteApplicationWithInstructions,
  #[msg("It's not possible to delete an application that has collections.")]
  CantDeleteApplicationWithCollections,
}
