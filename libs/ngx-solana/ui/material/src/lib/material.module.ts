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
import { NgxSolanaCdkModule } from '@heavy-duty/ngx-solana-cdk';
import { NgxConnectionMenuButtonComponent } from './connection-menu-button.component';
import { NgxConnectionMenuComponent } from './connection-menu.component';
import { NgxConnectionMiniStatusComponent } from './connection-mini-status.component';
import { NgxConnectionStatusComponent } from './connection-status.component';
import { NgxEditEndpointsModalTriggerDirective } from './edit-endpoints-modal-trigger.directive';
import { NgxEditEndpointsComponent } from './edit-endpoints-modal.component';
import { NgxEndpointsListItemComponent } from './endpoints-list-item.component';
import { NgxEndpointsListComponent } from './endpoints-list.component';
import { NgxNetworkSelectorComponent } from './network-selector.component';

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
    NgxSolanaCdkModule,
  ],
  declarations: [
    NgxConnectionMenuButtonComponent,
    NgxConnectionMenuComponent,
    NgxConnectionMiniStatusComponent,
    NgxEditEndpointsComponent,
    NgxEditEndpointsModalTriggerDirective,
    NgxEndpointsListComponent,
    NgxEndpointsListItemComponent,
    NgxNetworkSelectorComponent,
    NgxConnectionStatusComponent,
  ],
  exports: [NgxConnectionMenuComponent],
})
export class NgxSolanaMaterialModule {}
