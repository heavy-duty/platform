use crate::collections::{Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RequestCollaboratorStatus<'info> {
  #[account(mut)]
  pub workspace: Box<Account<'info, Workspace>>,
  pub user: Box<Account<'info, User>>,
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
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<RequestCollaboratorStatus>) -> ProgramResult {
  msg!("Request collaborator status");
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Pending {},
    false,
    *ctx.bumps.get("collaborator").unwrap(),
  );
  ctx.accounts.collaborator.initialize_timestamp()?;
  ctx.accounts.workspace.increase_collaborator_quantity();
  Ok(())
}
