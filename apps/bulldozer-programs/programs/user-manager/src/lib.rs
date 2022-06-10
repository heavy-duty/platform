use anchor_lang::prelude::*;

pub mod collections;
pub mod instructions;

use instructions::*;

declare_id!("AoVeQTkP3k9NoNH2yQxCaRDJ53kdC6ARVc447eFBJwTV");

#[program]
pub mod user_manager {
  use super::*;

  pub fn create_user(ctx: Context<CreateUser>, arguments: CreateUserArguments) -> Result<()> {
    instructions::create_user::handle(ctx, arguments)
  }

  pub fn update_user(ctx: Context<UpdateUser>, arguments: UpdateUserArguments) -> Result<()> {
    instructions::update_user::handle(ctx, arguments)
  }

  pub fn delete_user(ctx: Context<DeleteUser>) -> Result<()> {
    instructions::delete_user::handle(ctx)
  }
}
