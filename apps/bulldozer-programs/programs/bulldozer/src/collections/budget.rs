use anchor_lang::prelude::*;

#[account]
pub struct Budget {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub bump: u8,
  pub created_at: i64,
}

impl Budget {
  pub fn initialize(&mut self, authority: Pubkey, workspace: Pubkey, bump: u8) -> () {
    self.workspace = workspace;
    self.authority = authority;
    self.bump = bump;
  }

  pub fn initialize_timestamp(&mut self) -> ProgramResult {
    self.created_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + bump + created at
    8 + 32 + 32 + 1 + 8
  }

  pub fn get_rent_exemption() -> std::result::Result<u64, ProgramError> {
    let rent = Rent::get()?;
    Ok(rent.minimum_balance(Budget::space()))
  }
}
