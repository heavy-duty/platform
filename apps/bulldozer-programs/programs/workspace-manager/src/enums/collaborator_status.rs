use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum CollaboratorStatus {
  Pending { id: u8 },
  Approved { id: u8 },
  Rejected { id: u8 },
}

impl CollaboratorStatus {
  pub fn create(status: u8) -> Result<CollaboratorStatus> {
    match status {
      0 => Ok(CollaboratorStatus::Pending { id: 0 }),
      1 => Ok(CollaboratorStatus::Approved { id: 1 }),
      2 => Ok(CollaboratorStatus::Rejected { id: 2 }),
      _ => Err(error!(ErrorCode::InvalidCollaboratorStatus)),
    }
  }
}
