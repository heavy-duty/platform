use crate::collections::{
  AccountDto, Application, BaseAccount, Instruction, InstructionAccount, Workspace,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AccountDto)]
pub struct CreateInstructionAccount<'info> {
  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 2 + 33 + 33 + 33 + 3
    )]
  pub account: Box<Account<'info, InstructionAccount>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateInstructionAccount>, dto: AccountDto) -> ProgramResult {
  msg!("Create instruction account");
  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.workspace = ctx.accounts.workspace.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.data = BaseAccount::create(dto, ctx.remaining_accounts)?;

  Ok(())
}
