use anchor_lang::prelude::*;

pub mod collections;
pub mod enums;
pub mod errors;
mod instructions;
pub mod utils;

use instructions::*;

declare_id!("E4kBuz9gC7T32LBKnH3kscxjay1Y3KqFkXJt8UHq1BN4");

#[program]
pub mod bulldozer {
  use super::*;

  pub fn create_application(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
    instructions::create_application::handler(ctx, name)
  }

  pub fn update_application(ctx: Context<UpdateApplication>, name: String) -> ProgramResult {
    instructions::update_application::handler(ctx, name)
  }

  pub fn delete_application(ctx: Context<DeleteApplication>) -> ProgramResult {
    instructions::delete_application::handler(ctx)
  }

  pub fn create_collection(ctx: Context<CreateCollection>, name: String) -> ProgramResult {
    instructions::create_collection::handler(ctx, name)
  }

  pub fn update_collection(ctx: Context<UpdateCollection>, name: String) -> ProgramResult {
    instructions::update_collection::handler(ctx, name)
  }

  pub fn delete_collection(ctx: Context<DeleteCollection>) -> ProgramResult {
    instructions::delete_collection::handler(ctx)
  }

  pub fn create_collection_attribute(
    ctx: Context<CreateCollectionAttribute>,
    name: String,
    kind: u8,
    modifier: u8,
    size: u8,
  ) -> ProgramResult {
    instructions::create_collection_attribute::handler(ctx, name, kind, modifier, size)
  }

  pub fn update_collection_attribute(
    ctx: Context<UpdateCollectionAttribute>,
    name: String,
    kind: u8,
    modifier: u8,
    size: u8,
  ) -> ProgramResult {
    instructions::update_collection_attribute::handler(ctx, name, kind, modifier, size)
  }

  pub fn delete_collection_attribute(ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
    instructions::delete_collection_attribute::handler(ctx)
  }

  pub fn create_instruction(ctx: Context<CreateInstruction>, name: String) -> ProgramResult {
    instructions::create_instruction::handler(ctx, name)
  }

  pub fn update_instruction(ctx: Context<UpdateInstruction>, name: String) -> ProgramResult {
    instructions::update_instruction::handler(ctx, name)
  }

  pub fn delete_instruction(ctx: Context<DeleteInstruction>) -> ProgramResult {
    instructions::delete_instruction::handler(ctx)
  }

  pub fn create_instruction_argument(
    ctx: Context<CreateInstructionArgument>,
    name: String,
    kind: u8,
    modifier: u8,
    size: u8,
  ) -> ProgramResult {
    instructions::create_instruction_argument::handler(ctx, name, kind, modifier, size)
  }

  pub fn update_instruction_argument(
    ctx: Context<UpdateInstructionArgument>,
    name: String,
    kind: u8,
    modifier: u8,
    size: u8,
  ) -> ProgramResult {
    instructions::update_instruction_argument::handler(ctx, name, kind, modifier, size)
  }

  pub fn delete_instruction_argument(ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
    instructions::delete_instruction_argument::handler(ctx)
  }

  pub fn create_instruction_account(
    ctx: Context<CreateInstructionAccount>,
    name: String,
    kind: u8,
    modifier: u8,
    space: Option<u16>,
    program: Option<Pubkey>,
  ) -> ProgramResult {
    msg!("KIND: {}", kind);
    msg!("MODIFIER: {}", modifier);
    instructions::create_instruction_account::handler(ctx, name, kind, modifier, space, program)
  }

  pub fn update_instruction_account(
    ctx: Context<UpdateInstructionAccount>,
    name: String,
    kind: u8,
    modifier: u8,
    space: Option<u16>,
    program: Option<Pubkey>,
  ) -> ProgramResult {
    instructions::update_instruction_account::handler(ctx, name, kind, modifier, space, program)
  }

  pub fn create_instruction_basic_account(
    ctx: Context<CreateInstructionBasicAccount>,
    name: String,
    mark_attribute: u8,
  ) -> ProgramResult {
    instructions::create_instruction_basic_account::handler(ctx, name, mark_attribute)
  }

  pub fn update_instruction_basic_account(
    ctx: Context<UpdateInstructionBasicAccount>,
    name: String,
    mark_attribute: u8,
  ) -> ProgramResult {
    instructions::update_instruction_basic_account::handler(ctx, name, mark_attribute)
  }

  pub fn delete_instruction_basic_account(
    ctx: Context<DeleteInstructionBasicAccount>,
  ) -> ProgramResult {
    instructions::delete_instruction_basic_account::handler(ctx)
  }

  pub fn create_instruction_program_account(
    ctx: Context<CreateInstructionProgramAccount>,
    name: String,
  ) -> ProgramResult {
    instructions::create_instruction_program_account::handler(ctx, name)
  }

  pub fn update_instruction_program_account(
    ctx: Context<UpdateInstructionProgramAccount>,
    name: String,
  ) -> ProgramResult {
    instructions::update_instruction_program_account::handler(ctx, name)
  }

  pub fn delete_instruction_program_account(
    ctx: Context<DeleteInstructionProgramAccount>,
  ) -> ProgramResult {
    instructions::delete_instruction_program_account::handler(ctx)
  }

  pub fn create_instruction_signer_account(
    ctx: Context<CreateInstructionSignerAccount>,
    name: String,
    mark_attribute: u8,
  ) -> ProgramResult {
    instructions::create_instruction_signer_account::handler(ctx, name, mark_attribute)
  }

  pub fn update_instruction_signer_account(
    ctx: Context<UpdateInstructionSignerAccount>,
    name: String,
    mark_attribute: u8,
  ) -> ProgramResult {
    instructions::update_instruction_signer_account::handler(ctx, name, mark_attribute)
  }

  pub fn delete_instruction_signer_account(
    ctx: Context<DeleteInstructionSignerAccount>,
  ) -> ProgramResult {
    instructions::delete_instruction_signer_account::handler(ctx)
  }
}
