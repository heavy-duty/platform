use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum CollaboratorStatus {
  Pending,
  Approved,
  Rejected,
}

impl CollaboratorStatus {
  pub fn create(status: u8) -> std::result::Result<CollaboratorStatus, ProgramError> {
    match status {
      0 => Ok(CollaboratorStatus::Pending {}),
      1 => Ok(CollaboratorStatus::Approved {}),
      2 => Ok(CollaboratorStatus::Rejected {}),
      _ => Err(ErrorCode::InvalidCollaboratorStatus.into()),
    }
  }
}
