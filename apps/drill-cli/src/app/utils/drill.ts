export type Drill = {
  version: '0.1.0';
  name: 'drill';
  instructions: [
    {
      name: 'initializeBoard';
      accounts: [
        {
          name: 'board';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'acceptedMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'boardVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
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
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'lockTime';
          type: 'i64';
        }
      ];
    },
    {
      name: 'setBoardAuthority';
      accounts: [
        {
          name: 'board';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'newAuthority';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'boardId';
          type: 'u32';
        }
      ];
    },
    {
      name: 'initializeBounty';
      accounts: [
        {
          name: 'board';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'bounty';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'bounty_id';
              }
            ];
          };
        },
        {
          name: 'acceptedMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bountyVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Bounty';
                path: 'bounty';
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
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'bountyId';
          type: 'u32';
        }
      ];
    },
    {
      name: 'deposit';
      accounts: [
        {
          name: 'board';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'bounty';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'bounty_id';
              }
            ];
          };
        },
        {
          name: 'bountyVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Bounty';
                path: 'bounty';
              }
            ];
          };
        },
        {
          name: 'sponsorVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'bountyId';
          type: 'u32';
        },
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'closeBounty';
      accounts: [
        {
          name: 'board';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'bounty';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'bounty_id';
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
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'bountyId';
          type: 'u32';
        },
        {
          name: 'bountyHunter';
          type: {
            option: 'string';
          };
        }
      ];
    },
    {
      name: 'setBountyHunter';
      accounts: [
        {
          name: 'board';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'bounty';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'bounty_id';
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
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'bountyId';
          type: 'u32';
        },
        {
          name: 'bountyHunter';
          type: 'string';
        }
      ];
    },
    {
      name: 'sendBounty';
      accounts: [
        {
          name: 'board';
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'board_id';
              }
            ];
          };
        },
        {
          name: 'bounty';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Board';
                path: 'board';
              },
              {
                kind: 'arg';
                type: 'u32';
                path: 'bounty_id';
              }
            ];
          };
        },
        {
          name: 'bountyVault';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'bounty_vault';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Bounty';
                path: 'bounty';
              }
            ];
          };
        },
        {
          name: 'userVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'boardId';
          type: 'u32';
        },
        {
          name: 'bountyId';
          type: 'u32';
        },
        {
          name: 'bountyHunter';
          type: 'string';
        }
      ];
    }
  ];
  accounts: [
    {
      name: 'board';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'boardId';
            type: 'u32';
          },
          {
            name: 'acceptedMint';
            type: 'publicKey';
          },
          {
            name: 'lockTime';
            type: 'i64';
          },
          {
            name: 'boardBump';
            type: 'u8';
          },
          {
            name: 'boardVaultBump';
            type: 'u8';
          }
        ];
      };
    },
    {
      name: 'bounty';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'boardId';
            type: 'u32';
          },
          {
            name: 'bountyId';
            type: 'u32';
          },
          {
            name: 'bountyHunter';
            type: {
              option: 'string';
            };
          },
          {
            name: 'closedAt';
            type: {
              option: 'i64';
            };
          },
          {
            name: 'isClosed';
            type: 'bool';
          },
          {
            name: 'bountyBump';
            type: 'u8';
          },
          {
            name: 'bountyVaultBump';
            type: 'u8';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'BountyLockedError';
      msg: 'BountyLockedError';
    }
  ];
};

export const IDL: Drill = {
  version: '0.1.0',
  name: 'drill',
  instructions: [
    {
      name: 'initializeBoard',
      accounts: [
        {
          name: 'board',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'acceptedMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'boardVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
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
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'lockTime',
          type: 'i64',
        },
      ],
    },
    {
      name: 'setBoardAuthority',
      accounts: [
        {
          name: 'board',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newAuthority',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'boardId',
          type: 'u32',
        },
      ],
    },
    {
      name: 'initializeBounty',
      accounts: [
        {
          name: 'board',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'bounty',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'bounty_id',
              },
            ],
          },
        },
        {
          name: 'acceptedMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bountyVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Bounty',
                path: 'bounty',
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
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'bountyId',
          type: 'u32',
        },
      ],
    },
    {
      name: 'deposit',
      accounts: [
        {
          name: 'board',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'bounty',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'bounty_id',
              },
            ],
          },
        },
        {
          name: 'bountyVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Bounty',
                path: 'bounty',
              },
            ],
          },
        },
        {
          name: 'sponsorVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'bountyId',
          type: 'u32',
        },
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'closeBounty',
      accounts: [
        {
          name: 'board',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'bounty',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'bounty_id',
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
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'bountyId',
          type: 'u32',
        },
        {
          name: 'bountyHunter',
          type: {
            option: 'string',
          },
        },
      ],
    },
    {
      name: 'setBountyHunter',
      accounts: [
        {
          name: 'board',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'bounty',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'bounty_id',
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
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'bountyId',
          type: 'u32',
        },
        {
          name: 'bountyHunter',
          type: 'string',
        },
      ],
    },
    {
      name: 'sendBounty',
      accounts: [
        {
          name: 'board',
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'board_id',
              },
            ],
          },
        },
        {
          name: 'bounty',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Board',
                path: 'board',
              },
              {
                kind: 'arg',
                type: 'u32',
                path: 'bounty_id',
              },
            ],
          },
        },
        {
          name: 'bountyVault',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'bounty_vault',
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Bounty',
                path: 'bounty',
              },
            ],
          },
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'boardId',
          type: 'u32',
        },
        {
          name: 'bountyId',
          type: 'u32',
        },
        {
          name: 'bountyHunter',
          type: 'string',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'board',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'boardId',
            type: 'u32',
          },
          {
            name: 'acceptedMint',
            type: 'publicKey',
          },
          {
            name: 'lockTime',
            type: 'i64',
          },
          {
            name: 'boardBump',
            type: 'u8',
          },
          {
            name: 'boardVaultBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'bounty',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'boardId',
            type: 'u32',
          },
          {
            name: 'bountyId',
            type: 'u32',
          },
          {
            name: 'bountyHunter',
            type: {
              option: 'string',
            },
          },
          {
            name: 'closedAt',
            type: {
              option: 'i64',
            },
          },
          {
            name: 'isClosed',
            type: 'bool',
          },
          {
            name: 'bountyBump',
            type: 'u8',
          },
          {
            name: 'bountyVaultBump',
            type: 'u8',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'BountyLockedError',
      msg: 'BountyLockedError',
    },
  ],
};
