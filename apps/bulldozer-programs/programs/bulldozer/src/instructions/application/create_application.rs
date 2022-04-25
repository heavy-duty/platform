use crate::collections::{
  Application, ApplicationStats, Budget, Collaborator, User, Workspace, WorkspaceStats,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicationArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateApplicationArguments)]
pub struct CreateApplication<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    init,
    payer = authority,
    space = Application::space()
  )]
  pub application: Box<Account<'info, Application>>,
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
  #[account(
    init,
    payer = authority,
    space = ApplicationStats::space(),
    seeds = [
      b"application_stats".as_ref(),
      application.key().as_ref()
    ],
    bump
  )]
  pub application_stats: Box<Account<'info, ApplicationStats>>,
}

pub fn validate(ctx: &Context<CreateApplication>) -> Result<bool> {
  let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let application_rent = **ctx.accounts.application.to_account_info().lamports.borrow();
  let application_stats_rent = **ctx
    .accounts
    .application_stats
    .to_account_info()
    .lamports
    .borrow();
  let funds_required = &Budget::get_rent_exemption()?
    .checked_add(application_rent)
    .unwrap()
    .checked_add(application_stats_rent)
    .unwrap();

  if budget_lamports.lt(funds_required) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateApplication>,
  arguments: CreateApplicationArguments,
) -> Result<()> {
  msg!("Create application");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.application.to_account_info().lamports.borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .application_stats
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  ctx.accounts.application.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    *ctx.bumps.get("application_stats").unwrap(),
  );
  ctx.accounts.application.initialize_timestamp()?;
  ctx.accounts.application_stats.initialize();
  ctx.accounts.workspace_stats.increase_application_quantity();
  Ok(())
}
