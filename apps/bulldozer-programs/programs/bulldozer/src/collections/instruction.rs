use anchor_lang::prelude::*;

#[account]
pub struct InstructionStats {
  pub quantity_of_arguments: u8,
  pub quantity_of_accounts: u8,
}

impl InstructionStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_arguments = 0;
    self.quantity_of_accounts = 0;
  }

  pub fn increase_argument_quantity(&mut self) -> () {
    self.quantity_of_arguments += 1;
  }

  pub fn decrease_argument_quantity(&mut self) -> () {
    self.quantity_of_arguments -= 1;
  }

  pub fn increase_account_quantity(&mut self) -> () {
    self.quantity_of_accounts += 1;
  }

  pub fn decrease_account_quantity(&mut self) -> () {
    self.quantity_of_accounts -= 1;
  }

  pub fn space() -> usize {
    // discriminator + quantity of arguments + quantity of accounts
    8 + 1 + 1
  }
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct InstructionChunk {
  pub position: u8,
  pub data: String,
}

#[account]
pub struct Instruction {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub chunks: Vec<InstructionChunk>,
  pub created_at: i64,
  pub updated_at: i64,
  pub instruction_stats_bump: u8,
}

impl Instruction {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    instruction_stats_bump: u8,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.name = name;

    let mut chunks = Vec::new();

    chunks.push(InstructionChunk {
      position: 0,
      data: "".to_string(),
    });
    chunks.push(InstructionChunk {
      position: 1,
      data: "".to_string(),
    });
    chunks.push(InstructionChunk {
      position: 2,
      data: "".to_string(),
    });
    chunks.push(InstructionChunk {
      position: 3,
      data: "".to_string(),
    });

    self.chunks = chunks;

    self.instruction_stats_bump = instruction_stats_bump;
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
    // discriminator + authority + workspace + application
    // name (size 32 + 4 ?) + body (4 chunks of 1 u8 and a 500 length string)
    // created at + updated at
    8 + 32 + 32 + 32 + 33 + 4 * (1 + 504) + 8 + 8
  }
}
