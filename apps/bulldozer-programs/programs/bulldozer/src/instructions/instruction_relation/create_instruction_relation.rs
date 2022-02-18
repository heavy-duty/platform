use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionAccount, InstructionRelation, User,
  Workspace,
};
use crate::errors::ErrorCode;
use crate::utils::get_budget_rent_exemption;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateInstructionRelation<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application
    // instruction + from + to + bump + created at + updated at
    space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 1 + 8 + 8 + 100,
    seeds = [
      b"instruction_relation".as_ref(),
      from.key().as_ref(),
      to.key().as_ref()
    ],
    bump,
    constraint = from.key().as_ref() != to.key().as_ref()
  )]
  pub relation: Box<Account<'info, InstructionRelation>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(mut)]
  pub to: Box<Account<'info, InstructionAccount>>,
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
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump
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
  pub system_program: Program<'info, System>,
}

pub fn validate(
  ctx: &Context<CreateInstructionRelation>,
) -> std::result::Result<bool, ProgramError> {
  let relation_rent = **ctx.accounts.relation.to_account_info().lamports.borrow();
  let budget = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let budget_rent_exemption = get_budget_rent_exemption()?;

  if relation_rent + budget_rent_exemption > budget {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(ctx: Context<CreateInstructionRelation>) -> ProgramResult {
  msg!("Create instruction relation");

  // charge back to the authority
  let rent = **ctx.accounts.relation.to_account_info().lamports.borrow();
  **ctx
    .accounts
    .budget
    .to_account_info()
    .try_borrow_mut_lamports()? -= rent;
  **ctx
    .accounts
    .authority
    .to_account_info()
    .try_borrow_mut_lamports()? += rent;

  ctx.accounts.relation.authority = ctx.accounts.authority.key();
  ctx.accounts.relation.workspace = ctx.accounts.workspace.key();
  ctx.accounts.relation.application = ctx.accounts.application.key();
  ctx.accounts.relation.instruction = ctx.accounts.instruction.key();
  ctx.accounts.relation.from = ctx.accounts.from.key();
  ctx.accounts.relation.to = ctx.accounts.to.key();
  ctx.accounts.relation.bump = *ctx.bumps.get("relation").unwrap();
  ctx.accounts.from.quantity_of_relations += 1;
  ctx.accounts.to.quantity_of_relations += 1;
  ctx.accounts.relation.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.relation.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
