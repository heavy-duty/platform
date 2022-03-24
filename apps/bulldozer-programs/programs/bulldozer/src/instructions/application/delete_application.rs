use crate::collections::{Application, Budget, Collaborator, User, Workspace, WorkspaceStats};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,
    close = budget,
    constraint = application.quantity_of_collections == 0 @ ErrorCode::CantDeleteApplicationWithCollections,
    constraint = application.quantity_of_instructions == 0 @ ErrorCode::CantDeleteApplicationWithInstructions,
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Account<'info, Application>,
  #[account(
    mut,
    seeds = [
      b"workspace_stats".as_ref(),
      workspace.key().as_ref()
    ],
    bump = workspace.workspace_stats_bump,
  )]
  pub workspace_stats: Box<Account<'info, WorkspaceStats>>,
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
      application.workspace.as_ref(),
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
      application.workspace.as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<DeleteApplication>) -> Result<()> {
  msg!("Delete application");
  ctx.accounts.workspace_stats.decrease_application_quantity();
  Ok(())
}
