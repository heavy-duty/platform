use crate::enums::{AttributeKinds, AttributeModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct CollectionAttribute {
  pub id: u32,
  pub authority: Pubkey,
  pub owner: Pubkey,
  pub name: String,
  pub kind: AttributeKinds,
  pub modifier: Option<AttributeModifiers>,
  pub created_at: i64,
  pub updated_at: i64,
  pub bump: u8,
}

impl CollectionAttribute {
  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn change_settings(
    &mut self,
    kind: AttributeKinds,
    modifier: Option<AttributeModifiers>,
  ) -> () {
    self.kind = kind;
    self.modifier = modifier;
  }

  pub fn bump_timestamp(&mut self) -> Result<()> {
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + id + authority + owner
    // name (size 32 + 4 ?) + kind + modifier
    // created at + updated at + bump
    8 + 4 + 32 + 32 + 36 + 6 + 6 + 8 + 8 + 1
  }
}
