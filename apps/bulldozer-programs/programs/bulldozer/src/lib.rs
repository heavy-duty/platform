use anchor_lang::prelude::*;

mod collections;
mod enums;
mod errors;
mod instructions;
mod utils;

use instructions::*;

declare_id!("EYpJuu7FLtQAHXFY7vcCihRjAyBjb31HCGaJgo1c3fEo");

#[program]
pub mod bulldozer {
  use super::*;

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

  #[access_control(instructions::update_instruction_account::validate(&arguments))]
  pub fn update_instruction_account(
    ctx: Context<UpdateInstructionAccount>,
    arguments: UpdateInstructionAccountArguments,
  ) -> Result<()> {
    instructions::update_instruction_account::handle(ctx, arguments)
  }

  #[access_control(instructions::set_instruction_account_collection::validate(&ctx))]
  pub fn set_instruction_account_collection(
    ctx: Context<SetInstructionAccountCollection>,
  ) -> Result<()> {
    instructions::set_instruction_account_collection::handle(ctx)
  }

  #[access_control(instructions::set_instruction_account_close::validate(&ctx))]
  pub fn set_instruction_account_close(ctx: Context<SetInstructionAccountClose>) -> Result<()> {
    instructions::set_instruction_account_close::handle(ctx)
  }

  pub fn clear_instruction_account_close(ctx: Context<ClearInstructionAccountClose>) -> Result<()> {
    instructions::clear_instruction_account_close::handle(ctx)
  }

  #[access_control(instructions::set_instruction_account_payer::validate(&ctx))]
  pub fn set_instruction_account_payer(ctx: Context<SetInstructionAccountPayer>) -> Result<()> {
    instructions::set_instruction_account_payer::handle(ctx)
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
