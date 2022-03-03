use crate::enums::{AttributeKinds, AttributeModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct InstructionArgument {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub name: String,
  pub kind: AttributeKinds,
  pub modifier: Option<AttributeModifiers>,
  pub created_at: i64,
  pub updated_at: i64,
}

impl InstructionArgument {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    instruction: Pubkey,
    kind: AttributeKinds,
    modifier: Option<AttributeModifiers>,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.instruction = instruction;
    self.name = name;
    self.kind = kind;
    self.modifier = modifier;
  }

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
    // discriminator + authority + workspace + application
    // instruction + name (size 32 + 4 ?) + kind + modifier
    // created at + updated at
    8 + 32 + 32 + 32 + 32 + 36 + 6 + 6 + 8 + 8
  }
}
