use crate::collections::{
  Application, Attribute, AttributeDto, AttributeKindSetter, AttributeModifierSetter, Instruction,
  InstructionArgument,
};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
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

pub fn handler(ctx: Context<CreateInstructionArgument>, dto: AttributeDto) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.data = Attribute {
    name: vectorize_string(dto.name, 32),
    kind: None,
    modifier: None,
  };
  ctx
    .accounts
    .argument
    .data
    .set_kind(Some(dto.kind), dto.max, dto.max_length)?;
  ctx
    .accounts
    .argument
    .data
    .set_modifier(dto.modifier, dto.size)?;
  Ok(())
}
