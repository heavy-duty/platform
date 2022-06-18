use crate::collections::{
  Application, Collaborator, Instruction, InstructionAccount, InstructionAccountConstraint, User,
  Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionAccountConstraintArguments {
  pub name: String,
  pub body: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionAccountConstraintArguments)]
pub struct UpdateInstructionAccountConstraint<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace,
  )]
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
    constraint = account_constraint.account == account.key(),
  )]
  pub account_constraint: Box<Account<'info, InstructionAccountConstraint>>,
}

pub fn handle(
  ctx: Context<UpdateInstructionAccountConstraint>,
  arguments: UpdateInstructionAccountConstraintArguments,
) -> Result<()> {
  msg!("Update instruction account");
  ctx.accounts.account_constraint.name = arguments.name;
  ctx.accounts.account_constraint.body = arguments.body;
  Ok(())
}
