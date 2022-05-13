use {anchor_lang::prelude::*, anchor_spl::token::*};
use crate::collections::{Board, Bounty};

#[derive(Accounts)]
#[instruction(
    board_id: u32, 
    bounty_id: u32,
)]
pub struct Deposit<'info> {
    #[account(
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump = board.board_bump,
    )]
    pub board: Box<Account<'info, Board>>,
    #[account(
        seeds = [
            b"bounty".as_ref(), 
            board.key().as_ref(),
            &bounty_id.to_le_bytes(),
        ],
        bump = bounty.bounty_bump,
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
        constraint = sponsor_vault.mint == board.accepted_mint
    )]
    pub sponsor_vault: Box<Account<'info, TokenAccount>>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handle(
  ctx: Context<Deposit>,
  amount: u64,
) -> Result<()> {
  transfer(
      CpiContext::new(
          ctx.accounts.token_program.to_account_info(),
          Transfer {
              from: ctx.accounts.sponsor_vault.to_account_info(),
          to: ctx.accounts.bounty_vault.to_account_info(),
              authority: ctx.accounts.authority.to_account_info(),
          },
      ),
      amount,
  )?;
  Ok(())
}