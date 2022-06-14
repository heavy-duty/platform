use crate::collections::{Collaborator, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::program::UserManager;

#[derive(Accounts)]
pub struct DeleteCollaborator<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  #[account(mut)]
  pub receiver: Signer<'info>,
  pub authority: Signer<'info>,
  #[account(
    has_one = authority @ ErrorCode::UnauthorizedDeleteCollaborator
  )]
  pub workspace: Account<'info, Workspace>,
  #[account(mut, has_one = workspace, close = receiver)]
  pub collaborator: Account<'info, Collaborator>,
}

pub fn handle(_ctx: Context<DeleteCollaborator>) -> Result<()> {
  msg!("Delete collaborator");
  Ok(())
}
