use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionAccount, InstructionAccountConstraint,
  User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionAccountConstraintArguments {
  pub name: String,
  pub body: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionAccountConstraintArguments)]
pub struct CreateInstructionAccountConstraint<'info> {
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
    constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
    constraint = account.application == application.key() @ ErrorCode::InstructionAccountDoesNotBelongToApplication,
    constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
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
    init,
    payer = authority,
    space = InstructionAccountConstraint::space(),
  )]
  pub account_constraint: Box<Account<'info, InstructionAccountConstraint>>,
}

pub fn validate(ctx: &Context<CreateInstructionAccountConstraint>) -> Result<bool> {
  let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
  let instruction_account_constraint_rent = **ctx
    .accounts
    .account_constraint
    .to_account_info()
    .lamports
    .borrow();
  let funds_required = &Budget::get_rent_exemption()?
    .checked_add(instruction_account_constraint_rent)
    .unwrap();

  if budget_lamports.lt(funds_required) {
    return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
  }

  Ok(true)
}

pub fn handle(
  ctx: Context<CreateInstructionAccountConstraint>,
  arguments: CreateInstructionAccountConstraintArguments,
) -> Result<()> {
  msg!("Create instruction account constraint");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_constraint
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  ctx.accounts.account_constraint.initialize(
    arguments.name,
    arguments.body,
    ctx.accounts.authority.key(),
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.instruction.key(),
    ctx.accounts.account.key(),
  );
  ctx.accounts.account_constraint.initialize_timestamp()?;
  Ok(())
}
