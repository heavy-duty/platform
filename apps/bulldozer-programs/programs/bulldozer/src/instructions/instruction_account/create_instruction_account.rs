use crate::collections::{
  Application, Budget, Collaborator, Collection, Instruction, InstructionAccount, User, Workspace,
};
use crate::enums::{get_account_kind, get_account_modifier};
use crate::errors::ErrorCode;
use crate::utils::{get_account_key, get_budget_rent_exemption, get_remaining_account};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionAccountArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionAccountArguments)]
pub struct CreateInstructionAccount<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application
    // instruction + name (size 32 + 4 ?) + kind + modifier
    // collection + payer + close + space + quantity of relations
    // created at + updated at
    space = 8 + 32 + 32 + 32 + 32 + 36 + 2 + 2 + 33 + 33 + 33 + 3 + 1 + 8 + 8
  )]
  pub account: Box<Account<'info, InstructionAccount>>,
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
  ctx: &Context<CreateInstructionAccount>,
  arguments: &CreateInstructionAccountArguments,
) -> std::result::Result<bool, ProgramError> {
  match (
    arguments.kind,
    get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?,
    arguments.modifier,
    arguments.space,
    get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?,
  ) {
    (0, None, _, _, _) => Err(ErrorCode::MissingCollectionAccount.into()),
    (_, _, Some(0), None, _) => Err(ErrorCode::MissingSpace.into()),
    (_, _, Some(0), _, None) => Err(ErrorCode::MissingPayerAccount.into()),
    _ => {
      let account_rent = **ctx.accounts.account.to_account_info().lamports.borrow();
      let budget = **ctx.accounts.budget.to_account_info().lamports.borrow();
      let budget_rent_exemption = get_budget_rent_exemption()?;

      if account_rent + budget_rent_exemption > budget {
        return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
      }

      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateInstructionAccount>,
  arguments: CreateInstructionAccountArguments,
) -> ProgramResult {
  msg!("Create instruction account");

  // charge back to the authority
  let rent = **ctx.accounts.account.to_account_info().lamports.borrow();
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

  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.workspace = ctx.accounts.workspace.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.name = arguments.name;
  ctx.accounts.account.kind = get_account_kind(
    arguments.kind,
    get_account_key(get_remaining_account::<Collection>(
      ctx.remaining_accounts,
      0,
    )?)?,
  )?;
  ctx.accounts.account.modifier = get_account_modifier(
    arguments.modifier,
    arguments.space,
    get_account_key(get_remaining_account::<InstructionAccount>(
      ctx.remaining_accounts,
      1,
    )?)?,
    get_account_key(get_remaining_account::<InstructionAccount>(
      ctx.remaining_accounts,
      1,
    )?)?,
  )?;
  ctx.accounts.account.quantity_of_relations = 0;
  ctx.accounts.instruction.quantity_of_accounts += 1;
  ctx.accounts.account.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.account.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
