export type TokenProgram = {
  version: '0.1.0';
  name: 'token_program';
  instructions: [
    {
      name: 'initializeMint';
      accounts: [
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'decimals';
          type: 'u8';
        },
        {
          name: 'mintAuthority';
          type: 'publicKey';
        },
        {
          name: 'freezeAuthority';
          type: {
            option: 'publicKey';
          };
        }
      ];
    },
    {
      name: 'initializeAccount';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'initializeMultisig';
      accounts: [
        {
          name: 'multisig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'm';
          type: 'u8';
        }
      ];
    },
    {
      name: 'transfer';
      accounts: [
        {
          name: 'source';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'destination';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'approve';
      accounts: [
        {
          name: 'source';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'revoke';
      accounts: [
        {
          name: 'source';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'setAuthority';
      accounts: [
        {
          name: 'owned';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'authorityType';
          type: {
            defined: 'AuthorityType';
          };
        },
        {
          name: 'newAuthority';
          type: {
            option: 'publicKey';
          };
        }
      ];
    },
    {
      name: 'mintTo';
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'burn';
      accounts: [
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'closeAccount';
      accounts: [
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'destination';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'freezeAccount';
      accounts: [
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'thawAccount';
      accounts: [
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'transferChecked';
      accounts: [
        {
          name: 'source';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'destination';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'decimals';
          type: 'u8';
        }
      ];
    },
    {
      name: 'approveChecked';
      accounts: [
        {
          name: 'source';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'delegate';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'decimals';
          type: 'u8';
        }
      ];
    },
    {
      name: 'mintToChecked';
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'decimals';
          type: 'u8';
        }
      ];
    },
    {
      name: 'burnChecked';
      accounts: [
        {
          name: 'account';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'decimals';
          type: 'u8';
        }
      ];
    },
    {
      name: 'initializeAccount2';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'owner';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'syncNative';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'initializeAccount3';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'owner';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'initializeMultisig2';
      accounts: [
        {
          name: 'multisig';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'signer';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'm';
          type: 'u8';
        }
      ];
    },
    {
      name: 'initializeMint2';
      accounts: [
        {
          name: 'mint';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'decimals';
          type: 'u8';
        },
        {
          name: 'mintAuthority';
          type: 'publicKey';
        },
        {
          name: 'freezeAuthority';
          type: {
            option: 'publicKey';
          };
        }
      ];
    },
    {
      name: 'getAccountDataSize';
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'initializeImmutableOwner';
      accounts: [
        {
          name: 'account';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'amountToUiAmount';
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'uiAmountToAmount';
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'uiAmount';
          type: 'string';
        }
      ];
    }
  ];
  types: [
    {
      name: 'AuthorityType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'MintTokens';
          },
          {
            name: 'FreezeAccount';
          },
          {
            name: 'AccountOwner';
          },
          {
            name: 'CloseAccount';
          }
        ];
      };
    }
  ];
};

export const IDL: TokenProgram = {
  version: '0.1.0',
  name: 'token_program',
  instructions: [
    {
      name: 'initializeMint',
      accounts: [
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'decimals',
          type: 'u8',
        },
        {
          name: 'mintAuthority',
          type: 'publicKey',
        },
        {
          name: 'freezeAuthority',
          type: {
            option: 'publicKey',
          },
        },
      ],
    },
    {
      name: 'initializeAccount',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeMultisig',
      accounts: [
        {
          name: 'multisig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'm',
          type: 'u8',
        },
      ],
    },
    {
      name: 'transfer',
      accounts: [
        {
          name: 'source',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'approve',
      accounts: [
        {
          name: 'source',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'revoke',
      accounts: [
        {
          name: 'source',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'setAuthority',
      accounts: [
        {
          name: 'owned',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'authorityType',
          type: {
            defined: 'AuthorityType',
          },
        },
        {
          name: 'newAuthority',
          type: {
            option: 'publicKey',
          },
        },
      ],
    },
    {
      name: 'mintTo',
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'burn',
      accounts: [
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'closeAccount',
      accounts: [
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'freezeAccount',
      accounts: [
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'thawAccount',
      accounts: [
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'transferChecked',
      accounts: [
        {
          name: 'source',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'destination',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'decimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'approveChecked',
      accounts: [
        {
          name: 'source',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'delegate',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'decimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'mintToChecked',
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'decimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'burnChecked',
      accounts: [
        {
          name: 'account',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'decimals',
          type: 'u8',
        },
      ],
    },
    {
      name: 'initializeAccount2',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'owner',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'syncNative',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeAccount3',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'owner',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'initializeMultisig2',
      accounts: [
        {
          name: 'multisig',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'signer',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'm',
          type: 'u8',
        },
      ],
    },
    {
      name: 'initializeMint2',
      accounts: [
        {
          name: 'mint',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'decimals',
          type: 'u8',
        },
        {
          name: 'mintAuthority',
          type: 'publicKey',
        },
        {
          name: 'freezeAuthority',
          type: {
            option: 'publicKey',
          },
        },
      ],
    },
    {
      name: 'getAccountDataSize',
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeImmutableOwner',
      accounts: [
        {
          name: 'account',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'amountToUiAmount',
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'uiAmountToAmount',
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'uiAmount',
          type: 'string',
        },
      ],
    },
  ],
  types: [
    {
      name: 'AuthorityType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'MintTokens',
          },
          {
            name: 'FreezeAccount',
          },
          {
            name: 'AccountOwner',
          },
          {
            name: 'CloseAccount',
          },
        ],
      },
    },
  ],
};
