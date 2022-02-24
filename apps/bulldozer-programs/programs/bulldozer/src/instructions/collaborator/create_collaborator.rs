use crate::collections::{Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  pub user: Box<Account<'info, User>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = authority_user.bump
  )]
  pub authority_user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      authority_user.key().as_ref(),
    ],
    bump = authority_collaborator.bump,
    constraint = authority_collaborator.is_admin @ ErrorCode::OnlyAdminCollaboratorCanUpdate,
  )]
  pub authority_collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    init,
    payer = authority,
    space = Collaborator::space(),
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref()
    ],
    bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateCollaborator>) -> ProgramResult {
  msg!("Create collaborator");
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Approved { id: 1 },
    false,
    *ctx.bumps.get("collaborator").unwrap(),
  );
  ctx.accounts.collaborator.initialize_timestamp()?;
  ctx.accounts.workspace.increase_collaborator_quantity();
  Ok(())
}
