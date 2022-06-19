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
pub struct Path {
  pub reference: Pubkey,
  pub path: Pubkey,
}

#[account]
pub struct InstructionAccountDerivation {
  pub name: Option<String>,
  pub bump_path: Option<Path>,
  pub seed_paths: Vec<Pubkey>,
}

impl InstructionAccountDerivation {
  pub fn set(&mut self, name: Option<String>) -> () {
    self.name = name;
  }

  pub fn add_seed(&mut self, reference: Pubkey) -> () {
    self.seed_paths.push(reference)
  }

  pub fn set_bump(&mut self, reference: Pubkey, path: Pubkey) -> () {
    self.bump_path = Some(Path { reference, path })
  }

  pub fn clear(&mut self) -> () {
    self.name = None;
    self.seed_paths = Vec::new();
    self.bump_path = None
  }

  pub fn space() -> usize {
    // discriminator + name + bump path + seed paths
    8 + 37 + 65 + 32 * 4
  }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InstructionAccountBumps {
  pub stats: u8,
  pub collection: u8,
  pub payer: u8,
  pub close: u8,
  pub derivation: u8,
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
  pub unchecked_explanation: Option<String>,
  pub mint: Option<Pubkey>,
  pub token_authority: Option<Pubkey>,
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
    unchecked_explanation: Option<String>,
    mint: Option<Pubkey>,
    token_authority: Option<Pubkey>,
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
    self.unchecked_explanation = unchecked_explanation;
    self.mint = mint;
    self.token_authority = token_authority;
    self.bumps = bumps;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn set_mint(&mut self, mint: Option<Pubkey>) -> () {
    self.mint = mint;
  }

  pub fn set_token_authority(&mut self, token_authority: Option<Pubkey>) -> () {
    self.token_authority = token_authority;
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
    // payer bump + created at + updated at + uncheckex exp
    // mint + token authority
    8 + 32 + 32 + 32 + 32 + 36 + 2 + 2 + 33 + 33 + 3 + 1 + 1 + 1 + 8 + 8 + 132 + 33 + 33
  }
}
