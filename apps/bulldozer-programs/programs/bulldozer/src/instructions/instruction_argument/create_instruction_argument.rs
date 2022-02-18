use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionArgument, User, Workspace,
};
use crate::enums::{get_attribute_kind, get_attribute_modifier};
use crate::errors::ErrorCode;
use crate::utils::get_budget_rent_exemption;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionArgumentArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionArgumentArguments)]
pub struct CreateInstructionArgument<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application
    // instruction + name (size 32 + 4 ?) + kind + modifier
    // created at + updated at
    space = 8 + 32 + 32 + 32 + 32 + 36 + 6 + 6 + 8 + 8,
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
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

pub fn validate(
  ctx: &Context<CreateInstructionArgument>,
  arguments: &CreateInstructionArgumentArguments,
) -> std::result::Result<bool, ProgramError> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(ErrorCode::MissingMax.into()),
    (2, _, None) => Err(ErrorCode::MissingMaxLength.into()),
    _ => {
      let argument_rent = **ctx.accounts.argument.to_account_info().lamports.borrow();
      let budget = **ctx.accounts.budget.to_account_info().lamports.borrow();
      let budget_rent_exemption = get_budget_rent_exemption()?;

      if argument_rent + budget_rent_exemption > budget {
        return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
      }

      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateInstructionArgument>,
  arguments: CreateInstructionArgumentArguments,
) -> ProgramResult {
  msg!("Create instruction argument");

  // charge back to the authority
  let rent = **ctx.accounts.argument.to_account_info().lamports.borrow();
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

  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.workspace = ctx.accounts.workspace.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.name = arguments.name;
  ctx.accounts.argument.kind =
    get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.instruction.quantity_of_arguments += 1;
  ctx.accounts.argument.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.argument.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
