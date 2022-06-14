use anchor_lang::prelude::*;

#[account]
pub struct Budget {
  pub workspace: Pubkey,
  pub bump: u8,
  pub wallet_bump: u8,
  pub total_deposited: u64,
  pub total_available: u64,
  pub total_value_locked: u64,
  pub created_at: i64,
}

impl Budget {
  pub fn space() -> usize {
    // discriminator + authority + workspace + bump + wallet bump
    // total deposited + total available + total value locked + created at
    8 + 32 + 32 + 1 + 1 + 8 + 8 + 8 + 8
  }

  pub fn get_rent_exemption() -> Result<u64> {
    let rent = Rent::get()?;
    Ok(rent.minimum_balance(Budget::space()))
  }
}
