use crate::collections::{Collaborator, User, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  pub user: Box<Account<'info, User>>,
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + user
    // bump + created at
    space = 8 + 32 + 32 + 32 + 1 + 8,
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

pub fn handle(ctx: Context<CreateCollaborator>) -> ProgramResult {
  msg!("Create collaborator");
  ctx.accounts.collaborator.authority = ctx.accounts.authority.key();
  ctx.accounts.collaborator.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collaborator.user = ctx.accounts.user.key();
  ctx.accounts.collaborator.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collaborator.bump = *ctx.bumps.get("collaborator").unwrap();
  ctx.accounts.workspace.quantity_of_collaborators += 1;
  Ok(())
}
