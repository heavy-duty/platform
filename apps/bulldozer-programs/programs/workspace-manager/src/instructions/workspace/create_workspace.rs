use crate::collections::{Workspace, WorkspaceStats};
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateWorkspaceArguments {
  pub id: u8,
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateWorkspaceArguments)]
pub struct CreateWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    init,
    payer = authority,
    space = Workspace::space(),
    seeds = [
      b"workspace".as_ref(),
      user.key().as_ref(),
      arguments.id.to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub workspace: Box<Account<'info, Workspace>>,
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
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> Result<()> {
  msg!("Create workspace");
  ctx.accounts.workspace.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    *ctx.bumps.get("workspace").unwrap(),
    *ctx.bumps.get("workspace_stats").unwrap(),
  );
  ctx.accounts.workspace.initialize_timestamp()?;
  ctx.accounts.workspace_stats.initialize();
  Ok(())
}
