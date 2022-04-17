use crate::enums::{AccountKinds, AccountModifiers};
use anchor_lang::prelude::*;

#[account]
pub struct InstructionAccountStats {
  pub quantity_of_relations: u8,
}

impl InstructionAccountStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_relations = 0;
  }

  pub fn increase_relation_quantity(&mut self) -> () {
    self.quantity_of_relations += 1;
  }

  pub fn decrease_relation_quantity(&mut self) -> () {
    self.quantity_of_relations -= 1;
  }

  pub fn space() -> usize {
    // discriminator + quantity of relations
    8 + 1
  }
}

#[account]
pub struct InstructionAccountCollection {
  pub collection: Option<Pubkey>,
}

impl InstructionAccountCollection {
  pub fn set(&mut self, collection: Option<Pubkey>) -> () {
    self.collection = collection;
  }

  pub fn space() -> usize {
    // discriminator + collection public key
    8 + 33
  }
}

#[account]
pub struct InstructionAccountPayer {
  pub payer: Option<Pubkey>,
}

impl InstructionAccountPayer {
  pub fn set(&mut self, payer: Option<Pubkey>) -> () {
    self.payer = payer;
  }

  pub fn space() -> usize {
    // discriminator + collection public key
    8 + 33
  }
}

#[account]
pub struct InstructionAccountClose {
  pub close: Option<Pubkey>,
}

impl InstructionAccountClose {
  pub fn set(&mut self, close: Option<Pubkey>) -> () {
    self.close = close;
  }

  pub fn space() -> usize {
    // discriminator + collection public key
    8 + 33
  }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InstructionAccountBumps {
  pub stats: u8,
  pub collection: u8,
  pub payer: u8,
  pub close: u8,
}

#[account]
pub struct InstructionAccount {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub name: String,
  pub kind: AccountKinds,
  pub modifier: Option<AccountModifiers>,
  pub space: Option<u16>,
  pub created_at: i64,
  pub updated_at: i64,
  pub bumps: InstructionAccountBumps,
}

impl InstructionAccount {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    instruction: Pubkey,
    kind: AccountKinds,
    modifier: Option<AccountModifiers>,
    space: Option<u16>,
    bumps: InstructionAccountBumps,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.instruction = instruction;
    self.name = name;
    self.kind = kind;
    self.modifier = modifier;
    self.space = space;
    self.bumps = bumps;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn set_modifier(&mut self, modifier: Option<AccountModifiers>) -> () {
    self.modifier = modifier;
  }

  pub fn set_space(&mut self, space: Option<u16>) -> () {
    self.space = space;
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
    // payer + close + space + stats bump + collection bump
    // payer bump + created at + updated at
    8 + 32 + 32 + 32 + 32 + 36 + 2 + 2 + 33 + 33 + 3 + 1 + 1 + 1 + 8 + 8
  }
}
