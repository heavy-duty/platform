use crate::collections::{
  Budget, Collaborator, Instruction, InstructionAccount, InstructionAccountClose,
  InstructionAccountCollection, InstructionAccountPayer, InstructionAccountStats, InstructionStats,
  User, Workspace,
};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    close = budget,
    constraint = account.instruction == instruction.key() @ ErrorCode::InstructionAccountDoesNotBelongToInstruction,
    constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace
  )]
  pub account: Account<'info, InstructionAccount>,
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
      account.workspace.as_ref(),
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
      account.workspace.as_ref(),
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
  #[account(
    mut,
    close = budget,
    constraint = account_stats.quantity_of_relations == 0 @ ErrorCode::CantDeleteAccountWithRelations,
    seeds = [
      b"instruction_account_stats".as_ref(),
      account.key().as_ref()
    ],
    bump = account.bumps.stats
  )]
  pub account_stats: Box<Account<'info, InstructionAccountStats>>,
  #[account(
    mut,
    close = budget,
    seeds = [
      b"instruction_account_collection".as_ref(),
      account.key().as_ref()
    ],
    bump = account.bumps.collection
  )]
  pub account_collection: Box<Account<'info, InstructionAccountCollection>>,
  #[account(
    mut,
    close = budget,
    seeds = [
      b"instruction_account_close".as_ref(),
      account.key().as_ref()
    ],
    bump = account.bumps.close
  )]
  pub account_close: Box<Account<'info, InstructionAccountClose>>,
  #[account(
    mut,
    close = budget,
    seeds = [
      b"instruction_account_payer".as_ref(),
      account.key().as_ref()
    ],
    bump = account.bumps.payer
  )]
  pub account_payer: Box<Account<'info, InstructionAccountPayer>>,
}

pub fn handle(ctx: Context<DeleteInstructionAccount>) -> Result<()> {
  msg!("Delete instruction account");
  ctx.accounts.instruction_stats.decrease_account_quantity();
  Ok(())
}
