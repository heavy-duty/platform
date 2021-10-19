use crate::collections::{InstructionArgument, InstructionArgumentDto};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: InstructionArgumentDto)]
pub struct UpdateInstructionArgument<'info> {
  #[account(mut, has_one = authority)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateInstructionArgument>,
  dto: InstructionArgumentDto,
) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.name = vectorize_string(dto.name, 32);
  ctx
    .accounts
    .argument
    .set_kind(dto.kind, dto.max, dto.max_length)?;
  ctx.accounts.argument.set_modifier(dto.modifier, dto.size)?;
  Ok(())
}
