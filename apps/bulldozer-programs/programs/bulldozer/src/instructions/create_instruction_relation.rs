use crate::collections::{Application, Instruction, InstructionAccount, InstructionRelation};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateInstructionRelation<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32
    )]
  pub relation: Box<Account<'info, InstructionRelation>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  pub from: Box<Account<'info, InstructionAccount>>,
  pub to: Box<Account<'info, InstructionAccount>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionRelation>) -> ProgramResult {
  msg!("Create instruction relation");
  ctx.accounts.relation.authority = ctx.accounts.authority.key();
  ctx.accounts.relation.application = ctx.accounts.application.key();
  ctx.accounts.relation.instruction = ctx.accounts.instruction.key();
  ctx.accounts.relation.from = ctx.accounts.from.key();
  ctx.accounts.relation.to = ctx.accounts.to.key();

  Ok(())
}
