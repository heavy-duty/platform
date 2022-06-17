use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Invalid attribute kind")]
  InvalidAttributeKind,
  #[msg("Invalid attribute modifier")]
  InvalidAttributeModifier,
  #[msg("Invalid mark attribute")]
  InvalidMarkAttribute,
  #[msg("Invalid account kind")]
  InvalidAccountKind,
  #[msg("Invalid account modifier")]
  InvalidAccountModifier,
  #[msg("Missing Collection Account")]
  MissingCollectionAccount,
  #[msg("Missing Payer Account")]
  MissingPayerAccount,
  #[msg("Missing Space")]
  MissingSpace,
  #[msg("Missing Program")]
  MissingProgram,
  #[msg("Missing Account")]
  MissingAccount,
  #[msg("Invalid Account")]
  InvalidAccount,
  #[msg("Missing Max")]
  MissingMax,
  #[msg("Missing Max Length")]
  MissingMaxLength,
  #[msg("Cant delete collection with attributes")]
  CantDeleteCollectionWithAttributes,
  #[msg("Collection provided doesnt match attribute")]
  CollectionDoesntMatchAttribute,
  #[msg("Cant delete account with relations")]
  CantDeleteAccountWithRelations,
  #[msg("Cant delete instruction with arguments")]
  CantDeleteInstructionWithArguments,
  #[msg("Instruction provided doesnt match argument")]
  InstructionDoesntMatchArgument,
  #[msg("Cant delete instruction with accounts")]
  CantDeleteInstructionWithAccounts,
  #[msg("Instruction provided doesnt match account")]
  InstructionDoesntMatchAccount,
  #[msg("Cant delete application with collections")]
  CantDeleteApplicationWithCollections,
  #[msg("Application provided doesnt match collection")]
  ApplicationDoesntMatchCollection,
  #[msg("Cant delete application with instructions")]
  CantDeleteApplicationWithInstructions,
  #[msg("Application provided doesnt match instruction")]
  ApplicationDoesntMatchInstruction,
  #[msg("Cant delete workspace with applications")]
  CantDeleteWorkspaceWithApplications,
  #[msg("Cant delete workspace with collaborators")]
  CantDeleteWorkspaceWithCollaborators,
  #[msg("Workspace provided doesnt match application")]
  WorkspaceDoesntMatchApplication,
  #[msg("Budget has insufficient funds")]
  BudgetHasUnsufficientFunds,
  #[msg("Invalid collaborator status")]
  InvalidCollaboratorStatus,
  #[msg("Collaborator status has not been approved")]
  CollaboratorStatusNotApproved,
  #[msg("Only collaborator status request author can retry")]
  OnlyCollaboratorStatusRequestAuthorCanRetry,
  #[msg("Only rejected collaborator status requests can be retried")]
  OnlyRejectedCollaboratorStatusRequestsCanBeRetried,
  #[msg("Workspace provided doesnt match collection")]
  WorkspaceDoesntMatchCollection,
  #[msg("Application does not belong to workspace")]
  ApplicationDoesNotBelongToWorkspace,
  #[msg("Collection does not belong to workspace")]
  CollectionDoesNotBelongToWorkspace,
  #[msg("Collection does not belong to application")]
  CollectionDoesNotBelongToApplication,
  #[msg("Collection attribute does not belong to workspace")]
  CollectionAttributeDoesNotBelongToWorkspace,
  #[msg("Collection attribute does not belong to collection")]
  CollectionAttributeDoesNotBelongToCollection,
  #[msg("Instruction does not belong to workspace")]
  InstructionDoesNotBelongToWorkspace,
  #[msg("Instruction does not belong to application")]
  InstructionDoesNotBelongToApplication,
  #[msg("Instruction argument does not belong to workspace")]
  InstructionArgumentDoesNotBelongToWorkspace,
  #[msg("Instruction argument does not belong to instruction")]
  InstructionArgumentDoesNotBelongToInstruction,
  #[msg("Instruction account does not belong to workspace")]
  InstructionAccountDoesNotBelongToWorkspace,
  #[msg("Instruction account does not belong to application")]
  InstructionAccountDoesNotBelongToApplication,
  #[msg("Instruction account does not belong to instruction")]
  InstructionAccountDoesNotBelongToInstruction,
  #[msg("Only admin collaborator can update")]
  OnlyAdminCollaboratorCanUpdate,
  #[msg("Only document accounts can have collection")]
  OnlyDocumentAccountsCanHaveCollection,
  #[msg("Only init accounts can have a payer")]
  OnlyInitAccountsCanHavePayer,
  #[msg("Only mut accounts can have a close")]
  OnlyMutAccountsCanHaveClose,
  #[msg("Arithmetic Error")]
  ArithmeticError,
  #[msg("Unauthorized Withdraw")]
  UnauthorizedWithdraw,
  #[msg("Collection attribute does not belong to application")]
  CollectionAttributeDoesNotBelongToApplication,
  #[msg("Missing unchecked explanation")]
  MissingUncheckedExplanation,
}
