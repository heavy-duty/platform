use crate::collections::{Budget, Collaborator, User, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateWorkspaceArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateWorkspaceArguments)]
pub struct CreateWorkspace<'info> {
  #[account(mut)]
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
    init,
    payer = authority,
    // discriminator + authority + name (size 32 + 4 ?)
    // quantity of apps + quantity of collaborators +
    // created_at + updated_at
    space = 8 + 32 + 36 + 1 + 1 + 8 + 8,
  )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + user
    // bump + created at
    space = 8 + 32 + 32 + 32 + 1 + 8,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump
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
    // discriminator + authority + workspace + bump
    space = 8 + 32 + 32 + 1,
  )]
  pub budget: Box<Account<'info, Budget>>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> ProgramResult {
  msg!("Create workspace");
  ctx.accounts.workspace.name = arguments.name;
  ctx.accounts.workspace.authority = ctx.accounts.authority.key();
  ctx.accounts.workspace.quantity_of_applications = 0;
  ctx.accounts.workspace.quantity_of_collaborators = 1;
  ctx.accounts.workspace.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.workspace.updated_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collaborator.authority = ctx.accounts.authority.key();
  ctx.accounts.collaborator.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collaborator.user = ctx.accounts.user.key();
  ctx.accounts.collaborator.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collaborator.bump = *ctx.bumps.get("collaborator").unwrap();
  ctx.accounts.budget.workspace = ctx.accounts.workspace.key();
  ctx.accounts.budget.authority = ctx.accounts.authority.key();
  ctx.accounts.budget.bump = *ctx.bumps.get("budget").unwrap();
  Ok(())
}
