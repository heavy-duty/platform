use anchor_lang::prelude::*;

pub mod collections;
pub mod enums;
mod errors;
pub mod instructions;

use instructions::*;

declare_id!("472z8vQ6TBgY5cHYTJS2K1xzPbYfc4y3HTzZVrYacrWF");

#[program]
pub mod collection_manager {
    use super::*;

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

    pub fn set_collection_authority(ctx: Context<SetCollectionAuthority>) -> Result<()> {
        instructions::set_collection_authority::handle(ctx)
    }

    pub fn delete_collection(ctx: Context<DeleteCollection>) -> Result<()> {
        instructions::delete_collection::handle(ctx)
    }

    /* #[access_control(instructions::create_collection_attribute::validate(&ctx, &arguments))]
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
    } */
}
