use crate::collections::{Collaborator, Instruction, User, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionArguments)]
pub struct UpdateInstruction<'info> {
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
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn handle(
  ctx: Context<UpdateInstruction>,
  arguments: UpdateInstructionArguments,
) -> ProgramResult {
  msg!("Update instruction");
  ctx.accounts.instruction.rename(arguments.name);
  ctx.accounts.instruction.bump_timestamp()?;
  Ok(())
}
