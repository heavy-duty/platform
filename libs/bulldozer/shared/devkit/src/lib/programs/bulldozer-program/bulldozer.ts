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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
      name: 'deleteCollaborator';
      accounts: [
        {
          name: 'collaborator';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: true;
          isSigner: false;
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
      name: 'createApplication';
      accounts: [
        {
          name: 'application';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'workspace';
          isMut: true;
          isSigner: false;
        },
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
          name: 'application';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateApplicationArguments';
          };
        }
      ];
    },
    {
      name: 'deleteApplication';
      accounts: [
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
      name: 'createCollection';
      accounts: [
        {
          name: 'collection';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'application';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
          isSigner: false;
        },
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
          name: 'collection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateCollectionArguments';
          };
        }
      ];
    },
    {
      name: 'deleteCollection';
      accounts: [
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
          name: 'workspace';
          isMut: false;
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
          name: 'attribute';
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
          name: 'attribute';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateCollectionAttributeArguments';
          };
        }
      ];
    },
    {
      name: 'deleteCollectionAttribute';
      accounts: [
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
          name: 'workspace';
          isMut: false;
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
      name: 'createInstruction';
      accounts: [
        {
          name: 'instruction';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'application';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
          isSigner: false;
        },
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
          name: 'instruction';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateInstructionArguments';
          };
        }
      ];
    },
    {
      name: 'updateInstructionBody';
      accounts: [
        {
          name: 'instruction';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateInstructionBodyArguments';
          };
        }
      ];
    },
    {
      name: 'deleteInstruction';
      accounts: [
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
          name: 'workspace';
          isMut: false;
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
          name: 'argument';
          isMut: true;
          isSigner: true;
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
          name: 'workspace';
          isMut: false;
          isSigner: false;
        },
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
          name: 'argument';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateInstructionArgumentArguments';
          };
        }
      ];
    },
    {
      name: 'deleteInstructionArgument';
      accounts: [
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
          name: 'workspace';
          isMut: false;
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
      name: 'createInstructionAccount';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: true;
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
          name: 'workspace';
          isMut: false;
          isSigner: false;
        },
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
          name: 'account';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'workspace';
          isMut: false;
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
            defined: 'UpdateInstructionAccountArguments';
          };
        }
      ];
    },
    {
      name: 'deleteInstructionAccount';
      accounts: [
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
          name: 'workspace';
          isMut: false;
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
      name: 'createInstructionRelation';
      accounts: [
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
      name: 'deleteCollaborator',
      accounts: [
        {
          name: 'collaborator',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: true,
          isSigner: false,
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
      name: 'createApplication',
      accounts: [
        {
          name: 'application',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'workspace',
          isMut: true,
          isSigner: false,
        },
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
          name: 'application',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateApplicationArguments',
          },
        },
      ],
    },
    {
      name: 'deleteApplication',
      accounts: [
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
      name: 'createCollection',
      accounts: [
        {
          name: 'collection',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'application',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
          isSigner: false,
        },
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
          name: 'collection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateCollectionArguments',
          },
        },
      ],
    },
    {
      name: 'deleteCollection',
      accounts: [
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
          name: 'workspace',
          isMut: false,
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
          name: 'attribute',
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
          name: 'attribute',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateCollectionAttributeArguments',
          },
        },
      ],
    },
    {
      name: 'deleteCollectionAttribute',
      accounts: [
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
          name: 'workspace',
          isMut: false,
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
      name: 'createInstruction',
      accounts: [
        {
          name: 'instruction',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'application',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
          isSigner: false,
        },
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
          name: 'instruction',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateInstructionArguments',
          },
        },
      ],
    },
    {
      name: 'updateInstructionBody',
      accounts: [
        {
          name: 'instruction',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateInstructionBodyArguments',
          },
        },
      ],
    },
    {
      name: 'deleteInstruction',
      accounts: [
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
          name: 'workspace',
          isMut: false,
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
          name: 'argument',
          isMut: true,
          isSigner: true,
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
          name: 'workspace',
          isMut: false,
          isSigner: false,
        },
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
          name: 'argument',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateInstructionArgumentArguments',
          },
        },
      ],
    },
    {
      name: 'deleteInstructionArgument',
      accounts: [
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
          name: 'workspace',
          isMut: false,
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
      name: 'createInstructionAccount',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: true,
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
          name: 'workspace',
          isMut: false,
          isSigner: false,
        },
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
          name: 'account',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'workspace',
          isMut: false,
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
            defined: 'UpdateInstructionAccountArguments',
          },
        },
      ],
    },
    {
      name: 'deleteInstructionAccount',
      accounts: [
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
          name: 'workspace',
          isMut: false,
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
      name: 'createInstructionRelation',
      accounts: [
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
  ],
};
