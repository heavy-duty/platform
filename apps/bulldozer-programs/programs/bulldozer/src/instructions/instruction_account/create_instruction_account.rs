use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionAccount, InstructionAccountBumps,
  InstructionAccountClose, InstructionAccountCollection, InstructionAccountDerivation,
  InstructionAccountPayer, InstructionAccountStats, InstructionStats, User, Workspace,
};
use crate::enums::{AccountKinds, AccountModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use crate::utils::transfer_lamports;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionAccountArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub space: Option<u16>,
  pub unchecked_explanation: Option<String>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionAccountArguments)]
pub struct CreateInstructionAccount<'info> {
  pub system_program: Program<'info, System>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
  )]
  pub instruction: Box<Account<'info, Instruction>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccount::space()
  )]
  pub account: Box<Account<'info, InstructionAccount>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
  )]
  pub budget: Box<Account<'info, Budget>>,
  #[account(
    mut,
    seeds = [
      b"instruction_stats".as_ref(),
      instruction.key().as_ref()
    ],
    bump = instruction.instruction_stats_bump
  )]
  pub instruction_stats: Box<Account<'info, InstructionStats>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccountStats::space(),
    seeds = [
      b"instruction_account_stats".as_ref(),
      account.key().as_ref()
    ],
    bump
  )]
  pub account_stats: Box<Account<'info, InstructionAccountStats>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccountCollection::space(),
    seeds = [
      b"instruction_account_collection".as_ref(),
      account.key().as_ref(),
    ],
    bump
  )]
  pub account_collection: Box<Account<'info, InstructionAccountCollection>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccountPayer::space(),
    seeds = [
      b"instruction_account_payer".as_ref(),
      account.key().as_ref(),
    ],
    bump
  )]
  pub account_payer: Box<Account<'info, InstructionAccountPayer>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccountClose::space(),
    seeds = [
      b"instruction_account_close".as_ref(),
      account.key().as_ref(),
    ],
    bump
  )]
  pub account_close: Box<Account<'info, InstructionAccountClose>>,
  #[account(
    init,
    payer = authority,
    space = InstructionAccountDerivation::space(),
    seeds = [
      b"instruction_account_derivation".as_ref(),
      account.key().as_ref(),
    ],
    bump
  )]
  pub account_derivation: Box<Account<'info, InstructionAccountDerivation>>,
}

pub fn validate(
  ctx: &Context<CreateInstructionAccount>,
  arguments: &CreateInstructionAccountArguments,
) -> Result<bool> {
  match (
    arguments.kind,
    arguments.modifier,
    arguments.space,
    arguments.unchecked_explanation.clone(),
  ) {
    (0, Some(0), None, _) => Err(error!(ErrorCode::MissingSpace)),
    (2, Some(0), None, _) => Err(error!(ErrorCode::MissingSpace)),
    (2, _, _, None) => Err(error!(ErrorCode::MissingUncheckedExplanation)),
    _ => {
      let budget_lamports = **ctx.accounts.budget.to_account_info().lamports.borrow();
      let instruction_account_rent = **ctx.accounts.account.to_account_info().lamports.borrow();
      let instruction_account_stats_rent = **ctx
        .accounts
        .account_stats
        .to_account_info()
        .lamports
        .borrow();
      let instruction_account_collection_rent = **ctx
        .accounts
        .account_collection
        .to_account_info()
        .lamports
        .borrow();
      let instruction_account_payer_rent = **ctx
        .accounts
        .account_payer
        .to_account_info()
        .lamports
        .borrow();
      let instruction_account_close_rent = **ctx
        .accounts
        .account_close
        .to_account_info()
        .lamports
        .borrow();
      let instruction_account_derivation_rent = **ctx
        .accounts
        .account_derivation
        .to_account_info()
        .lamports
        .borrow();
      let funds_required = &Budget::get_rent_exemption()?
        .checked_add(instruction_account_rent)
        .unwrap()
        .checked_add(instruction_account_stats_rent)
        .unwrap()
        .checked_add(instruction_account_collection_rent)
        .unwrap()
        .checked_add(instruction_account_payer_rent)
        .unwrap()
        .checked_add(instruction_account_close_rent)
        .unwrap()
        .checked_add(instruction_account_derivation_rent)
        .unwrap();

      if budget_lamports.lt(funds_required) {
        return Err(error!(ErrorCode::BudgetHasUnsufficientFunds));
      }

      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateInstructionAccount>,
  arguments: CreateInstructionAccountArguments,
) -> Result<()> {
  msg!("Create instruction account");
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.account.to_account_info().lamports.borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_stats
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_collection
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_payer
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_close
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  transfer_lamports(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx
      .accounts
      .account_derivation
      .to_account_info()
      .lamports
      .borrow(),
  )?;
  ctx.accounts.account.initialize(
    arguments.name,
    ctx.accounts.authority.key(),
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.instruction.key(),
    AccountKinds::create(arguments.kind)?,
    AccountModifiers::create(arguments.modifier)?,
    arguments.space,
    arguments.unchecked_explanation,
    None,
    None,
    InstructionAccountBumps {
      stats: *ctx.bumps.get("account_stats").unwrap(),
      collection: *ctx.bumps.get("account_collection").unwrap(),
      payer: *ctx.bumps.get("account_payer").unwrap(),
      close: *ctx.bumps.get("account_close").unwrap(),
      derivation: *ctx.bumps.get("account_derivation").unwrap(),
    },
  );
  ctx.accounts.account.initialize_timestamp()?;
  ctx.accounts.account_stats.initialize();
  ctx.accounts.account_collection.set(None);
  ctx.accounts.account_payer.set(None);
  ctx.accounts.account_close.set(None);
  ctx.accounts.account_derivation.set(None);
  ctx.accounts.instruction_stats.increase_account_quantity();
  Ok(())
}
