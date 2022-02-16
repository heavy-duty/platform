use anchor_lang::prelude::*;

mod collections;
mod enums;
mod errors;
mod instructions;
mod utils;

use instructions::*;

declare_id!("7WgU9mAEgB1doxyKisYd2HAxdsNUrpfP6tAPvyNYnFfD");

#[program]
pub mod bulldozer {
  use super::*;

  pub fn create_workspace(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> ProgramResult {
    instructions::create_workspace::handle(ctx, arguments)
  }

  pub fn update_workspace(ctx: Context<UpdateWorkspace>, arguments: UpdateWorkspaceArguments) -> ProgramResult {
    instructions::update_workspace::handle(ctx, arguments)
  }

  pub fn delete_workspace(ctx: Context<DeleteWorkspace>) -> ProgramResult {
    instructions::delete_workspace::handle(ctx)
  }

  pub fn add_collaborator(ctx: Context<AddCollaborator>) -> ProgramResult {
    instructions::add_collaborator::handle(ctx)
  }

  pub fn delete_collaborator(ctx: Context<DeleteCollaborator>) -> ProgramResult {
    instructions::delete_collaborator::handle(ctx)
  }

  pub fn create_application(ctx: Context<CreateApplication>, arguments: CreateApplicationArguments) -> ProgramResult {
    instructions::create_application::handle(ctx, arguments)
  }

  pub fn update_application(ctx: Context<UpdateApplication>, arguments: UpdateApplicationArguments) -> ProgramResult {
    instructions::update_application::handle(ctx, arguments)
  }

  pub fn delete_application(ctx: Context<DeleteApplication>) -> ProgramResult {
    instructions::delete_application::handle(ctx)
  }

  pub fn create_collection(ctx: Context<CreateCollection>, arguments: CreateCollectionArguments) -> ProgramResult {
    instructions::create_collection::handle(ctx, arguments)
  }

  pub fn update_collection(ctx: Context<UpdateCollection>, arguments: UpdateCollectionArguments) -> ProgramResult {
    instructions::update_collection::handle(ctx, arguments)
  }

  pub fn delete_collection(ctx: Context<DeleteCollection>) -> ProgramResult {
    instructions::delete_collection::handle(ctx)
  }

  #[access_control(instructions::create_collection_attribute::validate(&ctx, &arguments))]
  pub fn create_collection_attribute(
    ctx: Context<CreateCollectionAttribute>,
    arguments: CreateCollectionAttributeArguments,
  ) -> ProgramResult {
    instructions::create_collection_attribute::handle(ctx, arguments)
  }

  #[access_control(instructions::update_collection_attribute::validate(&ctx, &arguments))]
  pub fn update_collection_attribute(
    ctx: Context<UpdateCollectionAttribute>,
    arguments: UpdateCollectionAttributeArguments,
  ) -> ProgramResult {
    instructions::update_collection_attribute::handle(ctx, arguments)
  }

  pub fn delete_collection_attribute(ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
    instructions::delete_collection_attribute::handle(ctx)
  }

  pub fn create_instruction(ctx: Context<CreateInstruction>, arguments: CreateInstructionArguments) -> ProgramResult {
    instructions::create_instruction::handle(ctx, arguments)
  }

  pub fn update_instruction(ctx: Context<UpdateInstruction>, arguments: UpdateInstructionArguments) -> ProgramResult {
    instructions::update_instruction::handle(ctx, arguments)
  }

  pub fn update_instruction_body(
    ctx: Context<UpdateInstructionBody>,
    arguments: UpdateInstructionBodyArguments,
  ) -> ProgramResult {
    instructions::update_instruction_body::handle(ctx, arguments)
  }

  pub fn delete_instruction(ctx: Context<DeleteInstruction>) -> ProgramResult {
    instructions::delete_instruction::handle(ctx)
  }

  #[access_control(instructions::create_instruction_argument::validate(&ctx, &arguments))]
  pub fn create_instruction_argument(
    ctx: Context<CreateInstructionArgument>,
    arguments: CreateInstructionArgumentArguments,
  ) -> ProgramResult {
    instructions::create_instruction_argument::handle(ctx, arguments)
  }

  #[access_control(instructions::update_instruction_argument::validate(&ctx, &arguments))]
  pub fn update_instruction_argument(
    ctx: Context<UpdateInstructionArgument>,
    arguments: UpdateInstructionArgumentArguments,
  ) -> ProgramResult {
    instructions::update_instruction_argument::handle(ctx, arguments)
  }

  pub fn delete_instruction_argument(ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
    instructions::delete_instruction_argument::handle(ctx)
  }

  #[access_control(instructions::create_instruction_account::validate(&ctx, &arguments))]
  pub fn create_instruction_account(
    ctx: Context<CreateInstructionAccount>,
    arguments: CreateInstructionAccountArguments,
  ) -> ProgramResult {
    instructions::create_instruction_account::handle(ctx, arguments)
  }

  #[access_control(instructions::update_instruction_account::validate(&ctx, &arguments))]
  pub fn update_instruction_account(
    ctx: Context<UpdateInstructionAccount>,
    arguments: UpdateInstructionAccountArguments,
  ) -> ProgramResult {
    instructions::update_instruction_account::handle(ctx, arguments)
  }

  pub fn delete_instruction_account(ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
    instructions::delete_instruction_account::handle(ctx)
  }

  pub fn create_instruction_relation(
    ctx: Context<CreateInstructionRelation>
  ) -> ProgramResult {
    instructions::create_instruction_relation::handle(ctx)
  }

  pub fn delete_instruction_relation(ctx: Context<DeleteInstructionRelation>) -> ProgramResult {
    instructions::delete_instruction_relation::handle(ctx)
  }
}
