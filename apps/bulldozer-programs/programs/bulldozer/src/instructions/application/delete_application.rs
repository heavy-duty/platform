use crate::collections::{Application, Workspace};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = application.quantity_of_collections == 0 @ ErrorCode::CantDeleteApplicationWithCollections,
    constraint = application.quantity_of_instructions == 0 @ ErrorCode::CantDeleteApplicationWithInstructions
  )]
  pub application: Account<'info, Application>,
  #[account(
    mut,
    constraint = application.workspace == workspace.key() @ ErrorCode::WorkspaceDoesntMatchApplication
  )]
  pub workspace: Account<'info, Workspace>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteApplication>) -> ProgramResult {
  msg!("Delete application");
  ctx.accounts.workspace.quantity_of_applications -= 1;
  Ok(())
}
