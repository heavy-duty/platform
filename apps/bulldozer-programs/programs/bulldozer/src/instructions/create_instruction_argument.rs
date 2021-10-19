use crate::collections::{Application, Instruction, InstructionArgument, InstructionArgumentDto};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: InstructionArgumentDto)]
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
  dto: InstructionArgumentDto,
) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.name = vectorize_string(dto.name, 32);
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx
    .accounts
    .argument
    .set_kind(dto.kind, dto.max, dto.max_length)?;
  ctx.accounts.argument.set_modifier(dto.modifier, dto.size)?;
  Ok(())
}
