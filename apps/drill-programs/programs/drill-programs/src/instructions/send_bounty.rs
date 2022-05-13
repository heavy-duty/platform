use {anchor_lang::prelude::*, anchor_spl::token::*};
use crate::collections::{Board, Bounty};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(
    board_id: u32, 
    bounty_id: u32,
    bounty_hunter: String,
)]
pub struct SendBounty<'info> {
    #[account(
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump = board.board_bump,
    )]
    pub board: Box<Account<'info, Board>>,
    #[account(
        mut,
        close = authority,
        seeds = [
            b"bounty".as_ref(), 
            board.key().as_ref(),
            &bounty_id.to_le_bytes(),
        ],
        bump = bounty.bounty_bump,
        constraint = bounty.is_closed,
        constraint = bounty.bounty_hunter == Some(bounty_hunter)
    )]
    pub bounty: Box<Account<'info, Bounty>>,
    #[account(
        mut,
        seeds = [
            b"bounty_vault".as_ref(), 
            bounty.key().as_ref()
        ],
        bump = bounty.bounty_vault_bump,
    )]
    pub bounty_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = user_vault.mint == board.accepted_mint
    )]
    pub user_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = authority.key() == board.authority,
    )]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn validate(ctx: &Context<SendBounty>) -> Result<()> {
  match ctx.accounts.bounty.closed_at {
    Some(closed_at) => {
      let now = Clock::get()?.unix_timestamp;

      if closed_at + ctx.accounts.board.lock_time > now {
        return Err(error!(ErrorCode::BountyLockedError));
      }

      return Ok(());
    }
    _ => Ok(()),
  }
}

pub fn handle(
  ctx: Context<SendBounty>,
  board_id: u32,
) -> Result<()> {
  let seeds = [
    b"board".as_ref(),
    &board_id.to_le_bytes(),
    &[ctx.accounts.board.board_bump],
  ];
  let signer = &[&seeds[..]];
  transfer(
    CpiContext::new_with_signer(
      ctx.accounts.token_program.to_account_info(),
      Transfer {
        from: ctx.accounts.bounty_vault.to_account_info(),
        to: ctx.accounts.user_vault.to_account_info(),
        authority: ctx.accounts.board.to_account_info(),
      },
      signer,
    ),
    ctx.accounts.bounty_vault.amount,
  )?;
  close_account(CpiContext::new_with_signer(
    ctx.accounts.token_program.to_account_info(),
    CloseAccount {
      account: ctx.accounts.bounty_vault.to_account_info(),
      destination: ctx.accounts.authority.to_account_info(),
      authority: ctx.accounts.board.to_account_info(),
    },
    signer,
  ))?;
  Ok(())
}
