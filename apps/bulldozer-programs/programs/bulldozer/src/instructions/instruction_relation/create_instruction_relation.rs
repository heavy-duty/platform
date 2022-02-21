use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionAccount, InstructionRelation, User,
  Workspace,
};
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, has_enough_funds};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateInstructionRelation<'info> {
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
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.relation.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(ctx: Context<CreateInstructionRelation>) -> ProgramResult {
  msg!("Create instruction relation");
  fund_rent_for_account(
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
  ctx.accounts.from.increase_relation_quantity();
  ctx.accounts.to.increase_relation_quantity();
  Ok(())
}
