import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditInstructionDocumentComponent } from '@bulldozer-client/edit-instruction-document';
import { EditInstructionMintComponent } from '@bulldozer-client/edit-instruction-mint';
import { EditInstructionTokenComponent } from '@bulldozer-client/edit-instruction-token';
import { EditInstructionUncheckedComponent } from '@bulldozer-client/edit-instruction-unchecked';
import { InstructionAccountModel } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { List } from 'immutable';
import { concatMap, EMPTY, tap, throwError } from 'rxjs';
import { AddInstructionAccountComponent } from './add-instruction-account.component';
import { Collection, InstructionAccount } from './types';

@Directive({ selector: '[bdAddInstructionAccount]' })
export class AddInstructionAccountDirective {
	@Input() collections: List<Collection> | null = null;
	@Input() instructionAccounts: List<InstructionAccount> | null = null;
	@Output() editInstructionAccount =
		new EventEmitter<InstructionAccountModel>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<
				AddInstructionAccountComponent,
				unknown,
				'unchecked' | 'document' | 'mint' | 'token'
			>(AddInstructionAccountComponent, {
				panelClass: ['bg-bp-wood', 'bg-bp-brown'],
			})
			.afterClosed()
			.pipe(
				isNotNullOrUndefined,
				concatMap((data) => {
					switch (data) {
						case 'document': {
							if (
								this.collections === null ||
								this.instructionAccounts === null
							) {
								return throwError(() => new Error('Values missing!'));
							}

							return this._matDialog
								.open<
									EditInstructionDocumentComponent,
									| {
											document?: InstructionAccountModel;
											collections: List<Collection>;
											accounts: List<InstructionAccount>;
									  }
									| undefined,
									InstructionAccountModel
								>(EditInstructionDocumentComponent, {
									data: {
										document: undefined,
										collections: this.collections,
										accounts: this.instructionAccounts,
									},
									panelClass: ['bg-bp-wood', 'bg-bp-brown'],
								})
								.afterClosed()
								.pipe(
									tap((data) => data && this.editInstructionAccount.emit(data))
								);
						}
						case 'unchecked': {
							if (this.instructionAccounts === null) {
								return throwError(() => new Error('Values missing!'));
							}

							return this._matDialog
								.open<
									EditInstructionUncheckedComponent,
									| {
											document?: InstructionAccountModel;
											accounts: List<InstructionAccount>;
									  }
									| undefined,
									InstructionAccountModel
								>(EditInstructionUncheckedComponent, {
									data: {
										document: undefined,
										accounts: this.instructionAccounts,
									},
									panelClass: ['bg-bp-wood', 'bg-bp-brown'],
								})
								.afterClosed()
								.pipe(
									tap((data) => data && this.editInstructionAccount.emit(data))
								);
						}
						case 'mint': {
							if (this.instructionAccounts === null) {
								return throwError(() => new Error('Values missing!'));
							}

							return this._matDialog
								.open<
									EditInstructionMintComponent,
									| {
											document?: InstructionAccountModel;
									  }
									| undefined,
									InstructionAccountModel
								>(EditInstructionMintComponent, {
									data: {
										document: undefined,
									},
									panelClass: ['bg-bp-wood', 'bg-bp-brown'],
								})
								.afterClosed()
								.pipe(
									tap((data) => data && this.editInstructionAccount.emit(data))
								);
						}
						case 'token': {
							if (this.instructionAccounts === null) {
								return throwError(() => new Error('Values missing!'));
							}

							return this._matDialog
								.open<
									EditInstructionTokenComponent,
									| {
											document?: InstructionAccountModel;
											accounts: List<InstructionAccount>;
									  }
									| undefined,
									InstructionAccountModel
								>(EditInstructionTokenComponent, {
									data: {
										document: undefined,
										accounts: this.instructionAccounts,
									},
									panelClass: ['bg-bp-wood', 'bg-bp-brown'],
								})
								.afterClosed()
								.pipe(
									tap((data) => data && this.editInstructionAccount.emit(data))
								);
						}
						default:
							return EMPTY;
					}
				})
			)
			.subscribe();
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
