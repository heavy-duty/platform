use crate::collections::{Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollaboratorArguments {
  pub status: u8,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollaboratorArguments)]
pub struct UpdateCollaborator<'info> {
  #[account(mut)]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = authority_collaborator.bump,
    constraint = authority_collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate,
  )]
  pub authority_collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(
  ctx: Context<UpdateCollaborator>,
  arguments: UpdateCollaboratorArguments,
) -> Result<()> {
  msg!("Update collaborator");
  ctx
    .accounts
    .collaborator
    .change_status(CollaboratorStatus::create(arguments.status)?);
  ctx.accounts.collaborator.bump_timestamp()?;
  Ok(())
}
