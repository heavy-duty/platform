use crate::collections::{Application, Budget, Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  #[account(
    mut,
    close = budget,
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
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteApplication>) -> ProgramResult {
  msg!("Delete application");
  ctx.accounts.workspace.decrease_application_quantity();
  Ok(())
}
