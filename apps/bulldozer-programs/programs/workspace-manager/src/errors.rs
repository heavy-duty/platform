use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Invalid collaborator status.")]
  InvalidCollaboratorStatus,
  #[msg("Only admin collaborators can update another collaborator's status.")]
  OnlyAdminCollaboratorCanUpdate,
  #[msg("Only rejected collaborators are capable of retrying a request.")]
  OnlyRejectedCollaboratorCanRetry,
  #[msg("It's not possible to delete a workspace that has applications.")]
  CantDeleteWorkspaceWithApplications,
  #[msg("It's not possible to delete a workspace that has collaborators.")]
  CantDeleteWorkspaceWithCollaborators,
  #[msg("You don't have permission to withdraw from the workspace's budget.")]
  UnauthorizedWithdraw,
  #[msg("Failed to properly execute an arithmetic operation.")]
  ArithmeticError,
}
