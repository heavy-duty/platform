use crate::collections::{
  Application, ApplicationStats, Budget, Collaborator, Instruction, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, has_enough_funds};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionArguments)]
pub struct CreateInstruction<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    mut,
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace
  )]
  pub application: Box<Account<'info, Application>>,
  #[account(
    init,
    payer = authority,
    space = Instruction::space()
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    mut,
    seeds = [
      b"application_stats".as_ref(),
      application.key().as_ref()
    ],
    bump = application.application_stats_bump
  )]
  pub application_stats: Box<Account<'info, ApplicationStats>>,
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

pub fn validate(ctx: &Context<CreateInstruction>) -> Result<bool> {
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.instruction.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateInstruction>,
  arguments: CreateInstructionArguments,
) -> Result<()> {
  msg!("Create instruction");
  fund_rent_for_account(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.instruction.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.instruction.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
  );
  ctx.accounts.instruction.initialize_timestamp()?;
  ctx
    .accounts
    .application_stats
    .increase_instruction_quantity();
  Ok(())
}
