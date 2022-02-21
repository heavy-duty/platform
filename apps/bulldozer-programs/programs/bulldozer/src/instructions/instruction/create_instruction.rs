use crate::collections::{Application, Budget, Collaborator, Instruction, User, Workspace};
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
  #[account(
    init,
    payer = authority,
    space = Instruction::space()
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub application: Box<Account<'info, Application>>,
  pub workspace: Box<Account<'info, Workspace>>,
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

pub fn validate(ctx: &Context<CreateInstruction>) -> std::result::Result<bool, ProgramError> {
  if !has_enough_funds(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.instruction.to_account_info(),
    Budget::get_rent_exemption()?,
  ) {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateInstruction>,
  arguments: CreateInstructionArguments,
) -> ProgramResult {
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
  ctx.accounts.application.increase_instruction_quantity();
  Ok(())
}
