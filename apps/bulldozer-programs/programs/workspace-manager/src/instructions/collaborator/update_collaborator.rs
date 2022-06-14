use crate::collections::{Collaborator, Workspace};
use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollaboratorArguments {
  pub status: u8,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollaboratorArguments)]
pub struct UpdateCollaborator<'info> {
  #[account(mut)]
  pub collaborator: Account<'info, Collaborator>,
  pub authority: Signer<'info>,
  #[account(has_one = authority)]
  pub workspace: Account<'info, Workspace>,
}

pub fn handle(
  ctx: Context<UpdateCollaborator>,
  arguments: UpdateCollaboratorArguments,
) -> Result<()> {
  msg!("Update collaborator");
  ctx.accounts.collaborator.status = CollaboratorStatus::create(arguments.status)?;
  ctx.accounts.collaborator.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
