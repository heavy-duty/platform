use anchor_lang::prelude::*;
use crate::collections::{Application, Collection, CollectionAttribute};
use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::utils::{vectorize_string};

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct CreateCollectionAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3
    )]
    pub attribute: Box<Account<'info, CollectionAttribute>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
    msg!("Create collection attribute");
    ctx.accounts.attribute.name = vectorize_string(name, 32);
    ctx.accounts.attribute.kind = AttributeKind::from_index(kind)?;
    ctx.accounts.attribute.modifier = AttributeKindModifier::from_index(modifier, size)?;
    ctx.accounts.attribute.authority = ctx.accounts.authority.key();
    ctx.accounts.attribute.collection = ctx.accounts.collection.key();
    ctx.accounts.attribute.application = ctx.accounts.application.key();
    Ok(())
}
