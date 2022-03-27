use crate::collections::{
  Collaborator, Collection, Instruction, InstructionAccount, User, Workspace,
};
use crate::enums::{AccountKinds, AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use crate::utils::{get_account_key, get_remaining_account};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionAccountArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionAccountArguments)]
pub struct UpdateInstructionAccount<'info> {
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    mut,
    constraint = account.workspace == workspace.key() @ ErrorCode::InstructionAccountDoesNotBelongToWorkspace,
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
}

pub fn validate(
  ctx: &Context<UpdateInstructionAccount>,
  arguments: &UpdateInstructionAccountArguments,
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
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateInstructionAccount>,
  arguments: UpdateInstructionAccountArguments,
) -> Result<()> {
  msg!("Update instruction account");
  ctx.accounts.account.rename(arguments.name);
  ctx.accounts.account.change_settings(
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
  ctx.accounts.account.bump_timestamp()?;
  Ok(())
}
