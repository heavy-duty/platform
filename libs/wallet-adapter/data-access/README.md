# Angular Solana Wallet Adapter

This is the solana wallet adapter library for Angular.

## Pre-requisites

```
"@angular/core": "14.1.0",
"@ngrx/component-store": "14.0.2",
"@solana/web3.js": "1.50.1",
"rxjs": "7.5.2",
"@solana/wallet-adapter-base": "0.9.9"
"@heavy-duty/wallet-adapter": "0.4.0"
"@angular-builders/custom-webpack": "14.0.0"
```

## Installation

### ng

```
$ ng add @heavy-duty/wallet-adapter
```

### npm

```
$ npm install --save @heavy-duty/wallet-adapter
```

## Development Configuration Setup

### Add `webpack.config.js` to the root of project folder and add the following inside the file

```js
module.exports = (config) => {
	config.resolve.fallback = {
		path: false,
		fs: false,
		os: false,
		crypto: false,
		process: false,
		util: false,
		assert: false,
		stream: false,
	};

	return config;
};
```

### Update `angular.json`

**Set `architect.build.builder` to `"@angular-builders/custom-webpack:browser"`**

```json
"architect": {
	"build": {
	 	"builder": "@angular-builders/custom-webpack:browser",
	 	...
 	},
 	...
 }
```

**In `architect.build.options`, add custom-webpack configuration**

```json
"architect": {
	...
	"build": {
		...
	 	"options": {
	 		...
	 		"customWebpackConfig": {
              "path": "<PATH_TO_THE_WEBPACK_CONFIG>"
            }
	 	}
 	},
 	...
 }
```

**Set `architect.serve.builder` to `"@angular-builders/custom-webpack:dev-server"`**

```json
"architect": {
	...
	"serve": {
	 	"builder": "@angular-builders/custom-webpack:dev-server",
	 	...
 	},
 	...
 }
```

### Update `src/polyfills.ts`

```ts
import { Buffer } from 'buffer';
import 'zone.js'; // Included with Angular CLI.

(window as any).global = window;
(window as any).global.Buffer = Buffer;
(window as any).process = {
	version: '',
	node: false,
	env: false,
};
```

## Usage

### Add wallet adapter module in `app.module.ts`

```ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ... ,
    HdWalletAdapterModule.forRoot({ autoConnect: true })
  ],
  providers: [
  	...
  ],
  bootstrap: [
  	...
  ]
})
```

### Add wallets in `app.component.ts`

```ts
import { Component } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
	PhantomWalletAdapter,
	SlopeWalletAdapter,
	SolflareWalletAdapter,
	SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent {
	title = '';
	constructor(
		private readonly _hdConnectionStore: ConnectionStore,
		private readonly _hdWalletStore: WalletStore
	) {}

	ngOnInit() {
		this._hdConnectionStore.setEndpoint('https://api.devnet.solana.com');
		this._hdWalletStore.setAdapters([
			new PhantomWalletAdapter(),
			new SlopeWalletAdapter(),
			new SolflareWalletAdapter(),
			new SolongWalletAdapter(),
		]);
	}
}
```

### UI Example

**In example.html**

```html
<div>
	<select
		[ngModel]="walletName$ | async"
		(ngModelChange)="onSelectWallet($event)"
	>
		<option [ngValue]="null">Not selected</option>
		<option
			*ngFor="let wallet of wallets$ | async"
			[ngValue]="wallet.adapter.name"
		>
			{{ wallet.adapter.name }} ({{ wallet.readyState }})
		</option>
	</select>

	<p>
		Selected provider: {{ walletName$ | async }}
		<ng-container *ngIf="ready$ | async">(READY)</ng-container>
	</p>
</div>
```

**In example.ts**

```ts
import { Component, OnInit } from '@angular/core';
import { WalletName } from '@solana/wallet-adapter-base';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';

@Component({
	selector: 'example',
	templateUrl: './example.html',
	styleUrls: ['./example.css'],
})
export class ExampleComponent implements OnInit {
	readonly wallets$ = this._walletStore.wallets$;
	readonly wallet$ = this._walletStore.wallet$;
	readonly walletName$ = this.wallet$.pipe(
		map((wallet) => wallet?.adapter.name || null)
	);

	constructor(
		private readonly _connectionStore: ConnectionStore,
		private readonly _walletStore: WalletStore
	) {}

	ngOnInit(): void {}

	onSelectWallet(walletName: WalletName) {
		this._walletStore.selectWallet(walletName);
	}
}
```

## More Examples

Example repo from @danmt which uses wallet-adapter library with `nx`:

- [Wallet Adapter Angular Example](https://github.com/danmt/wallet-adapter-angular-sample)

## Releases

[npmjs.com](https://www.npmjs.com/package/@heavy-duty/wallet-adapter)
