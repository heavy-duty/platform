use crate::collections::Collection;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollectionArguments {
  pub id: u32,
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateCollectionArguments)]
pub struct CreateCollection<'info> {
  pub system_program: Program<'info, System>,
  /// CHECK: An collection owner can be anything
  pub owner: UncheckedAccount<'info>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = Collection::space(),
    seeds = [
      b"collection".as_ref(),
      owner.key().as_ref(),
      &arguments.id.to_le_bytes(),
    ],
    bump,
  )]
  pub collection: Account<'info, Collection>,
}

pub fn handle(ctx: Context<CreateCollection>, arguments: CreateCollectionArguments) -> Result<()> {
  msg!("Create collection");
  ctx.accounts.collection.id = arguments.id;
  ctx.accounts.collection.name = arguments.name;
  ctx.accounts.collection.authority = ctx.accounts.authority.key();
  ctx.accounts.collection.owner = ctx.accounts.owner.key();
  ctx.accounts.collection.bump = *ctx.bumps.get("collection").unwrap();
  ctx.accounts.collection.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collection.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
