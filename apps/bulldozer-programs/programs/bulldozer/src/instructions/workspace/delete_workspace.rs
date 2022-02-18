use crate::collections::Workspace;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteWorkspace<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = workspace.quantity_of_applications == 0 @ ErrorCode::CantDeleteWorkspaceWithApplications,
    constraint = workspace.quantity_of_collaborators == 0 @ ErrorCode::CantDeleteWorkspaceWithCollaborators,
  )]
  pub workspace: Account<'info, Workspace>,
  pub authority: Signer<'info>,
}

pub fn handle(_ctx: Context<DeleteWorkspace>) -> ProgramResult {
  msg!("Delete workspace");
  Ok(())
}
