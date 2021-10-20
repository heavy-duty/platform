use crate::collections::{
  AccountClose, AccountCollection, AccountDto, AccountKind, AccountModifier, AccountPayer,
  AccountSpace, Application, BaseAccount, Instruction, InstructionAccount,
};
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AccountDto)]
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

pub fn handler(ctx: Context<CreateInstructionAccount>, dto: AccountDto) -> ProgramResult {
  msg!("Create instruction account");
  ctx.accounts.account.authority = ctx.accounts.authority.key();
  ctx.accounts.account.application = ctx.accounts.application.key();
  ctx.accounts.account.instruction = ctx.accounts.instruction.key();
  ctx.accounts.account.data = BaseAccount {
    name: vectorize_string(dto.name, 32),
    kind: None,
    modifier: None,
    collection: None,
    payer: None,
    close: None,
    space: None,
  };

  ctx.accounts.account.data.set_kind(Some(dto.kind))?;
  ctx
    .accounts
    .account
    .data
    .set_collection(Some(dto.kind), ctx.remaining_accounts)?;
  ctx.accounts.account.data.set_modifier(dto.modifier)?;
  ctx
    .accounts
    .account
    .data
    .set_payer(dto.modifier, ctx.remaining_accounts)?;
  ctx
    .accounts
    .account
    .data
    .set_close(dto.modifier, ctx.remaining_accounts)?;
  ctx
    .accounts
    .account
    .data
    .set_space(dto.modifier, dto.space)?;

  Ok(())
}
