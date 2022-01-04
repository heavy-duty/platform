export type Bulldozer = {
  version: '0.1.0';
  name: 'bulldozer';
  instructions: [
    {
      name: 'createWorkspace';
      accounts: [
        {
          name: 'workspace';
          isMut: true;
          isSigner: true;
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
          name: 'name';
          type: 'string';
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
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
      name: 'createApplication';
      accounts: [
        {
          name: 'application';
          isMut: true;
          isSigner: true;
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
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          isMut: false;
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
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          isMut: false;
          isSigner: false;
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
          name: 'dto';
          type: {
            defined: 'AttributeDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'dto';
          type: {
            defined: 'AttributeDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'body';
          type: 'string';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          name: 'dto';
          type: {
            defined: 'AttributeDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'dto';
          type: {
            defined: 'AttributeDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          name: 'dto';
          type: {
            defined: 'AccountDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'dto';
          type: {
            defined: 'AccountDto';
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
          isMut: false;
          isSigner: false;
        },
        {
          name: 'to';
          isMut: false;
          isSigner: false;
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
          name: 'bump';
          type: 'u8';
        }
      ];
    },
    {
      name: 'updateInstructionRelation';
      accounts: [
        {
          name: 'relation';
          isMut: true;
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
          name: 'authority';
          isMut: false;
          isSigner: true;
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
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
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
            name: 'data';
            type: {
              defined: 'Attribute';
            };
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
            name: 'data';
            type: {
              defined: 'BaseAccount';
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
            name: 'data';
            type: {
              defined: 'Attribute';
            };
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
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'AttributeDto';
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
      name: 'Attribute';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'kind';
            type: {
              option: {
                defined: 'AttributeKinds';
              };
            };
          },
          {
            name: 'modifier';
            type: {
              option: {
                defined: 'AttributeModifiers';
              };
            };
          }
        ];
      };
    },
    {
      name: 'AccountDto';
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
      name: 'BaseAccount';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'kind';
            type: {
              option: {
                defined: 'AccountKinds';
              };
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
    }
  ];
};

export const IDL: Bulldozer = {
  version: '0.1.0',
  name: 'bulldozer',
  instructions: [
    {
      name: 'createWorkspace',
      accounts: [
        {
          name: 'workspace',
          isMut: true,
          isSigner: true,
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
          name: 'name',
          type: 'string',
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
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
      name: 'createApplication',
      accounts: [
        {
          name: 'application',
          isMut: true,
          isSigner: true,
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
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          isMut: false,
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
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          isMut: false,
          isSigner: false,
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
          name: 'dto',
          type: {
            defined: 'AttributeDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'dto',
          type: {
            defined: 'AttributeDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'body',
          type: 'string',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          name: 'dto',
          type: {
            defined: 'AttributeDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'dto',
          type: {
            defined: 'AttributeDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          name: 'dto',
          type: {
            defined: 'AccountDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'dto',
          type: {
            defined: 'AccountDto',
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
          isMut: false,
          isSigner: false,
        },
        {
          name: 'to',
          isMut: false,
          isSigner: false,
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
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'updateInstructionRelation',
      accounts: [
        {
          name: 'relation',
          isMut: true,
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
          name: 'authority',
          isMut: false,
          isSigner: true,
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
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
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
            name: 'data',
            type: {
              defined: 'Attribute',
            },
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
            name: 'data',
            type: {
              defined: 'BaseAccount',
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
            name: 'data',
            type: {
              defined: 'Attribute',
            },
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
        ],
      },
    },
  ],
  types: [
    {
      name: 'AttributeDto',
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
      name: 'Attribute',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'kind',
            type: {
              option: {
                defined: 'AttributeKinds',
              },
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
        ],
      },
    },
    {
      name: 'AccountDto',
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
      name: 'BaseAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'kind',
            type: {
              option: {
                defined: 'AccountKinds',
              },
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
  ],
};
