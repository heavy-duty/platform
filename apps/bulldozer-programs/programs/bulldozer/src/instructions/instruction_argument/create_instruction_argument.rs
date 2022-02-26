use crate::collections::{
  Application, Budget, Collaborator, Instruction, InstructionArgument, User, Workspace,
};
use crate::enums::{AttributeKinds, AttributeModifiers, CollaboratorStatus};
use crate::errors::ErrorCode;
use crate::utils::{fund_rent_for_account, has_enough_funds};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInstructionArgumentArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: CreateInstructionArgumentArguments)]
pub struct CreateInstructionArgument<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(constraint = application.workspace == workspace.key() @ ErrorCode::ApplicationDoesNotBelongToWorkspace)]
  pub application: Box<Account<'info, Application>>,
  #[account(
    mut,
    constraint = instruction.application == application.key() @ ErrorCode::InstructionDoesNotBelongToApplication,
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Box<Account<'info, Instruction>>,
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
    init,
    payer = authority,
    space = InstructionArgument::space(),
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub system_program: Program<'info, System>,
}

pub fn validate(
  ctx: &Context<CreateInstructionArgument>,
  arguments: &CreateInstructionArgumentArguments,
) -> std::result::Result<bool, ProgramError> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(ErrorCode::MissingMax.into()),
    (2, _, None) => Err(ErrorCode::MissingMaxLength.into()),
    _ => {
      if !has_enough_funds(
        ctx.accounts.budget.to_account_info(),
        ctx.accounts.argument.to_account_info(),
        Budget::get_rent_exemption()?,
      ) {
        return Err(ErrorCode::BudgetHasUnsufficientFunds.into());
      }
      Ok(true)
    }
  }
}

pub fn handle(
  ctx: Context<CreateInstructionArgument>,
  arguments: CreateInstructionArgumentArguments,
) -> ProgramResult {
  msg!("Create instruction argument");
  fund_rent_for_account(
    ctx.accounts.budget.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    **ctx.accounts.argument.to_account_info().lamports.borrow(),
  )?;
  ctx.accounts.argument.initialize(
    arguments.name,
    ctx.accounts.authority.key(),
    ctx.accounts.workspace.key(),
    ctx.accounts.application.key(),
    ctx.accounts.instruction.key(),
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?,
    AttributeModifiers::create(arguments.modifier, arguments.size)?,
  );
  ctx.accounts.argument.initialize_timestamp()?;
  ctx.accounts.instruction.increase_argument_quantity();
  Ok(())
}
