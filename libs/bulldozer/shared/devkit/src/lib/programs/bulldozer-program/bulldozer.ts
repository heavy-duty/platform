export type Bulldozer = {
	version: '0.1.0';
	name: 'bulldozer';
	instructions: [
		{
			name: 'createUser';
			accounts: [
				{
					name: 'user';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateUserArguments';
					};
				}
			];
		},
		{
			name: 'updateUser';
			accounts: [
				{
					name: 'user';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateUserArguments';
					};
				}
			];
		},
		{
			name: 'deleteUser';
			accounts: [
				{
					name: 'user';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				}
			];
			args: [];
		},
		{
			name: 'createWorkspace';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateWorkspaceArguments';
					};
				}
			];
		},
		{
			name: 'updateWorkspace';
			accounts: [
				{
					name: 'workspace';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateWorkspaceArguments';
					};
				}
			];
		},
		{
			name: 'depositToBudget';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'DepositToBudgetArguments';
					};
				}
			];
		},
		{
			name: 'withdrawFromBudget';
			accounts: [
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'WithdrawFromBudgetArguments';
					};
				}
			];
		},
		{
			name: 'deleteWorkspace';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createCollaborator';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'authorityUser';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authorityCollaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'authority_user';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'updateCollaborator';
			accounts: [
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authorityCollaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateCollaboratorArguments';
					};
				}
			];
		},
		{
			name: 'deleteCollaborator';
			accounts: [
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'authorityUser';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'authorityCollaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Collaborator';
								path: 'collaborator.workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'authority_user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'requestCollaboratorStatus';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'retryCollaboratorStatusRequest';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createApplication';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateApplicationArguments';
					};
				}
			];
		},
		{
			name: 'updateApplication';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateApplicationArguments';
					};
				}
			];
		},
		{
			name: 'deleteApplication';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				},
				{
					name: 'workspaceStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'workspace_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application.workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application.workspace';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createCollection';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'collectionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collection_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Collection';
								path: 'collection';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateCollectionArguments';
					};
				}
			];
		},
		{
			name: 'updateCollection';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateCollectionArguments';
					};
				}
			];
		},
		{
			name: 'deleteCollection';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				},
				{
					name: 'collectionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collection_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Collection';
								path: 'collection';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createCollectionAttribute';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'attribute';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'collectionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collection_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Collection';
								path: 'collection';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateCollectionAttributeArguments';
					};
				}
			];
		},
		{
			name: 'updateCollectionAttribute';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'attribute';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateCollectionAttributeArguments';
					};
				}
			];
		},
		{
			name: 'deleteCollectionAttribute';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'attribute';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'collectionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collection_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Collection';
								path: 'collection';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createInstruction';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateInstructionArguments';
					};
				}
			];
		},
		{
			name: 'updateInstruction';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateInstructionArguments';
					};
				}
			];
		},
		{
			name: 'updateInstructionBody';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateInstructionBodyArguments';
					};
				}
			];
		},
		{
			name: 'clearInstructionBody';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'deleteInstruction';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'applicationStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'application_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Application';
								path: 'application';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createInstructionArgument';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'argument';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateInstructionArgumentArguments';
					};
				}
			];
		},
		{
			name: 'updateInstructionArgument';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'argument';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionArgument';
								path: 'argument.workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateInstructionArgumentArguments';
					};
				}
			];
		},
		{
			name: 'deleteInstructionArgument';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'argument';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createInstructionAccount';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				},
				{
					name: 'accountStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountCollection';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_collection';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountPayer';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_payer';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountClose';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_close';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountDerivation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_derivation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateInstructionAccountArguments';
					};
				}
			];
		},
		{
			name: 'updateInstructionAccount';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'accountPayer';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_payer';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountClose';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_close';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateInstructionAccountArguments';
					};
				}
			];
		},
		{
			name: 'setInstructionAccountCollection';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountCollection';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_collection';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'setInstructionAccountClose';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'close';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountClose';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_close';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'clearInstructionAccountClose';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountClose';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_close';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'setInstructionAccountPayer';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'payer';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountPayer';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_payer';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'setInstructionAccountDerivation';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountDerivation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_derivation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'SetInstructionAccountDerivationArguments';
					};
				}
			];
		},
		{
			name: 'setTokenCofiguration';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'mint';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'tokenAuthority';
					isMut: false;
					isSigner: false;
				}
			];
			args: [];
		},
		{
			name: 'addSeedToDerivation';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reference';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountDerivation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_derivation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'setBumpToDerivation';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'collection';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'path';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'reference';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountDerivation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_derivation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'clearInstructionAccountDerivation';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountDerivation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_derivation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'deleteInstructionAccount';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account.workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account.workspace';
							}
						];
					};
				},
				{
					name: 'instructionStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Instruction';
								path: 'instruction';
							}
						];
					};
				},
				{
					name: 'accountStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountCollection';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_collection';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountClose';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_close';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				},
				{
					name: 'accountPayer';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_payer';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createInstructionAccountConstraint';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'accountConstraint';
					isMut: true;
					isSigner: true;
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'CreateInstructionAccountConstraintArguments';
					};
				}
			];
		},
		{
			name: 'updateInstructionAccountConstraint';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'accountConstraint';
					isMut: true;
					isSigner: false;
				}
			];
			args: [
				{
					name: 'arguments';
					type: {
						defined: 'UpdateInstructionAccountConstraintArguments';
					};
				}
			];
		},
		{
			name: 'deleteInstructionAccountConstraint';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'account';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'accountConstraint';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account.workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'account.workspace';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'createInstructionRelation';
			accounts: [
				{
					name: 'systemProgram';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'authority';
					isMut: true;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'application';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'from';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'to';
					isMut: true;
					isSigner: false;
				},
				{
					name: 'relation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_relation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'from';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'to';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'fromStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'from';
							}
						];
					};
				},
				{
					name: 'toStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'to';
							}
						];
					};
				}
			];
			args: [];
		},
		{
			name: 'deleteInstructionRelation';
			accounts: [
				{
					name: 'authority';
					isMut: false;
					isSigner: true;
				},
				{
					name: 'workspace';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'instruction';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'from';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'to';
					isMut: false;
					isSigner: false;
				},
				{
					name: 'relation';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_relation';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'from';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'to';
							}
						];
					};
				},
				{
					name: 'user';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'user';
							},
							{
								kind: 'account';
								type: 'publicKey';
								path: 'authority';
							}
						];
					};
				},
				{
					name: 'collaborator';
					isMut: false;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'collaborator';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'User';
								path: 'user';
							}
						];
					};
				},
				{
					name: 'budget';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'budget';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'Workspace';
								path: 'workspace';
							}
						];
					};
				},
				{
					name: 'fromStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'from';
							}
						];
					};
				},
				{
					name: 'toStats';
					isMut: true;
					isSigner: false;
					pda: {
						seeds: [
							{
								kind: 'const';
								type: 'string';
								value: 'instruction_account_stats';
							},
							{
								kind: 'account';
								type: 'publicKey';
								account: 'InstructionAccount';
								path: 'to';
							}
						];
					};
				}
			];
			args: [];
		}
	];
	accounts: [
		{
			name: 'applicationStats';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'quantityOfCollections';
						type: 'u8';
					},
					{
						name: 'quantityOfInstructions';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'application';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					},
					{
						name: 'applicationStatsBump';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'budget';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'bump';
						type: 'u8';
					},
					{
						name: 'totalDeposited';
						type: 'u64';
					},
					{
						name: 'totalValueLocked';
						type: 'u64';
					},
					{
						name: 'createdAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'collaborator';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'user';
						type: 'publicKey';
					},
					{
						name: 'status';
						type: {
							defined: 'CollaboratorStatus';
						};
					},
					{
						name: 'isAdmin';
						type: 'bool';
					},
					{
						name: 'bump';
						type: 'u8';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'collectionAttribute';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'collection';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: {
							defined: 'AttributeKinds';
						};
					},
					{
						name: 'modifier';
						type: {
							option: {
								defined: 'AttributeModifiers';
							};
						};
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'collectionStats';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'quantityOfAttributes';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'collection';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					},
					{
						name: 'collectionStatsBump';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'instructionAccountConstraint';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'instruction';
						type: 'publicKey';
					},
					{
						name: 'account';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'body';
						type: 'string';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'instructionAccountStats';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'quantityOfRelations';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'instructionAccountCollection';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'collection';
						type: {
							option: 'publicKey';
						};
					}
				];
			};
		},
		{
			name: 'instructionAccountPayer';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'payer';
						type: {
							option: 'publicKey';
						};
					}
				];
			};
		},
		{
			name: 'instructionAccountClose';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'close';
						type: {
							option: 'publicKey';
						};
					}
				];
			};
		},
		{
			name: 'instructionAccountDerivation';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: {
							option: 'string';
						};
					},
					{
						name: 'bumpPath';
						type: {
							option: {
								defined: 'Path';
							};
						};
					},
					{
						name: 'seedPaths';
						type: {
							vec: 'publicKey';
						};
					}
				];
			};
		},
		{
			name: 'instructionAccount';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'instruction';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: {
							defined: 'AccountKinds';
						};
					},
					{
						name: 'modifier';
						type: {
							option: {
								defined: 'AccountModifiers';
							};
						};
					},
					{
						name: 'space';
						type: {
							option: 'u16';
						};
					},
					{
						name: 'uncheckedExplanation';
						type: {
							option: 'string';
						};
					},
					{
						name: 'mint';
						type: {
							option: 'publicKey';
						};
					},
					{
						name: 'tokenAuthority';
						type: {
							option: 'publicKey';
						};
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					},
					{
						name: 'bumps';
						type: {
							defined: 'InstructionAccountBumps';
						};
					}
				];
			};
		},
		{
			name: 'instructionArgument';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'instruction';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: {
							defined: 'AttributeKinds';
						};
					},
					{
						name: 'modifier';
						type: {
							option: {
								defined: 'AttributeModifiers';
							};
						};
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'instructionRelation';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'instruction';
						type: 'publicKey';
					},
					{
						name: 'from';
						type: 'publicKey';
					},
					{
						name: 'to';
						type: 'publicKey';
					},
					{
						name: 'bump';
						type: 'u8';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'instructionStats';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'quantityOfArguments';
						type: 'u8';
					},
					{
						name: 'quantityOfAccounts';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'instruction';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'workspace';
						type: 'publicKey';
					},
					{
						name: 'application';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'chunks';
						type: {
							vec: {
								defined: 'InstructionChunk';
							};
						};
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					},
					{
						name: 'instructionStatsBump';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'user';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'userName';
						type: 'string';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'thumbnailUrl';
						type: 'string';
					},
					{
						name: 'bump';
						type: 'u8';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					}
				];
			};
		},
		{
			name: 'workspaceStats';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'quantityOfCollaborators';
						type: 'u8';
					},
					{
						name: 'quantityOfApplications';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'workspace';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'authority';
						type: 'publicKey';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'createdAt';
						type: 'i64';
					},
					{
						name: 'updatedAt';
						type: 'i64';
					},
					{
						name: 'workspaceStatsBump';
						type: 'u8';
					}
				];
			};
		}
	];
	types: [
		{
			name: 'Path';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'reference';
						type: 'publicKey';
					},
					{
						name: 'path';
						type: 'publicKey';
					}
				];
			};
		},
		{
			name: 'InstructionAccountBumps';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'stats';
						type: 'u8';
					},
					{
						name: 'collection';
						type: 'u8';
					},
					{
						name: 'payer';
						type: 'u8';
					},
					{
						name: 'close';
						type: 'u8';
					},
					{
						name: 'derivation';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'InstructionChunk';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'position';
						type: 'u8';
					},
					{
						name: 'data';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'CreateApplicationArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateApplicationArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateCollaboratorArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'status';
						type: 'u8';
					}
				];
			};
		},
		{
			name: 'CreateCollectionArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateCollectionArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'CreateCollectionAttributeArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: 'u8';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'size';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'max';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'maxLength';
						type: {
							option: 'u32';
						};
					}
				];
			};
		},
		{
			name: 'UpdateCollectionAttributeArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: 'u8';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'size';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'max';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'maxLength';
						type: {
							option: 'u32';
						};
					}
				];
			};
		},
		{
			name: 'CreateInstructionArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateInstructionBodyArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'chunk';
						type: 'u8';
					},
					{
						name: 'body';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateInstructionArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'CreateInstructionAccountArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: 'u8';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'space';
						type: {
							option: 'u16';
						};
					},
					{
						name: 'uncheckedExplanation';
						type: {
							option: 'string';
						};
					}
				];
			};
		},
		{
			name: 'SetInstructionAccountDerivationArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: {
							option: 'string';
						};
					}
				];
			};
		},
		{
			name: 'UpdateInstructionAccountArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'space';
						type: {
							option: 'u16';
						};
					},
					{
						name: 'uncheckedExplanation';
						type: {
							option: 'string';
						};
					}
				];
			};
		},
		{
			name: 'CreateInstructionAccountConstraintArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'body';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateInstructionAccountConstraintArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'body';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'CreateInstructionArgumentArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: 'u8';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'size';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'max';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'maxLength';
						type: {
							option: 'u32';
						};
					}
				];
			};
		},
		{
			name: 'UpdateInstructionArgumentArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'kind';
						type: 'u8';
					},
					{
						name: 'modifier';
						type: {
							option: 'u8';
						};
					},
					{
						name: 'size';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'max';
						type: {
							option: 'u32';
						};
					},
					{
						name: 'maxLength';
						type: {
							option: 'u32';
						};
					}
				];
			};
		},
		{
			name: 'CreateUserArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'userName';
						type: 'string';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'thumbnailUrl';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'UpdateUserArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'userName';
						type: 'string';
					},
					{
						name: 'name';
						type: 'string';
					},
					{
						name: 'thumbnailUrl';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'CreateWorkspaceArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'DepositToBudgetArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'amount';
						type: 'u64';
					}
				];
			};
		},
		{
			name: 'UpdateWorkspaceArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'name';
						type: 'string';
					}
				];
			};
		},
		{
			name: 'WithdrawFromBudgetArguments';
			type: {
				kind: 'struct';
				fields: [
					{
						name: 'amount';
						type: 'u64';
					}
				];
			};
		},
		{
			name: 'AccountKinds';
			type: {
				kind: 'enum';
				variants: [
					{
						name: 'Document';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Signer';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Unchecked';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Mint';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Token';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					}
				];
			};
		},
		{
			name: 'AccountModifiers';
			type: {
				kind: 'enum';
				variants: [
					{
						name: 'Init';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Mut';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					}
				];
			};
		},
		{
			name: 'AttributeKinds';
			type: {
				kind: 'enum';
				variants: [
					{
						name: 'Boolean';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					},
					{
						name: 'Number';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					},
					{
						name: 'String';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					},
					{
						name: 'Pubkey';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					}
				];
			};
		},
		{
			name: 'AttributeModifiers';
			type: {
				kind: 'enum';
				variants: [
					{
						name: 'Array';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					},
					{
						name: 'Vector';
						fields: [
							{
								name: 'id';
								type: 'u8';
							},
							{
								name: 'size';
								type: 'u32';
							}
						];
					}
				];
			};
		},
		{
			name: 'CollaboratorStatus';
			type: {
				kind: 'enum';
				variants: [
					{
						name: 'Pending';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Approved';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					},
					{
						name: 'Rejected';
						fields: [
							{
								name: 'id';
								type: 'u8';
							}
						];
					}
				];
			};
		}
	];
	errors: [
		{
			code: 6000;
			name: 'InvalidAttributeKind';
			msg: 'Invalid attribute kind';
		},
		{
			code: 6001;
			name: 'InvalidAttributeModifier';
			msg: 'Invalid attribute modifier';
		},
		{
			code: 6002;
			name: 'InvalidMarkAttribute';
			msg: 'Invalid mark attribute';
		},
		{
			code: 6003;
			name: 'InvalidAccountKind';
			msg: 'Invalid account kind';
		},
		{
			code: 6004;
			name: 'InvalidAccountModifier';
			msg: 'Invalid account modifier';
		},
		{
			code: 6005;
			name: 'MissingCollectionAccount';
			msg: 'Missing Collection Account';
		},
		{
			code: 6006;
			name: 'MissingPayerAccount';
			msg: 'Missing Payer Account';
		},
		{
			code: 6007;
			name: 'MissingSpace';
			msg: 'Missing Space';
		},
		{
			code: 6008;
			name: 'MissingProgram';
			msg: 'Missing Program';
		},
		{
			code: 6009;
			name: 'MissingAccount';
			msg: 'Missing Account';
		},
		{
			code: 6010;
			name: 'InvalidAccount';
			msg: 'Invalid Account';
		},
		{
			code: 6011;
			name: 'MissingMax';
			msg: 'Missing Max';
		},
		{
			code: 6012;
			name: 'MissingMaxLength';
			msg: 'Missing Max Length';
		},
		{
			code: 6013;
			name: 'CantDeleteCollectionWithAttributes';
			msg: 'Cant delete collection with attributes';
		},
		{
			code: 6014;
			name: 'CollectionDoesntMatchAttribute';
			msg: 'Collection provided doesnt match attribute';
		},
		{
			code: 6015;
			name: 'CantDeleteAccountWithRelations';
			msg: 'Cant delete account with relations';
		},
		{
			code: 6016;
			name: 'CantDeleteInstructionWithArguments';
			msg: 'Cant delete instruction with arguments';
		},
		{
			code: 6017;
			name: 'InstructionDoesntMatchArgument';
			msg: 'Instruction provided doesnt match argument';
		},
		{
			code: 6018;
			name: 'CantDeleteInstructionWithAccounts';
			msg: 'Cant delete instruction with accounts';
		},
		{
			code: 6019;
			name: 'InstructionDoesntMatchAccount';
			msg: 'Instruction provided doesnt match account';
		},
		{
			code: 6020;
			name: 'CantDeleteApplicationWithCollections';
			msg: 'Cant delete application with collections';
		},
		{
			code: 6021;
			name: 'ApplicationDoesntMatchCollection';
			msg: 'Application provided doesnt match collection';
		},
		{
			code: 6022;
			name: 'CantDeleteApplicationWithInstructions';
			msg: 'Cant delete application with instructions';
		},
		{
			code: 6023;
			name: 'ApplicationDoesntMatchInstruction';
			msg: 'Application provided doesnt match instruction';
		},
		{
			code: 6024;
			name: 'CantDeleteWorkspaceWithApplications';
			msg: 'Cant delete workspace with applications';
		},
		{
			code: 6025;
			name: 'CantDeleteWorkspaceWithCollaborators';
			msg: 'Cant delete workspace with collaborators';
		},
		{
			code: 6026;
			name: 'WorkspaceDoesntMatchApplication';
			msg: 'Workspace provided doesnt match application';
		},
		{
			code: 6027;
			name: 'BudgetHasUnsufficientFunds';
			msg: 'Budget has insufficient funds';
		},
		{
			code: 6028;
			name: 'InvalidCollaboratorStatus';
			msg: 'Invalid collaborator status';
		},
		{
			code: 6029;
			name: 'CollaboratorStatusNotApproved';
			msg: 'Collaborator status has not been approved';
		},
		{
			code: 6030;
			name: 'OnlyCollaboratorStatusRequestAuthorCanRetry';
			msg: 'Only collaborator status request author can retry';
		},
		{
			code: 6031;
			name: 'OnlyRejectedCollaboratorStatusRequestsCanBeRetried';
			msg: 'Only rejected collaborator status requests can be retried';
		},
		{
			code: 6032;
			name: 'WorkspaceDoesntMatchCollection';
			msg: 'Workspace provided doesnt match collection';
		},
		{
			code: 6033;
			name: 'ApplicationDoesNotBelongToWorkspace';
			msg: 'Application does not belong to workspace';
		},
		{
			code: 6034;
			name: 'CollectionDoesNotBelongToWorkspace';
			msg: 'Collection does not belong to workspace';
		},
		{
			code: 6035;
			name: 'CollectionDoesNotBelongToApplication';
			msg: 'Collection does not belong to application';
		},
		{
			code: 6036;
			name: 'CollectionAttributeDoesNotBelongToWorkspace';
			msg: 'Collection attribute does not belong to workspace';
		},
		{
			code: 6037;
			name: 'CollectionAttributeDoesNotBelongToCollection';
			msg: 'Collection attribute does not belong to collection';
		},
		{
			code: 6038;
			name: 'InstructionDoesNotBelongToWorkspace';
			msg: 'Instruction does not belong to workspace';
		},
		{
			code: 6039;
			name: 'InstructionDoesNotBelongToApplication';
			msg: 'Instruction does not belong to application';
		},
		{
			code: 6040;
			name: 'InstructionArgumentDoesNotBelongToWorkspace';
			msg: 'Instruction argument does not belong to workspace';
		},
		{
			code: 6041;
			name: 'InstructionArgumentDoesNotBelongToInstruction';
			msg: 'Instruction argument does not belong to instruction';
		},
		{
			code: 6042;
			name: 'InstructionAccountDoesNotBelongToWorkspace';
			msg: 'Instruction account does not belong to workspace';
		},
		{
			code: 6043;
			name: 'InstructionAccountDoesNotBelongToApplication';
			msg: 'Instruction account does not belong to application';
		},
		{
			code: 6044;
			name: 'InstructionAccountDoesNotBelongToInstruction';
			msg: 'Instruction account does not belong to instruction';
		},
		{
			code: 6045;
			name: 'OnlyAdminCollaboratorCanUpdate';
			msg: 'Only admin collaborator can update';
		},
		{
			code: 6046;
			name: 'OnlyDocumentAccountsCanHaveCollection';
			msg: 'Only document accounts can have collection';
		},
		{
			code: 6047;
			name: 'OnlyInitAccountsCanHavePayer';
			msg: 'Only init accounts can have a payer';
		},
		{
			code: 6048;
			name: 'OnlyMutAccountsCanHaveClose';
			msg: 'Only mut accounts can have a close';
		},
		{
			code: 6049;
			name: 'ArithmeticError';
			msg: 'Arithmetic Error';
		},
		{
			code: 6050;
			name: 'UnauthorizedWithdraw';
			msg: 'Unauthorized Withdraw';
		},
		{
			code: 6051;
			name: 'CollectionAttributeDoesNotBelongToApplication';
			msg: 'Collection attribute does not belong to application';
		},
		{
			code: 6052;
			name: 'MissingUncheckedExplanation';
			msg: 'Missing unchecked explanation';
		}
	];
};

export const IDL: Bulldozer = {
	version: '0.1.0',
	name: 'bulldozer',
	instructions: [
		{
			name: 'createUser',
			accounts: [
				{
					name: 'user',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateUserArguments',
					},
				},
			],
		},
		{
			name: 'updateUser',
			accounts: [
				{
					name: 'user',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateUserArguments',
					},
				},
			],
		},
		{
			name: 'deleteUser',
			accounts: [
				{
					name: 'user',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
			],
			args: [],
		},
		{
			name: 'createWorkspace',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateWorkspaceArguments',
					},
				},
			],
		},
		{
			name: 'updateWorkspace',
			accounts: [
				{
					name: 'workspace',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateWorkspaceArguments',
					},
				},
			],
		},
		{
			name: 'depositToBudget',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'DepositToBudgetArguments',
					},
				},
			],
		},
		{
			name: 'withdrawFromBudget',
			accounts: [
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'WithdrawFromBudgetArguments',
					},
				},
			],
		},
		{
			name: 'deleteWorkspace',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createCollaborator',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'authorityUser',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authorityCollaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'authority_user',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'updateCollaborator',
			accounts: [
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authorityCollaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateCollaboratorArguments',
					},
				},
			],
		},
		{
			name: 'deleteCollaborator',
			accounts: [
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'authorityUser',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'authorityCollaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Collaborator',
								path: 'collaborator.workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'authority_user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'requestCollaboratorStatus',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'retryCollaboratorStatusRequest',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createApplication',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateApplicationArguments',
					},
				},
			],
		},
		{
			name: 'updateApplication',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateApplicationArguments',
					},
				},
			],
		},
		{
			name: 'deleteApplication',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
				{
					name: 'workspaceStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'workspace_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application.workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application.workspace',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createCollection',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'collectionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collection_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Collection',
								path: 'collection',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateCollectionArguments',
					},
				},
			],
		},
		{
			name: 'updateCollection',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateCollectionArguments',
					},
				},
			],
		},
		{
			name: 'deleteCollection',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
				{
					name: 'collectionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collection_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Collection',
								path: 'collection',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createCollectionAttribute',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'attribute',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'collectionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collection_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Collection',
								path: 'collection',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateCollectionAttributeArguments',
					},
				},
			],
		},
		{
			name: 'updateCollectionAttribute',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'attribute',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateCollectionAttributeArguments',
					},
				},
			],
		},
		{
			name: 'deleteCollectionAttribute',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'attribute',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'collectionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collection_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Collection',
								path: 'collection',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createInstruction',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateInstructionArguments',
					},
				},
			],
		},
		{
			name: 'updateInstruction',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateInstructionArguments',
					},
				},
			],
		},
		{
			name: 'updateInstructionBody',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateInstructionBodyArguments',
					},
				},
			],
		},
		{
			name: 'clearInstructionBody',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'deleteInstruction',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'applicationStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'application_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Application',
								path: 'application',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createInstructionArgument',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'argument',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateInstructionArgumentArguments',
					},
				},
			],
		},
		{
			name: 'updateInstructionArgument',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'argument',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionArgument',
								path: 'argument.workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateInstructionArgumentArguments',
					},
				},
			],
		},
		{
			name: 'deleteInstructionArgument',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'argument',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createInstructionAccount',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
				{
					name: 'accountStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountCollection',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_collection',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountPayer',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_payer',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountClose',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_close',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountDerivation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_derivation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateInstructionAccountArguments',
					},
				},
			],
		},
		{
			name: 'updateInstructionAccount',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'accountPayer',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_payer',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountClose',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_close',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateInstructionAccountArguments',
					},
				},
			],
		},
		{
			name: 'setInstructionAccountCollection',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountCollection',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_collection',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'setInstructionAccountClose',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'close',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountClose',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_close',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'clearInstructionAccountClose',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountClose',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_close',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'setInstructionAccountPayer',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'payer',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountPayer',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_payer',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'setInstructionAccountDerivation',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountDerivation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_derivation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'SetInstructionAccountDerivationArguments',
					},
				},
			],
		},
		{
			name: 'setTokenCofiguration',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'mint',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'tokenAuthority',
					isMut: false,
					isSigner: false,
				},
			],
			args: [],
		},
		{
			name: 'addSeedToDerivation',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'reference',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountDerivation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_derivation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'setBumpToDerivation',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'collection',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'path',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'reference',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountDerivation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_derivation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'clearInstructionAccountDerivation',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountDerivation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_derivation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'deleteInstructionAccount',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account.workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account.workspace',
							},
						],
					},
				},
				{
					name: 'instructionStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Instruction',
								path: 'instruction',
							},
						],
					},
				},
				{
					name: 'accountStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountCollection',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_collection',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountClose',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_close',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
				{
					name: 'accountPayer',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_payer',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createInstructionAccountConstraint',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'accountConstraint',
					isMut: true,
					isSigner: true,
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'CreateInstructionAccountConstraintArguments',
					},
				},
			],
		},
		{
			name: 'updateInstructionAccountConstraint',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'accountConstraint',
					isMut: true,
					isSigner: false,
				},
			],
			args: [
				{
					name: 'arguments',
					type: {
						defined: 'UpdateInstructionAccountConstraintArguments',
					},
				},
			],
		},
		{
			name: 'deleteInstructionAccountConstraint',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'account',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'accountConstraint',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account.workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'account.workspace',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'createInstructionRelation',
			accounts: [
				{
					name: 'systemProgram',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'authority',
					isMut: true,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'application',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'from',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'to',
					isMut: true,
					isSigner: false,
				},
				{
					name: 'relation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_relation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'from',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'to',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'fromStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'from',
							},
						],
					},
				},
				{
					name: 'toStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'to',
							},
						],
					},
				},
			],
			args: [],
		},
		{
			name: 'deleteInstructionRelation',
			accounts: [
				{
					name: 'authority',
					isMut: false,
					isSigner: true,
				},
				{
					name: 'workspace',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'instruction',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'from',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'to',
					isMut: false,
					isSigner: false,
				},
				{
					name: 'relation',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_relation',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'from',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'to',
							},
						],
					},
				},
				{
					name: 'user',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'user',
							},
							{
								kind: 'account',
								type: 'publicKey',
								path: 'authority',
							},
						],
					},
				},
				{
					name: 'collaborator',
					isMut: false,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'collaborator',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'User',
								path: 'user',
							},
						],
					},
				},
				{
					name: 'budget',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'budget',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'Workspace',
								path: 'workspace',
							},
						],
					},
				},
				{
					name: 'fromStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'from',
							},
						],
					},
				},
				{
					name: 'toStats',
					isMut: true,
					isSigner: false,
					pda: {
						seeds: [
							{
								kind: 'const',
								type: 'string',
								value: 'instruction_account_stats',
							},
							{
								kind: 'account',
								type: 'publicKey',
								account: 'InstructionAccount',
								path: 'to',
							},
						],
					},
				},
			],
			args: [],
		},
	],
	accounts: [
		{
			name: 'applicationStats',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'quantityOfCollections',
						type: 'u8',
					},
					{
						name: 'quantityOfInstructions',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'application',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
					{
						name: 'applicationStatsBump',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'budget',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'bump',
						type: 'u8',
					},
					{
						name: 'totalDeposited',
						type: 'u64',
					},
					{
						name: 'totalValueLocked',
						type: 'u64',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'collaborator',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'user',
						type: 'publicKey',
					},
					{
						name: 'status',
						type: {
							defined: 'CollaboratorStatus',
						},
					},
					{
						name: 'isAdmin',
						type: 'bool',
					},
					{
						name: 'bump',
						type: 'u8',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'collectionAttribute',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'collection',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: {
							defined: 'AttributeKinds',
						},
					},
					{
						name: 'modifier',
						type: {
							option: {
								defined: 'AttributeModifiers',
							},
						},
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'collectionStats',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'quantityOfAttributes',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'collection',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
					{
						name: 'collectionStatsBump',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'instructionAccountConstraint',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'instruction',
						type: 'publicKey',
					},
					{
						name: 'account',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'body',
						type: 'string',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'instructionAccountStats',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'quantityOfRelations',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'instructionAccountCollection',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'collection',
						type: {
							option: 'publicKey',
						},
					},
				],
			},
		},
		{
			name: 'instructionAccountPayer',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'payer',
						type: {
							option: 'publicKey',
						},
					},
				],
			},
		},
		{
			name: 'instructionAccountClose',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'close',
						type: {
							option: 'publicKey',
						},
					},
				],
			},
		},
		{
			name: 'instructionAccountDerivation',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: {
							option: 'string',
						},
					},
					{
						name: 'bumpPath',
						type: {
							option: {
								defined: 'Path',
							},
						},
					},
					{
						name: 'seedPaths',
						type: {
							vec: 'publicKey',
						},
					},
				],
			},
		},
		{
			name: 'instructionAccount',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'instruction',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: {
							defined: 'AccountKinds',
						},
					},
					{
						name: 'modifier',
						type: {
							option: {
								defined: 'AccountModifiers',
							},
						},
					},
					{
						name: 'space',
						type: {
							option: 'u16',
						},
					},
					{
						name: 'uncheckedExplanation',
						type: {
							option: 'string',
						},
					},
					{
						name: 'mint',
						type: {
							option: 'publicKey',
						},
					},
					{
						name: 'tokenAuthority',
						type: {
							option: 'publicKey',
						},
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
					{
						name: 'bumps',
						type: {
							defined: 'InstructionAccountBumps',
						},
					},
				],
			},
		},
		{
			name: 'instructionArgument',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'instruction',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: {
							defined: 'AttributeKinds',
						},
					},
					{
						name: 'modifier',
						type: {
							option: {
								defined: 'AttributeModifiers',
							},
						},
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'instructionRelation',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'instruction',
						type: 'publicKey',
					},
					{
						name: 'from',
						type: 'publicKey',
					},
					{
						name: 'to',
						type: 'publicKey',
					},
					{
						name: 'bump',
						type: 'u8',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'instructionStats',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'quantityOfArguments',
						type: 'u8',
					},
					{
						name: 'quantityOfAccounts',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'instruction',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'workspace',
						type: 'publicKey',
					},
					{
						name: 'application',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'chunks',
						type: {
							vec: {
								defined: 'InstructionChunk',
							},
						},
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
					{
						name: 'instructionStatsBump',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'user',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'userName',
						type: 'string',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'thumbnailUrl',
						type: 'string',
					},
					{
						name: 'bump',
						type: 'u8',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
				],
			},
		},
		{
			name: 'workspaceStats',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'quantityOfCollaborators',
						type: 'u8',
					},
					{
						name: 'quantityOfApplications',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'workspace',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'authority',
						type: 'publicKey',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'createdAt',
						type: 'i64',
					},
					{
						name: 'updatedAt',
						type: 'i64',
					},
					{
						name: 'workspaceStatsBump',
						type: 'u8',
					},
				],
			},
		},
	],
	types: [
		{
			name: 'Path',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'reference',
						type: 'publicKey',
					},
					{
						name: 'path',
						type: 'publicKey',
					},
				],
			},
		},
		{
			name: 'InstructionAccountBumps',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'stats',
						type: 'u8',
					},
					{
						name: 'collection',
						type: 'u8',
					},
					{
						name: 'payer',
						type: 'u8',
					},
					{
						name: 'close',
						type: 'u8',
					},
					{
						name: 'derivation',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'InstructionChunk',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'position',
						type: 'u8',
					},
					{
						name: 'data',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'CreateApplicationArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateApplicationArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateCollaboratorArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'status',
						type: 'u8',
					},
				],
			},
		},
		{
			name: 'CreateCollectionArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateCollectionArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'CreateCollectionAttributeArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: 'u8',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'size',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'max',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'maxLength',
						type: {
							option: 'u32',
						},
					},
				],
			},
		},
		{
			name: 'UpdateCollectionAttributeArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: 'u8',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'size',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'max',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'maxLength',
						type: {
							option: 'u32',
						},
					},
				],
			},
		},
		{
			name: 'CreateInstructionArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateInstructionBodyArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'chunk',
						type: 'u8',
					},
					{
						name: 'body',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateInstructionArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'CreateInstructionAccountArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: 'u8',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'space',
						type: {
							option: 'u16',
						},
					},
					{
						name: 'uncheckedExplanation',
						type: {
							option: 'string',
						},
					},
				],
			},
		},
		{
			name: 'SetInstructionAccountDerivationArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: {
							option: 'string',
						},
					},
				],
			},
		},
		{
			name: 'UpdateInstructionAccountArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'space',
						type: {
							option: 'u16',
						},
					},
					{
						name: 'uncheckedExplanation',
						type: {
							option: 'string',
						},
					},
				],
			},
		},
		{
			name: 'CreateInstructionAccountConstraintArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'body',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateInstructionAccountConstraintArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'body',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'CreateInstructionArgumentArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: 'u8',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'size',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'max',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'maxLength',
						type: {
							option: 'u32',
						},
					},
				],
			},
		},
		{
			name: 'UpdateInstructionArgumentArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'kind',
						type: 'u8',
					},
					{
						name: 'modifier',
						type: {
							option: 'u8',
						},
					},
					{
						name: 'size',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'max',
						type: {
							option: 'u32',
						},
					},
					{
						name: 'maxLength',
						type: {
							option: 'u32',
						},
					},
				],
			},
		},
		{
			name: 'CreateUserArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'userName',
						type: 'string',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'thumbnailUrl',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'UpdateUserArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'userName',
						type: 'string',
					},
					{
						name: 'name',
						type: 'string',
					},
					{
						name: 'thumbnailUrl',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'CreateWorkspaceArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'DepositToBudgetArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'amount',
						type: 'u64',
					},
				],
			},
		},
		{
			name: 'UpdateWorkspaceArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'name',
						type: 'string',
					},
				],
			},
		},
		{
			name: 'WithdrawFromBudgetArguments',
			type: {
				kind: 'struct',
				fields: [
					{
						name: 'amount',
						type: 'u64',
					},
				],
			},
		},
		{
			name: 'AccountKinds',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Document',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Signer',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Unchecked',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Mint',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Token',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
				],
			},
		},
		{
			name: 'AccountModifiers',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Init',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Mut',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
				],
			},
		},
		{
			name: 'AttributeKinds',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Boolean',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
					{
						name: 'Number',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
					{
						name: 'String',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
					{
						name: 'Pubkey',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
				],
			},
		},
		{
			name: 'AttributeModifiers',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Array',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
					{
						name: 'Vector',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
							{
								name: 'size',
								type: 'u32',
							},
						],
					},
				],
			},
		},
		{
			name: 'CollaboratorStatus',
			type: {
				kind: 'enum',
				variants: [
					{
						name: 'Pending',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Approved',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
					{
						name: 'Rejected',
						fields: [
							{
								name: 'id',
								type: 'u8',
							},
						],
					},
				],
			},
		},
	],
	errors: [
		{
			code: 6000,
			name: 'InvalidAttributeKind',
			msg: 'Invalid attribute kind',
		},
		{
			code: 6001,
			name: 'InvalidAttributeModifier',
			msg: 'Invalid attribute modifier',
		},
		{
			code: 6002,
			name: 'InvalidMarkAttribute',
			msg: 'Invalid mark attribute',
		},
		{
			code: 6003,
			name: 'InvalidAccountKind',
			msg: 'Invalid account kind',
		},
		{
			code: 6004,
			name: 'InvalidAccountModifier',
			msg: 'Invalid account modifier',
		},
		{
			code: 6005,
			name: 'MissingCollectionAccount',
			msg: 'Missing Collection Account',
		},
		{
			code: 6006,
			name: 'MissingPayerAccount',
			msg: 'Missing Payer Account',
		},
		{
			code: 6007,
			name: 'MissingSpace',
			msg: 'Missing Space',
		},
		{
			code: 6008,
			name: 'MissingProgram',
			msg: 'Missing Program',
		},
		{
			code: 6009,
			name: 'MissingAccount',
			msg: 'Missing Account',
		},
		{
			code: 6010,
			name: 'InvalidAccount',
			msg: 'Invalid Account',
		},
		{
			code: 6011,
			name: 'MissingMax',
			msg: 'Missing Max',
		},
		{
			code: 6012,
			name: 'MissingMaxLength',
			msg: 'Missing Max Length',
		},
		{
			code: 6013,
			name: 'CantDeleteCollectionWithAttributes',
			msg: 'Cant delete collection with attributes',
		},
		{
			code: 6014,
			name: 'CollectionDoesntMatchAttribute',
			msg: 'Collection provided doesnt match attribute',
		},
		{
			code: 6015,
			name: 'CantDeleteAccountWithRelations',
			msg: 'Cant delete account with relations',
		},
		{
			code: 6016,
			name: 'CantDeleteInstructionWithArguments',
			msg: 'Cant delete instruction with arguments',
		},
		{
			code: 6017,
			name: 'InstructionDoesntMatchArgument',
			msg: 'Instruction provided doesnt match argument',
		},
		{
			code: 6018,
			name: 'CantDeleteInstructionWithAccounts',
			msg: 'Cant delete instruction with accounts',
		},
		{
			code: 6019,
			name: 'InstructionDoesntMatchAccount',
			msg: 'Instruction provided doesnt match account',
		},
		{
			code: 6020,
			name: 'CantDeleteApplicationWithCollections',
			msg: 'Cant delete application with collections',
		},
		{
			code: 6021,
			name: 'ApplicationDoesntMatchCollection',
			msg: 'Application provided doesnt match collection',
		},
		{
			code: 6022,
			name: 'CantDeleteApplicationWithInstructions',
			msg: 'Cant delete application with instructions',
		},
		{
			code: 6023,
			name: 'ApplicationDoesntMatchInstruction',
			msg: 'Application provided doesnt match instruction',
		},
		{
			code: 6024,
			name: 'CantDeleteWorkspaceWithApplications',
			msg: 'Cant delete workspace with applications',
		},
		{
			code: 6025,
			name: 'CantDeleteWorkspaceWithCollaborators',
			msg: 'Cant delete workspace with collaborators',
		},
		{
			code: 6026,
			name: 'WorkspaceDoesntMatchApplication',
			msg: 'Workspace provided doesnt match application',
		},
		{
			code: 6027,
			name: 'BudgetHasUnsufficientFunds',
			msg: 'Budget has insufficient funds',
		},
		{
			code: 6028,
			name: 'InvalidCollaboratorStatus',
			msg: 'Invalid collaborator status',
		},
		{
			code: 6029,
			name: 'CollaboratorStatusNotApproved',
			msg: 'Collaborator status has not been approved',
		},
		{
			code: 6030,
			name: 'OnlyCollaboratorStatusRequestAuthorCanRetry',
			msg: 'Only collaborator status request author can retry',
		},
		{
			code: 6031,
			name: 'OnlyRejectedCollaboratorStatusRequestsCanBeRetried',
			msg: 'Only rejected collaborator status requests can be retried',
		},
		{
			code: 6032,
			name: 'WorkspaceDoesntMatchCollection',
			msg: 'Workspace provided doesnt match collection',
		},
		{
			code: 6033,
			name: 'ApplicationDoesNotBelongToWorkspace',
			msg: 'Application does not belong to workspace',
		},
		{
			code: 6034,
			name: 'CollectionDoesNotBelongToWorkspace',
			msg: 'Collection does not belong to workspace',
		},
		{
			code: 6035,
			name: 'CollectionDoesNotBelongToApplication',
			msg: 'Collection does not belong to application',
		},
		{
			code: 6036,
			name: 'CollectionAttributeDoesNotBelongToWorkspace',
			msg: 'Collection attribute does not belong to workspace',
		},
		{
			code: 6037,
			name: 'CollectionAttributeDoesNotBelongToCollection',
			msg: 'Collection attribute does not belong to collection',
		},
		{
			code: 6038,
			name: 'InstructionDoesNotBelongToWorkspace',
			msg: 'Instruction does not belong to workspace',
		},
		{
			code: 6039,
			name: 'InstructionDoesNotBelongToApplication',
			msg: 'Instruction does not belong to application',
		},
		{
			code: 6040,
			name: 'InstructionArgumentDoesNotBelongToWorkspace',
			msg: 'Instruction argument does not belong to workspace',
		},
		{
			code: 6041,
			name: 'InstructionArgumentDoesNotBelongToInstruction',
			msg: 'Instruction argument does not belong to instruction',
		},
		{
			code: 6042,
			name: 'InstructionAccountDoesNotBelongToWorkspace',
			msg: 'Instruction account does not belong to workspace',
		},
		{
			code: 6043,
			name: 'InstructionAccountDoesNotBelongToApplication',
			msg: 'Instruction account does not belong to application',
		},
		{
			code: 6044,
			name: 'InstructionAccountDoesNotBelongToInstruction',
			msg: 'Instruction account does not belong to instruction',
		},
		{
			code: 6045,
			name: 'OnlyAdminCollaboratorCanUpdate',
			msg: 'Only admin collaborator can update',
		},
		{
			code: 6046,
			name: 'OnlyDocumentAccountsCanHaveCollection',
			msg: 'Only document accounts can have collection',
		},
		{
			code: 6047,
			name: 'OnlyInitAccountsCanHavePayer',
			msg: 'Only init accounts can have a payer',
		},
		{
			code: 6048,
			name: 'OnlyMutAccountsCanHaveClose',
			msg: 'Only mut accounts can have a close',
		},
		{
			code: 6049,
			name: 'ArithmeticError',
			msg: 'Arithmetic Error',
		},
		{
			code: 6050,
			name: 'UnauthorizedWithdraw',
			msg: 'Unauthorized Withdraw',
		},
		{
			code: 6051,
			name: 'CollectionAttributeDoesNotBelongToApplication',
			msg: 'Collection attribute does not belong to application',
		},
		{
			code: 6052,
			name: 'MissingUncheckedExplanation',
			msg: 'Missing unchecked explanation',
		},
	],
};
