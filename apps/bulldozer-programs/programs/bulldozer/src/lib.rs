use anchor_lang::prelude::*;

mod collections;
mod enums;
mod errors;
mod instructions;
mod utils;

use collections::*;
use instructions::*;

declare_id!("GVm1TjFD3V6paG5ef4cvpd7fc27bwyjityN2sbyPJpef");

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
    dto: AttributeDto,
  ) -> ProgramResult {
    instructions::create_collection_attribute::handler(ctx, dto)
  }

  pub fn update_collection_attribute(
    ctx: Context<UpdateCollectionAttribute>,
    dto: AttributeDto,
  ) -> ProgramResult {
    instructions::update_collection_attribute::handler(ctx, dto)
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
    dto: AttributeDto,
  ) -> ProgramResult {
    instructions::create_instruction_argument::handler(ctx, dto)
  }

  pub fn update_instruction_argument(
    ctx: Context<UpdateInstructionArgument>,
    dto: AttributeDto,
  ) -> ProgramResult {
    instructions::update_instruction_argument::handler(ctx, dto)
  }

  pub fn delete_instruction_argument(ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
    instructions::delete_instruction_argument::handler(ctx)
  }

  pub fn create_instruction_account(
    ctx: Context<CreateInstructionAccount>,
    dto: AccountDto,
  ) -> ProgramResult {
    instructions::create_instruction_account::handler(ctx, dto)
  }

  pub fn update_instruction_account(
    ctx: Context<UpdateInstructionAccount>,
    dto: AccountDto,
  ) -> ProgramResult {
    instructions::update_instruction_account::handler(ctx, dto)
  }

  pub fn delete_instruction_account(ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
    instructions::delete_instruction_account::handler(ctx)
  }

  pub fn create_instruction_relation(
    ctx: Context<CreateInstructionRelation>,
    bump: u8,
  ) -> ProgramResult {
    instructions::create_instruction_relation::handler(ctx, bump)
  }

  pub fn update_instruction_relation(ctx: Context<UpdateInstructionRelation>) -> ProgramResult {
    instructions::update_instruction_relation::handler(ctx)
  }

  pub fn delete_instruction_relation(ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
    instructions::delete_instruction_relation::handler(ctx)
  }
}
