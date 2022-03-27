use anchor_lang::prelude::*;

#[account]
pub struct CollectionStats {
  pub quantity_of_attributes: u8,
}

impl CollectionStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_attributes = 0;
  }

  pub fn increase_attribute_quantity(&mut self) -> () {
    self.quantity_of_attributes += 1;
  }

  pub fn decrease_attribute_quantity(&mut self) -> () {
    self.quantity_of_attributes -= 1;
  }

  pub fn space() -> usize {
    // discriminator + quantity of attributes
    8 + 1
  }
}

#[account]
pub struct Collection {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub collection_stats_bump: u8,
}

impl Collection {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    collection_stats_bump: u8,
  ) -> () {
    self.name = name;
    self.authority = authority;
    self.application = application;
    self.workspace = workspace;
    self.collection_stats_bump = collection_stats_bump;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn initialize_timestamp(&mut self) -> Result<()> {
    self.created_at = Clock::get()?.unix_timestamp;
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn bump_timestamp(&mut self) -> Result<()> {
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + application + string (size 32 + 4 ?)
    // created at + updated at + collection stats bump
    8 + 32 + 32 + 32 + 36 + 8 + 8 + 1
  }
}
