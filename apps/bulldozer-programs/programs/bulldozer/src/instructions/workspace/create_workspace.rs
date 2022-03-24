use crate::collections::{Budget, Collaborator, User, Workspace, WorkspaceStats};
use crate::enums::CollaboratorStatus;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateWorkspaceArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateWorkspaceArguments)]
pub struct CreateWorkspace<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = Workspace::space(),
  )]
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
    init,
    payer = authority,
    space = WorkspaceStats::space(),
    seeds = [
      b"workspace_stats".as_ref(),
      workspace.key().as_ref()
    ],
    bump,
  )]
  pub workspace_stats: Box<Account<'info, WorkspaceStats>>,
  #[account(
    init,
    payer = authority,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump,
    space = Collaborator::space(),
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    init,
    payer = authority,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    space = Budget::space(),
  )]
  pub budget: Box<Account<'info, Budget>>,
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> Result<()> {
  msg!("Create workspace");
  ctx.accounts.workspace.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    *ctx.bumps.get("workspace_stats").unwrap(),
  );
  ctx.accounts.workspace.initialize_timestamp()?;
  ctx.accounts.workspace_stats.initialize();
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Approved { id: 1 },
    true,
    *ctx.bumps.get("collaborator").unwrap(),
  );
  ctx.accounts.collaborator.initialize_timestamp()?;
  ctx.accounts.budget.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    *ctx.bumps.get("budget").unwrap(),
  );
  ctx.accounts.budget.initialize_timestamp()?;
  Ok(())
}
