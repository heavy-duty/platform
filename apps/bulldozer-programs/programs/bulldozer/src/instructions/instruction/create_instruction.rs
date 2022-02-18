use crate::collections::{Application, Budget, Collaborator, Instruction, User, Workspace};
use crate::errors::ErrorCode;
use crate::utils::get_budget_rent_exemption;
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
    // discriminator + authority + workspace + application
    // name (size 32 + 4 ?) + body + quantity of arguments
    // quantity of accounts + created at + updated at
    space = 8 + 32 + 32 + 32 + 33 + 2000 + 1 + 1 + 8 + 8
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
  let instruction_rent = **ctx.accounts.instruction.to_account_info().lamports.borrow();
  let budget = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let budget_rent_exemption = get_budget_rent_exemption()?;

  if instruction_rent + budget_rent_exemption > budget {
    return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateInstruction>,
  arguments: CreateInstructionArguments,
) -> ProgramResult {
  msg!("Create instruction");

  // charge back to the authority
  let rent = **ctx.accounts.instruction.to_account_info().lamports.borrow();
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

  ctx.accounts.instruction.authority = ctx.accounts.authority.key();
  ctx.accounts.instruction.workspace = ctx.accounts.workspace.key();
  ctx.accounts.instruction.application = ctx.accounts.application.key();
  ctx.accounts.instruction.name = arguments.name;
  ctx.accounts.instruction.body = "".to_string();
  ctx.accounts.instruction.quantity_of_arguments = 0;
  ctx.accounts.instruction.quantity_of_accounts = 0;
  ctx.accounts.application.quantity_of_instructions += 1;
  ctx.accounts.instruction.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.instruction.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
