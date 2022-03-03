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

  pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
    instructions::create_user::handle(ctx)
  }

  pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
    instructions::delete_user::handle(ctx)
  }

  pub fn create_workspace(
    ctx: Context<CreateWorkspace>,
    arguments: CreateWorkspaceArguments,
  ) -> Result<()> {
    instructions::create_workspace::handle(ctx, arguments)
  }

  pub fn update_workspace(
    ctx: Context<UpdateWorkspace>,
    arguments: UpdateWorkspaceArguments,
  ) -> Result<()> {
    instructions::update_workspace::handle(ctx, arguments)
  }

  pub fn delete_workspace(ctx: Context<DeleteWorkspace>) -> Result<()> {
    instructions::delete_workspace::handle(ctx)
  }

  pub fn create_collaborator(ctx: Context<CreateCollaborator>) -> Result<()> {
    instructions::create_collaborator::handle(ctx)
  }

  pub fn update_collaborator(
    ctx: Context<UpdateCollaborator>,
    arguments: UpdateCollaboratorArguments,
  ) -> Result<()> {
    instructions::update_collaborator::handle(ctx, arguments)
  }

  pub fn delete_collaborator(ctx: Context<DeleteCollaborator>) -> Result<()> {
    instructions::delete_collaborator::handle(ctx)
  }

  pub fn request_collaborator_status(ctx: Context<RequestCollaboratorStatus>) -> Result<()> {
    instructions::request_collaborator_status::handle(ctx)
  }

  pub fn retry_collaborator_status_request(
    ctx: Context<RetryCollaboratorStatusRequest>,
  ) -> Result<()> {
    instructions::retry_collaborator_status_request::handle(ctx)
  }

  #[access_control(instructions::create_application::validate(&ctx))]
  pub fn create_application(
    ctx: Context<CreateApplication>,
    arguments: CreateApplicationArguments,
  ) -> Result<()> {
    instructions::create_application::handle(ctx, arguments)
  }

  pub fn update_application(
    ctx: Context<UpdateApplication>,
    arguments: UpdateApplicationArguments,
  ) -> Result<()> {
    instructions::update_application::handle(ctx, arguments)
  }

  pub fn delete_application(ctx: Context<DeleteApplication>) -> Result<()> {
    instructions::delete_application::handle(ctx)
  }

  #[access_control(instructions::create_collection::validate(&ctx))]
  pub fn create_collection(
    ctx: Context<CreateCollection>,
    arguments: CreateCollectionArguments,
  ) -> Result<()> {
    instructions::create_collection::handle(ctx, arguments)
  }

  pub fn update_collection(
    ctx: Context<UpdateCollection>,
    arguments: UpdateCollectionArguments,
  ) -> Result<()> {
    instructions::update_collection::handle(ctx, arguments)
  }

  pub fn delete_collection(ctx: Context<DeleteCollection>) -> Result<()> {
    instructions::delete_collection::handle(ctx)
  }

  #[access_control(instructions::create_collection_attribute::validate(&ctx, &arguments))]
  pub fn create_collection_attribute(
    ctx: Context<CreateCollectionAttribute>,
    arguments: CreateCollectionAttributeArguments,
  ) -> Result<()> {
    instructions::create_collection_attribute::handle(ctx, arguments)
  }

  #[access_control(instructions::update_collection_attribute::validate(&ctx, &arguments))]
  pub fn update_collection_attribute(
    ctx: Context<UpdateCollectionAttribute>,
    arguments: UpdateCollectionAttributeArguments,
  ) -> Result<()> {
    instructions::update_collection_attribute::handle(ctx, arguments)
  }

  pub fn delete_collection_attribute(ctx: Context<DeleteCollectionAttribute>) -> Result<()> {
    instructions::delete_collection_attribute::handle(ctx)
  }

  #[access_control(instructions::create_instruction::validate(&ctx))]
  pub fn create_instruction(
    ctx: Context<CreateInstruction>,
    arguments: CreateInstructionArguments,
  ) -> Result<()> {
    instructions::create_instruction::handle(ctx, arguments)
  }

  pub fn update_instruction(
    ctx: Context<UpdateInstruction>,
    arguments: UpdateInstructionArguments,
  ) -> Result<()> {
    instructions::update_instruction::handle(ctx, arguments)
  }

  pub fn update_instruction_body(
    ctx: Context<UpdateInstructionBody>,
    arguments: UpdateInstructionBodyArguments,
  ) -> Result<()> {
    instructions::update_instruction_body::handle(ctx, arguments)
  }

  pub fn delete_instruction(ctx: Context<DeleteInstruction>) -> Result<()> {
    instructions::delete_instruction::handle(ctx)
  }

  #[access_control(instructions::create_instruction_argument::validate(&ctx, &arguments))]
  pub fn create_instruction_argument(
    ctx: Context<CreateInstructionArgument>,
    arguments: CreateInstructionArgumentArguments,
  ) -> Result<()> {
    instructions::create_instruction_argument::handle(ctx, arguments)
  }

  #[access_control(instructions::update_instruction_argument::validate(&ctx, &arguments))]
  pub fn update_instruction_argument(
    ctx: Context<UpdateInstructionArgument>,
    arguments: UpdateInstructionArgumentArguments,
  ) -> Result<()> {
    instructions::update_instruction_argument::handle(ctx, arguments)
  }

  pub fn delete_instruction_argument(ctx: Context<DeleteInstructionArgument>) -> Result<()> {
    instructions::delete_instruction_argument::handle(ctx)
  }

  #[access_control(instructions::create_instruction_account::validate(&ctx, &arguments))]
  pub fn create_instruction_account(
    ctx: Context<CreateInstructionAccount>,
    arguments: CreateInstructionAccountArguments,
  ) -> Result<()> {
    instructions::create_instruction_account::handle(ctx, arguments)
  }

  #[access_control(instructions::update_instruction_account::validate(&ctx, &arguments))]
  pub fn update_instruction_account(
    ctx: Context<UpdateInstructionAccount>,
    arguments: UpdateInstructionAccountArguments,
  ) -> Result<()> {
    instructions::update_instruction_account::handle(ctx, arguments)
  }

  pub fn delete_instruction_account(ctx: Context<DeleteInstructionAccount>) -> Result<()> {
    instructions::delete_instruction_account::handle(ctx)
  }

  #[access_control(instructions::create_instruction_relation::validate(&ctx))]
  pub fn create_instruction_relation(ctx: Context<CreateInstructionRelation>) -> Result<()> {
    instructions::create_instruction_relation::handle(ctx)
  }

  pub fn delete_instruction_relation(ctx: Context<DeleteInstructionRelation>) -> Result<()> {
    instructions::delete_instruction_relation::handle(ctx)
  }
}
