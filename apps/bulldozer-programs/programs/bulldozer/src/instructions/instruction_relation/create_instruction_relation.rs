use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionAccount, InstructionAccountStats,
  InstructionRelation, User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::{has_enough_funds, transfer_lamports};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateInstructionRelation<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    mut,
    constraint = from.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    constraint = from.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = from.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace
  )]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(
    mut,
    constraint = to.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    constraint = to.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = to.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace
  )]
  pub to: Box<Account<'info, InstructionAccount>>,
  #[account(
    init,
    payer = authority,
    space = InstructionRelation::space(),
    seeds = [
      b"instruction_relation".as_ref(),
      from.key().as_ref(),
      to.key().as_ref()
    ],
    bump,
    constraint = from.key().as_ref() != to.key().as_ref()
  )]
  pub relation: Box<Account<'info, InstructionRelation>>,
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
    mut,
    seeds = [
      b"instruction_account_stats".as_ref(),
      from.key().as_ref()
    ],
    bump = from.bumps.stats
  )]
  pub from_stats: Box<Account<'info, InstructionAccountStats>>,
  #[account(
    mut,
    seeds = [
      b"instruction_account_stats".as_ref(),
      to.key().as_ref()
    ],
    bump = to.bumps.stats
  )]
  pub to_stats: Box<Account<'info, InstructionAccountStats>>,
}

pub fn validate(ctx: &Context<CreateInstructionRelation>) -> Result<bool> {
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.relation.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(ctx: Context<CreateInstructionRelation>) -> Result<()> {
  msg!("Create instruction relation");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.relation.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.relation.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.instruction.key(),
    ctx.accounts.from.key(),
    ctx.accounts.to.key(),
    *ctx.bumps.get("relation").unwrap(),
  );
  ctx.accounts.relation.initialize_timestamp()?;
  ctx.accounts.from_stats.increase_relation_quantity();
  ctx.accounts.to_stats.increase_relation_quantity();
  Ok(())
}
