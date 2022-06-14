use anchor_lang::prelude::*;

pub mod collections;
pub mod enums;
mod errors;
pub mod instructions;

use instructions::*;

declare_id!("HqF7vRWkmy8cgp3DRH1qK9axyuQgUhqneHP4dqZ6nqdF");

#[program]
pub mod workspace_manager {
    use super::*;

    pub fn create_workspace(
        ctx: Context<CreateWorkspace>,
        arguments: CreateWorkspaceArguments,
    ) -> Result<()> {
        instructions::create_workspace::handle(ctx, arguments)
    }

    pub fn update_workspace(
        ctx: Context<UpdateWorkspace>,
        arguments: UpdateWorkspaceArguments,
    ) -> Result<()> {
        instructions::update_workspace::handle(ctx, arguments)
    }

    pub fn set_workspace_authority(ctx: Context<SetWorkspaceAuthority>) -> Result<()> {
        instructions::set_workspace_authority::handle(ctx)
    }

    pub fn delete_workspace(ctx: Context<DeleteWorkspace>) -> Result<()> {
        instructions::delete_workspace::handle(ctx)
    }

    pub fn create_budget(ctx: Context<CreateBudget>) -> Result<()> {
        instructions::create_budget::handle(ctx)
    }

    pub fn deposit_to_budget(
        ctx: Context<DepositToBudget>,
        arguments: DepositToBudgetArguments,
    ) -> Result<()> {
        instructions::deposit_to_budget::handle(ctx, arguments)
    }

    pub fn withdraw_from_budget(
        ctx: Context<WithdrawFromBudget>,
        arguments: WithdrawFromBudgetArguments,
    ) -> Result<()> {
        instructions::withdraw_from_budget::handle(ctx, arguments)
    }

    pub fn register_budget_spent(
        ctx: Context<RegisterBudgetSpent>,
        arguments: RegisterBudgetSpentArguments,
    ) -> Result<()> {
        instructions::register_budget_spent::handle(ctx, arguments)
    }

    pub fn delete_budget(ctx: Context<DeleteBudget>) -> Result<()> {
        instructions::delete_budget::handle(ctx)
    }

    pub fn create_collaborator(
        ctx: Context<CreateCollaborator>,
        arguments: CreateCollaboratorArguments,
    ) -> Result<()> {
        instructions::create_collaborator::handle(ctx, arguments)
    }

    pub fn update_collaborator(
        ctx: Context<UpdateCollaborator>,
        arguments: UpdateCollaboratorArguments,
    ) -> Result<()> {
        instructions::update_collaborator::handle(ctx, arguments)
    }

    pub fn delete_collaborator(ctx: Context<DeleteCollaborator>) -> Result<()> {
        instructions::delete_collaborator::handle(ctx)
    }
}
