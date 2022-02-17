use crate::collections::{Workspace, Collaborator};
use anchor_lang::prelude::*;


#[derive(Accounts)]
pub struct AddCollaborator<'info> {
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + owner
    // bump + created at
    space = 8 + 32 + 32 + 32 + 1 + 8,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      receiver.key().as_ref()
    ],
    bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub receiver: UncheckedAccount<'info>,
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<AddCollaborator>) -> ProgramResult {
  msg!("Add collaborator");
  ctx.accounts.collaborator.authority = ctx.accounts.authority.key();
  ctx.accounts.collaborator.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collaborator.owner = ctx.accounts.receiver.key();
  ctx.accounts.collaborator.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collaborator.bump = *ctx.bumps.get("collaborator").unwrap();
  ctx.accounts.workspace.quantity_of_collaborators += 1;
  Ok(())
}
