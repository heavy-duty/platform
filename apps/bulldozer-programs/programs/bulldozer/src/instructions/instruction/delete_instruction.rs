use crate::collections::{Application, Budget, Collaborator, Instruction, User, Workspace};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstruction<'info> {
  #[account(
    mut,
    close = budget,
    constraint = instruction.quantity_of_arguments == 0 @ ErrorCode::CantDeleteInstructionWithArguments,
    constraint = instruction.quantity_of_accounts == 0 @ ErrorCode::CantDeleteInstructionWithAccounts,
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    constraint = instruction.application == application.key() @ ErrorCode::ApplicationDoesntMatchInstruction
  )]
  pub application: Account<'info, Application>,
  pub workspace: Box<Account<'info, Workspace>>,
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
}

pub fn handle(ctx: Context<DeleteInstruction>) -> ProgramResult {
  msg!("Delete instruction");
  ctx.accounts.application.quantity_of_instructions -= 1;
  Ok(())
}
