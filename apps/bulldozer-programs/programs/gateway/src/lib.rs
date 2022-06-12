use anchor_lang::prelude::*;

mod instructions;

use instructions::*;

declare_id!("DuHpQ4mnb4GDP5r6ed3iBTZf3ETSPP4wTe7yTn6Ls6ZH");

#[program]
pub mod gateway {
    use super::*;

    pub fn create_workspace(ctx: Context<CreateWorkspace>, id: u8, name: String) -> Result<()> {
        instructions::create_workspace::handle(ctx, id, name)
    }

    pub fn delete_workspace(ctx: Context<DeleteWorkspace>) -> Result<()> {
        instructions::delete_workspace::handle(ctx)
    }
}
