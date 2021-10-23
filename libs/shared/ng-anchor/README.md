# @heavy-duty/ng-anchor

This library works as a wrapper on top of @project-serum/anchor for Angular applications.

## How it works

You inject a configuration object per program you want to connect to. The configuration consists of a program id and it's IDL.

```typescript
import { PROGRAM_CONFIGS } from '@heavy-duty/ng-anchor';

@NgModule({
  ...,
  providers: [
    {
      provide: PROGRAM_CONFIGS,
      useValue: {
        "<your-program-name>": {
          id: "<your-program-id>",
          idl: "<your-program-idl>"
        }
      }
    }
  ]
  ...
})
```

We recommend injecting this provider in the `AppModule`, that way everything will have access to it. Now you can use DI to inject a `ProgramStore`.

The `ProgramStore` needs to know about the Connection and Wallet, we recommend doing this before using the `ProgramStore`:

```typescript
class AppComponent {
  constructor(
    private programStore: ProgramStore,
    private connectionStore: ConnectionStore,
    private walletStore: WalletStore
  ) {}

  ngOnInit() {
    this.programStore.loadConnection(this.connectionStore.connection$);
    this.programStore.loadWallet(this.walletStore.anchorWallet$);
  }
}
```

You should have a ConnectionStore and a WalletStore to manage the RPC connection and Wallet connection. We use this package with @heavy-duty/wallet-adapter, and use the stores it provides.

The ProgramStore has two methods: `getReader` and `getWriter`, given a program name they return a Program instance or null. `getReader` returns null when the connection is not available, while `getWriter` fails if the connection or wallet are not available.

The idea of splitting reader and writer is because Anchor programs require a wallet connection, meaning that it's not possible to read any data until a wallet has connected. The reader uses a dummy value and trying to write with it results in a runtime error. The writer does allow users to sign transactions, it can read too, but we recommend separating the responsibilities.

## Dependencies

- @angular/common
- @angular/core
- @ngrx/component-store
- @project-serum/anchor
- @solana/web3.js
- rxjs
