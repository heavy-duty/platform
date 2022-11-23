import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { HdSolanaCdkModule } from '@heavy-duty/ngx-solana-cdk';
import { HdConnectionMenuButtonComponent } from './connection-menu-button.component';
import { HdConnectionMenuComponent } from './connection-menu.component';
import { HdConnectionMiniStatusComponent } from './connection-mini-status.component';
import { HdConnectionStatusComponent } from './connection-status.component';
import { HdEditEndpointsComponent } from './edit-endpoints-modal.component';
import { HdEditEndpointsModalDirective } from './edit-endpoints-modal.directive';
import { HdEndpointsListItemComponent } from './endpoints-list-item.component';
import { HdEndpointsListComponent } from './endpoints-list.component';
import { HdNetworkSelectorComponent } from './network-selector.component';
import { HdTransactionsListButtonComponent } from './transactions-list-button.component';
import { HdTransactionsListComponent } from './transactions-list.component';
import { HdTransactionsListDirective } from './transactions-list.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    HdSolanaCdkModule,
  ],
  declarations: [
    HdConnectionMenuButtonComponent,
    HdConnectionMenuComponent,
    HdConnectionMiniStatusComponent,
    HdEditEndpointsComponent,
    HdEditEndpointsModalDirective,
    HdEndpointsListComponent,
    HdEndpointsListItemComponent,
    HdNetworkSelectorComponent,
    HdConnectionStatusComponent,
    HdTransactionsListComponent,
    HdTransactionsListDirective,
    HdTransactionsListButtonComponent,
  ],
  exports: [
    HdConnectionMenuComponent,
    HdConnectionStatusComponent,
    HdNetworkSelectorComponent,
    HdTransactionsListButtonComponent,
    HdEndpointsListComponent,
    HdEditEndpointsModalDirective,
  ],
})
export class HdSolanaMaterialModule {}
