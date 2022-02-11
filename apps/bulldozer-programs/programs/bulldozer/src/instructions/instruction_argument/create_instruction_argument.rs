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
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub application: Box<Account<'info, Application>>,
  #[account(mut)]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn validate(_ctx: &Context<CreateInstructionArgument>, arguments: &CreateInstructionArgumentArguments) -> std::result::Result<bool, ProgramError> {
  match (
    arguments.kind,
    arguments.max,
    arguments.max_length,
  ) {
    (1, None, _) => Err(ErrorCode::MissingMax.into()),
    (2, _, None) => Err(ErrorCode::MissingMaxLength.into()),
    _ => Ok(true)
  }
}

pub fn handle(ctx: Context<CreateInstructionArgument>, arguments: CreateInstructionArgumentArguments) -> ProgramResult {
  msg!("Create instruction argument");
  ctx.accounts.argument.authority = ctx.accounts.authority.key();
  ctx.accounts.argument.workspace = ctx.accounts.workspace.key();
  ctx.accounts.argument.application = ctx.accounts.application.key();
  ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
  ctx.accounts.argument.name = arguments.name;
  ctx.accounts.argument.kind = get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.instruction.quantity_of_arguments += 1;
  ctx.accounts.argument.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.argument.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
