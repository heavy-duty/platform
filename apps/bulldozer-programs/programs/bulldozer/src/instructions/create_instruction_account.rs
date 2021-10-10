use crate::collections::{Application, Instruction, InstructionAccount};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, space: Option<u16>, program: Option<Pubkey>)]
pub struct CreateInstructionAccount<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2 + 33 + 33 + 33 + 3
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(
  ctx: Context<CreateInstructionAccount>,
  name: String,
  kind: u8,
  modifier: u8,
  space: Option<u16>,
  program: Option<Pubkey>,
) -> ProgramResult {
  msg!("Create instruction account");
  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.name = vectorize_string(name, 32);
  ctx
    .accounts
    .account
    .set_kind(kind, ctx.remaining_accounts, program)?;
  ctx
    .accounts
    .account
    .set_modifier(modifier, ctx.remaining_accounts, space)?;

  Ok(())
}
