use crate::collections::{
  Application, Budget, Collaborator, Collection, Instruction, InstructionAccount, InstructionStats,
  User, Workspace,
};
use crate::enums::{AccountKinds, AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, get_account_key, get_remaining_account};
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
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccount::space()
  )]
  pub account: Box<Account<'info, InstructionAccount>>,
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
      b"instruction_stats".as_ref(),
      instruction.key().as_ref()
    ],
    bump = instruction.instruction_stats_bump
  )]
  pub instruction_stats: Box<Account<'info, InstructionStats>>,
}

pub fn validate(
  ctx: &Context<CreateInstructionAccount>,
  arguments: &CreateInstructionAccountArguments,
) -> Result<bool> {
  match (
    arguments.kind,
    get_remaining_account::<Collection>(ctx.remaining_accounts, 0)?,
    arguments.modifier,
    arguments.space,
    get_remaining_account::<InstructionAccount>(ctx.remaining_accounts, 1)?,
  ) {
    (0, None, _, _, _) => Err(error!(ErrorCode::MissingCollectionAccount)),
    (_, _, Some(0), None, _) => Err(error!(ErrorCode::MissingSpace)),
    (_, _, Some(0), _, None) => Err(error!(ErrorCode::MissingPayerAccount)),
    _ => {
      let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
      let instruction_account_rent = **ctx.accounts.account.to_account_info().lamports.borrow();

      let funds_required = &Budget::get_rent_exemption()?
        .checked_add(instruction_account_rent)
        .unwrap();

      if budget_lamports.lt(funds_required) {
        return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
      }

      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateInstructionAccount>,
  arguments: CreateInstructionAccountArguments,
) -> Result<()> {
  msg!("Create instruction account");
  fund_rent_for_account(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.account.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.account.initialize(
    arguments.name,
    ctx.accounts.authority.key(),
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.instruction.key(),
    AccountKinds::create(
      arguments.kind,
      get_account_key(get_remaining_account::<Collection>(
        ctx.remaining_accounts,
        0,
      )?)?,
    )?,
    AccountModifiers::create(
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
    )?,
  );
  ctx.accounts.account.initialize_timestamp()?;
  ctx.accounts.instruction_stats.increase_account_quantity();
  Ok(())
}
