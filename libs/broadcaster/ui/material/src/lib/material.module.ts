import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HdBroadcasterCdkModule } from '@heavy-duty/broadcaster-cdk';
import { HdTransactionsListButtonComponent } from './transactions-list-button.component';
import { HdTransactionsListComponent } from './transactions-list.component';
import { HdTransactionsListDirective } from './transactions-list.directive';

@NgModule({
  imports: [
    CommonModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HdBroadcasterCdkModule,
  ],
  declarations: [
    HdTransactionsListButtonComponent,
    HdTransactionsListComponent,
    HdTransactionsListDirective,
  ],
  exports: [
    HdTransactionsListButtonComponent,
    HdTransactionsListComponent,
    HdTransactionsListDirective,
  ],
})
export class HdBroadcasterMaterialModule {}
