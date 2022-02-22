use crate::collections::{Budget, Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
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
    space = Workspace::space(),
  )]
  pub workspace: Box<Account<'info, Workspace>>,
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
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> ProgramResult {
  msg!("Create workspace");
  ctx
    .accounts
    .workspace
    .initialize(arguments.name, *ctx.accounts.authority.key);
  ctx.accounts.workspace.initialize_timestamp()?;
  ctx.accounts.collaborator.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.user.key(),
    CollaboratorStatus::Approved {},
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
