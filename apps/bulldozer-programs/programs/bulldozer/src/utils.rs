use anchor_lang::prelude::*;

pub fn fund_rent_for_account<'info>(
  payer: AccountInfo<'info>,
  receiver: AccountInfo<'info>,
  rent: u64,
) -> Result<()> {
  **payer.try_borrow_mut_lamports()? -= rent;
  **receiver.try_borrow_mut_lamports()? += rent;
  Ok(())
}

pub fn has_enough_funds<'info>(
  payer: AccountInfo<'info>,
  receiver: AccountInfo<'info>,
  payer_rent: u64,
) -> bool {
  let receiver_rent = **receiver.lamports.borrow();
  let payer_budget = **payer.lamports.borrow();

  receiver_rent + payer_rent <= payer_budget
}
