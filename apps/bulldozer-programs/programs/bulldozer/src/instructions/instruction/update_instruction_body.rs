use crate::collections::{Collaborator, Instruction, User};
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
  pub authority: Signer<'info>,
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
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
      instruction.workspace.as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(
  ctx: Context<UpdateInstructionBody>,
  arguments: UpdateInstructionBodyArguments,
) -> Result<()> {
  msg!("Update instruction body");
  ctx.accounts.instruction.change_body(arguments.body);
  ctx.accounts.instruction.bump_timestamp()?;
  Ok(())
}
