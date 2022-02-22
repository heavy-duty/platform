use crate::collections::{Collaborator, Instruction, User, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionBodyArguments {
  pub body: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionBodyArguments)]
pub struct UpdateInstructionBody<'info> {
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
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
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved {} @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(
  ctx: Context<UpdateInstructionBody>,
  arguments: UpdateInstructionBodyArguments,
) -> ProgramResult {
  msg!("Update instruction body");
  ctx.accounts.instruction.change_body(arguments.body);
  ctx.accounts.instruction.bump_timestamp()?;
  Ok(())
}
