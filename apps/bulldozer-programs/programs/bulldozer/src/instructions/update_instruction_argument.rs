use crate::collections::{
  Attribute, AttributeDto, AttributeKindSetter, AttributeModifierSetter, InstructionArgument,
};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct UpdateInstructionArgument<'info> {
  #[account(mut, has_one = authority)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionArgument>, dto: AttributeDto) -> ProgramResult {
  msg!("Update instruction argument");
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
