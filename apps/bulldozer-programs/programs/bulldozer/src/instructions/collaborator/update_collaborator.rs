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
  pub authority: Signer<'info>,
  #[account(has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut, has_one = workspace)]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub system_program: Program<'info, System>,
}

pub fn handle(
  ctx: Context<UpdateCollaborator>,
  arguments: UpdateCollaboratorArguments,
) -> ProgramResult {
  msg!("Update collaborator");
  ctx
    .accounts
    .collaborator
    .change_status(CollaboratorStatus::create(arguments.status)?);
  ctx.accounts.collaborator.bump_timestamp()?;
  Ok(())
}
