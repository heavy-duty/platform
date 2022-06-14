use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Invalid collaborator status.")]
  InvalidCollaboratorStatus,
  #[msg("Only approved collaborators can register pay with budget.")]
  OnlyApprovedCollaboratorCanRegisterPayWithBudget,
  #[msg("Only admin collaborators can update another collaborator's status.")]
  OnlyAdminCollaboratorCanUpdate,
  #[msg("Only rejected collaborators are capable of retrying a request.")]
  OnlyRejectedCollaboratorCanRetry,
  #[msg("It's not possible to delete a workspace that has applications.")]
  CantDeleteWorkspaceWithApplications,
  #[msg("It's not possible to delete a workspace that has collaborators.")]
  CantDeleteWorkspaceWithCollaborators,
  #[msg("You don't have permission to withdraw from the workspace's budget.")]
  UnauthorizedWithdrawFromBudget,
  #[msg("You don't have permission to register budget spent.")]
  UnauthorizedRegisterBudgetSpent,
  #[msg("You don't have permission to update this workspace.")]
  UnauthorizedWorkspaceUpdate,
  #[msg("You don't have permission to set the authority of this workspace.")]
  UnauthorizedWorkspaceSetAuthority,
  #[msg("You don't have permission to create a collaborator for this workspace.")]
  UnauthorizedCreateCollaborator,
  #[msg("You don't have permission to delete collaborators of this workspace.")]
  UnauthorizedDeleteCollaborator,
  #[msg("You don't have permission to create budget for this workspace.")]
  UnauthorizedCreateBudget,
  #[msg("You don't have permission to delete budget of this workspace.")]
  UnauthorizedDeleteBudget,
  #[msg("You don't have permission to delete this workspace.")]
  UnauthorizedWorkspaceDelete,
  #[msg("Failed to properly execute an arithmetic operation.")]
  ArithmeticError,
}
