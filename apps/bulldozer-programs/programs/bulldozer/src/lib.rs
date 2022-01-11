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

  pub fn create_workspace(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> ProgramResult {
    instructions::create_workspace::handler(ctx, arguments)
  }

  pub fn update_workspace(ctx: Context<UpdateWorkspace>, arguments: UpdateWorkspaceArguments) -> ProgramResult {
    instructions::update_workspace::handler(ctx, arguments)
  }

  pub fn delete_workspace(ctx: Context<DeleteWorkspace>) -> ProgramResult {
    instructions::delete_workspace::handler(ctx)
  }

  pub fn create_application(ctx: Context<CreateApplication>, arguments: CreateApplicationArguments) -> ProgramResult {
    instructions::create_application::handler(ctx, arguments)
  }

  pub fn update_application(ctx: Context<UpdateApplication>, arguments: UpdateApplicationArguments) -> ProgramResult {
    instructions::update_application::handler(ctx, arguments)
  }

  pub fn delete_application(ctx: Context<DeleteApplication>) -> ProgramResult {
    instructions::delete_application::handler(ctx)
  }

  pub fn create_collection(ctx: Context<CreateCollection>, arguments: CreateCollectionArguments) -> ProgramResult {
    instructions::create_collection::handler(ctx, arguments)
  }

  pub fn update_collection(ctx: Context<UpdateCollection>, arguments: UpdateCollectionArguments) -> ProgramResult {
    instructions::update_collection::handler(ctx, arguments)
  }

  pub fn delete_collection(ctx: Context<DeleteCollection>) -> ProgramResult {
    instructions::delete_collection::handler(ctx)
  }

  pub fn create_collection_attribute(
    ctx: Context<CreateCollectionAttribute>,
    arguments: CreateCollectionAttributeArguments,
  ) -> ProgramResult {
    instructions::create_collection_attribute::handler(ctx, arguments)
  }

  pub fn update_collection_attribute(
    ctx: Context<UpdateCollectionAttribute>,
    arguments: UpdateCollectionAttributeArguments,
  ) -> ProgramResult {
    instructions::update_collection_attribute::handler(ctx, arguments)
  }

  pub fn delete_collection_attribute(ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
    instructions::delete_collection_attribute::handler(ctx)
  }

  pub fn create_instruction(ctx: Context<CreateInstruction>, arguments: CreateInstructionArguments) -> ProgramResult {
    instructions::create_instruction::handler(ctx, arguments)
  }

  pub fn update_instruction(ctx: Context<UpdateInstruction>, arguments: UpdateInstructionArguments) -> ProgramResult {
    instructions::update_instruction::handler(ctx, arguments)
  }

  pub fn update_instruction_body(
    ctx: Context<UpdateInstructionBody>,
    arguments: UpdateInstructionBodyArguments,
  ) -> ProgramResult {
    instructions::update_instruction_body::handler(ctx, arguments)
  }

  pub fn delete_instruction(ctx: Context<DeleteInstruction>) -> ProgramResult {
    instructions::delete_instruction::handler(ctx)
  }

  pub fn create_instruction_argument(
    ctx: Context<CreateInstructionArgument>,
    arguments: CreateInstructionArgumentArguments,
  ) -> ProgramResult {
    instructions::create_instruction_argument::handler(ctx, arguments)
  }

  pub fn update_instruction_argument(
    ctx: Context<UpdateInstructionArgument>,
    arguments: UpdateInstructionArgumentArguments,
  ) -> ProgramResult {
    instructions::update_instruction_argument::handler(ctx, arguments)
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
