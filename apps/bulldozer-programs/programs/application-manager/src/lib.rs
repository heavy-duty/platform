use anchor_lang::prelude::*;

pub mod collections;
mod errors;
pub mod instructions;

use instructions::*;

declare_id!("F9fx9GDHRJDqtS9bKA82Eq3KpQvbsywu6j9c2VyffhrJ");

#[program]
pub mod application_manager {
    use super::*;

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

    pub fn set_application_authority(ctx: Context<SetApplicationAuthority>) -> Result<()> {
        instructions::set_application_authority::handle(ctx)
    }

    pub fn delete_application(ctx: Context<DeleteApplication>) -> Result<()> {
        instructions::delete_application::handle(ctx)
    }
}
