use crate::collections::{
  Application, Attribute, AttributeDto, Instruction, InstructionArgument, Workspace,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct CreateInstructionArgument<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 3 + 3,
    )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionArgument>, dto: AttributeDto) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.workspace = ctx.accounts.workspace.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.data = Attribute::create(dto)?;
  Ok(())
}
