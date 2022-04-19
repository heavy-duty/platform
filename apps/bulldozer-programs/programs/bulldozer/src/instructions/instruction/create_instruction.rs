use crate::collections::{
  Application, ApplicationStats, Budget, Collaborator, Instruction, InstructionStats, User,
  Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
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
  #[account(
    init,
    payer = authority,
    space = InstructionStats::space(),
    seeds = [
      b"instruction_stats".as_ref(),
      instruction.key().as_ref()
    ],
    bump
  )]
  pub instruction_stats: Box<Account<'info, InstructionStats>>,
}

pub fn validate(ctx: &Context<CreateInstruction>) -> Result<bool> {
  let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let instruction_rent = **ctx.accounts.instruction.to_account_info().lamports.borrow();
  let instruction_stats_rent = **ctx
    .accounts
    .instruction_stats
    .to_account_info()
    .lamports
    .borrow();
  let funds_required = &Budget::get_rent_exemption()?
    .checked_add(instruction_rent)
    .unwrap()
    .checked_add(instruction_stats_rent)
    .unwrap();

  if budget_lamports.lt(funds_required) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateInstruction>,
  arguments: CreateInstructionArguments,
) -> Result<()> {
  msg!("Create instruction");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.instruction.to_account_info().lamports.borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .instruction_stats
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  ctx.accounts.instruction.initialize(
    arguments.name,
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    *ctx.bumps.get("instruction_stats").unwrap(),
  );
  ctx.accounts.instruction.initialize_timestamp()?;
  ctx.accounts.instruction_stats.initialize();
  ctx
    .accounts
    .application_stats
    .increase_instruction_quantity();
  Ok(())
}
