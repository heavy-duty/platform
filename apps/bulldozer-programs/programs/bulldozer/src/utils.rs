use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

pub fn transfer_lamports<'info>(
  from: AccountInfo<'info>,
  to: AccountInfo<'info>,
  lamports: u64,
) -> Result<()> {
  **from.try_borrow_mut_lamports()? = from
    .try_lamports()?
    .checked_sub(lamports)
    .ok_or(ErrorCode::ArithmeticError)?;
  **to.try_borrow_mut_lamports()? = to
    .try_lamports()?
    .checked_add(lamports)
    .ok_or(ErrorCode::ArithmeticError)?;
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
