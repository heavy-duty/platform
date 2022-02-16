use crate::collections::{Collaborator, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollaborator<'info> {
  #[account(
    mut,
    close = authority,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      receiver.key().as_ref(),
    ],
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  pub receiver: UncheckedAccount<'info>,
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteCollaborator>) -> ProgramResult {
  msg!("Delete collaborator");
  ctx.accounts.workspace.quantity_of_collaborators -= 1;
  Ok(())
}
