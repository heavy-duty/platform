use crate::collections::{Application, Budget, Collaborator, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, has_enough_funds};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicationArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateApplicationArguments)]
pub struct CreateApplication<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(mut)]
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
    space = Application::space()
  )]
  pub application: Box<Account<'info, Application>>,
  pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<CreateApplication>) -> std::result::Result<bool, ProgramError> {
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.application.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateApplication>,
  arguments: CreateApplicationArguments,
) -> ProgramResult {
  msg!("Create application");
  fund_rent_for_account(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.application.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.application.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
  );
  ctx.accounts.application.initialize_timestamp()?;
  ctx.accounts.workspace.increase_application_quantity();
  Ok(())
}
