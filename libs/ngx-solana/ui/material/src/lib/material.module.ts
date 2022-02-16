import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HdSolanaCdkModule } from '@heavy-duty/ngx-solana-cdk';
import { HdConnectionMenuButtonComponent } from './connection-menu-button.component';
import { HdConnectionMenuComponent } from './connection-menu.component';
import { HdConnectionMiniStatusComponent } from './connection-mini-status.component';
import { HdConnectionStatusComponent } from './connection-status.component';
import { HdEditEndpointsModalTriggerDirective } from './edit-endpoints-modal-trigger.directive';
import { HdEditEndpointsComponent } from './edit-endpoints-modal.component';
import { HdEndpointsListItemComponent } from './endpoints-list-item.component';
import { HdEndpointsListComponent } from './endpoints-list.component';
import { HdNetworkSelectorComponent } from './network-selector.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
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
    HdEditEndpointsModalTriggerDirective,
    HdEndpointsListComponent,
    HdEndpointsListItemComponent,
    HdNetworkSelectorComponent,
    HdConnectionStatusComponent,
  ],
  exports: [HdConnectionMenuComponent],
})
export class HdSolanaMaterialModule {}
