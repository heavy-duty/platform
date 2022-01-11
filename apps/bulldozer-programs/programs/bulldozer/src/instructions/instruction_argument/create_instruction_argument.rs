use crate::collections::{
  Application, Instruction, InstructionArgument, Workspace,
};
use anchor_lang::prelude::*;
use crate::enums::{
  get_attribute_kind,
  get_attribute_modifier
};
use crate::errors::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionArgumentArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionArgumentArguments)]
pub struct CreateInstructionArgument<'info> {
  #[account(
    init,
    payer = authority,
    // discriminator + authority + workspace + application
    // instruction + name (size 32 + 4 ?) + kind + modifier
    // created at + updated at
    space = 8 + 32 + 32 + 32 + 32 + 36 + 6 + 6 + 8 + 8,
    constraint = arguments.kind == 0 || arguments.kind == 1 && arguments.max != None || arguments.kind == 2 @ ErrorCode::MissingMax,
    constraint = arguments.kind == 0 || arguments.kind == 1 || arguments.kind == 2 && arguments.max_length != None @ ErrorCode::MissingMaxLength,
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<CreateInstructionArgument>, arguments: CreateInstructionArgumentArguments) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.workspace = ctx.accounts.workspace.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.name = arguments.name;
  ctx.accounts.argument.kind = get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.instruction.quantity_of_arguments += 1;
  ctx.accounts.argument.created_at = ctx.accounts.clock.unix_timestamp;
  ctx.accounts.argument.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
