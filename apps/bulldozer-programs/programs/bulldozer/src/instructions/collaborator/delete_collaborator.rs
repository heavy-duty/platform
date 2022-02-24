use crate::collections::{Collaborator, Workspace};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteCollaborator<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut, has_one = workspace, close = authority)]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(ctx: Context<DeleteCollaborator>) -> ProgramResult {
  msg!("Delete collaborator");
  ctx.accounts.workspace.decrease_collaborator_quantity();
  Ok(())
}
