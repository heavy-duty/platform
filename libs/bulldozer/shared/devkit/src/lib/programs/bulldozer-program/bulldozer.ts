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
      args: [];
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
          name: 'authority';
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
          name: 'workspace';
          isMut: true;
          isSigner: true;
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
      name: 'deleteWorkspace';
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
      name: 'createCollaborator';
      accounts: [
        {
          name: 'workspace';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
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
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
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
                account: 'Collaborator';
                path: 'collaborator.workspace';
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
        },
        {
          name: 'workspace';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collaborator';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'requestCollaboratorStatus';
      accounts: [
        {
          name: 'authority';
          isMut: true;
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
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
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
          name: 'collaborator';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createApplication';
      accounts: [
        {
          name: 'authority';
          isMut: true;
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
          name: 'application';
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
          name: 'application';
          isMut: true;
          isSigner: false;
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
          name: 'collection';
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
                account: 'Collection';
                path: 'collection.workspace';
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
          name: 'collection';
          isMut: true;
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
                account: 'Collection';
                path: 'collection.workspace';
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
                account: 'Collection';
                path: 'collection.workspace';
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
          name: 'attribute';
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
                account: 'CollectionAttribute';
                path: 'attribute.workspace';
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
          name: 'attribute';
          isMut: true;
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
                account: 'CollectionAttribute';
                path: 'attribute.workspace';
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
                account: 'CollectionAttribute';
                path: 'attribute.workspace';
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
          name: 'instruction';
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
                account: 'Instruction';
                path: 'instruction.workspace';
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
                account: 'Instruction';
                path: 'instruction.workspace';
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
      name: 'deleteInstruction';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'instruction';
          isMut: true;
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
                account: 'Instruction';
                path: 'instruction.workspace';
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
                account: 'Instruction';
                path: 'instruction.workspace';
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
          name: 'argument';
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
          name: 'argument';
          isMut: true;
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
                account: 'InstructionArgument';
                path: 'argument.workspace';
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
          name: 'account';
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
      name: 'deleteInstructionAccount';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'account';
          isMut: true;
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
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
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
                account: 'InstructionRelation';
                path: 'relation.workspace';
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
                account: 'InstructionRelation';
                path: 'relation.workspace';
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
            name: 'quantityOfCollections';
            type: 'u8';
          },
          {
            name: 'quantityOfInstructions';
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
            name: 'quantityOfAttributes';
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
            name: 'body';
            type: 'string';
          },
          {
            name: 'quantityOfArguments';
            type: 'u8';
          },
          {
            name: 'quantityOfAccounts';
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
            name: 'collection';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'payer';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'close';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'space';
            type: {
              option: 'u16';
            };
          },
          {
            name: 'quantityOfRelations';
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
      name: 'user';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdAt';
            type: 'i64';
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
            name: 'quantityOfCollaborators';
            type: 'u8';
          },
          {
            name: 'quantityOfApplications';
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
    }
  ];
  types: [
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
      name: 'UpdateInstructionAccountArguments';
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
      name: 'UpdateInstructionBodyArguments';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'body';
            type: 'string';
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
              },
              {
                name: 'collection';
                type: 'publicKey';
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
              },
              {
                name: 'space';
                type: {
                  option: 'u16';
                };
              },
              {
                name: 'payer';
                type: {
                  option: 'publicKey';
                };
              }
            ];
          },
          {
            name: 'Mut';
            fields: [
              {
                name: 'id';
                type: 'u8';
              },
              {
                name: 'close';
                type: {
                  option: 'publicKey';
                };
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
      args: [],
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
          name: 'authority',
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
          name: 'workspace',
          isMut: true,
          isSigner: true,
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
      name: 'deleteWorkspace',
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
      name: 'createCollaborator',
      accounts: [
        {
          name: 'workspace',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
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
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
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
                account: 'Collaborator',
                path: 'collaborator.workspace',
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
        {
          name: 'workspace',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collaborator',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'requestCollaboratorStatus',
      accounts: [
        {
          name: 'authority',
          isMut: true,
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
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
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
          name: 'collaborator',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createApplication',
      accounts: [
        {
          name: 'authority',
          isMut: true,
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
          name: 'application',
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
          name: 'application',
          isMut: true,
          isSigner: false,
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
          name: 'collection',
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
                account: 'Collection',
                path: 'collection.workspace',
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
          name: 'collection',
          isMut: true,
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
                account: 'Collection',
                path: 'collection.workspace',
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
                account: 'Collection',
                path: 'collection.workspace',
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
          name: 'attribute',
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
                account: 'CollectionAttribute',
                path: 'attribute.workspace',
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
          name: 'attribute',
          isMut: true,
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
                account: 'CollectionAttribute',
                path: 'attribute.workspace',
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
                account: 'CollectionAttribute',
                path: 'attribute.workspace',
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
          name: 'instruction',
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
                account: 'Instruction',
                path: 'instruction.workspace',
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
                account: 'Instruction',
                path: 'instruction.workspace',
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
      name: 'deleteInstruction',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'instruction',
          isMut: true,
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
                account: 'Instruction',
                path: 'instruction.workspace',
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
                account: 'Instruction',
                path: 'instruction.workspace',
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
          name: 'argument',
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
          name: 'argument',
          isMut: true,
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
                account: 'InstructionArgument',
                path: 'argument.workspace',
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
          name: 'account',
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
      name: 'deleteInstructionAccount',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'account',
          isMut: true,
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
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
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
                account: 'InstructionRelation',
                path: 'relation.workspace',
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
                account: 'InstructionRelation',
                path: 'relation.workspace',
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
            name: 'quantityOfCollections',
            type: 'u8',
          },
          {
            name: 'quantityOfInstructions',
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
            name: 'quantityOfAttributes',
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
            name: 'body',
            type: 'string',
          },
          {
            name: 'quantityOfArguments',
            type: 'u8',
          },
          {
            name: 'quantityOfAccounts',
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
            name: 'collection',
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'payer',
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'close',
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'space',
            type: {
              option: 'u16',
            },
          },
          {
            name: 'quantityOfRelations',
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
      name: 'user',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
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
            name: 'quantityOfCollaborators',
            type: 'u8',
          },
          {
            name: 'quantityOfApplications',
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
  ],
  types: [
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
      name: 'UpdateInstructionAccountArguments',
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
      name: 'UpdateInstructionBodyArguments',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'body',
            type: 'string',
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
              {
                name: 'collection',
                type: 'publicKey',
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
              {
                name: 'space',
                type: {
                  option: 'u16',
                },
              },
              {
                name: 'payer',
                type: {
                  option: 'publicKey',
                },
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
              {
                name: 'close',
                type: {
                  option: 'publicKey',
                },
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
  ],
};
