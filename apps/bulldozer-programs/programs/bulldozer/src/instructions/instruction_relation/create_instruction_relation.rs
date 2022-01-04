use crate::collections::{
  Application, Instruction, InstructionAccount, InstructionRelation, Workspace,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct CreateInstructionRelation<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + workspace + application
        // instruction + from + to + bump
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 1,
        seeds = [
          b"instruction_relation",
          from.key().as_ref(),
          to.key().as_ref()
        ],
        bump = bump,
        constraint = from.key().as_ref() != to.key().as_ref()
    )]
  pub relation: Box<Account<'info, InstructionRelation>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub from: Box<Account<'info, InstructionAccount>>,
  #[account(mut)]
  pub to: Box<Account<'info, InstructionAccount>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionRelation>, bump: u8) -> ProgramResult {
  msg!("Create instruction relation");
  ctx.accounts.relation.authority = ctx.accounts.authority.key();
  ctx.accounts.relation.workspace = ctx.accounts.workspace.key();
  ctx.accounts.relation.application = ctx.accounts.application.key();
  ctx.accounts.relation.instruction = ctx.accounts.instruction.key();
  ctx.accounts.relation.from = ctx.accounts.from.key();
  ctx.accounts.relation.to = ctx.accounts.to.key();
  ctx.accounts.relation.bump = bump;
  ctx.accounts.from.quantity_of_relations += 1;
  ctx.accounts.to.quantity_of_relations += 1;
  Ok(())
}
