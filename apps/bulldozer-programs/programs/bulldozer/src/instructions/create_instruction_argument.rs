use crate::collections::{Application, Instruction, InstructionArgument};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>
)]
pub struct CreateInstructionArgument<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3,
    )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(
  ctx: Context<CreateInstructionArgument>,
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.name = vectorize_string(name, 32);
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.set_kind(kind, max, max_length)?;
  ctx.accounts.argument.set_modifier(modifier, size)?;
  Ok(())
}
