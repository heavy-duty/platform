use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Collaborator status has not been approved.")]
  CollaboratorStatusNotApproved,
  #[msg("Only admin collaborators can update another collaborator's status.")]
  OnlyAdminCollaboratorCanUpdate,
  #[msg("Only admin collaborators can withdraw from the budget.")]
  OnlyAdminCollaboratorCanWithdraw,
  #[msg("Only admin collaborators can delete a workspace.")]
  OnlyAdminCollaboratorCanDelete,
}
