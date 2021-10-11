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

  pub fn update_instruction_body(
    ctx: Context<UpdateInstructionBody>,
    body: String,
  ) -> ProgramResult {
    instructions::update_instruction_body::handler(ctx, body)
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

  pub fn delete_instruction_account(ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
    instructions::delete_instruction_account::handler(ctx)
  }
}
