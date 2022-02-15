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
import { HdConnectionMenuComponent } from './connection-menu.component';
import { HdEditEndpointsModalTriggerDirective } from './edit-endpoints-modal-trigger.directive';
import { HdEditEndpointsComponent } from './edit-endpoints-modal.component';
import { HdRelativeTimePipe } from './relative-time.pipe';
import { HdStopPropagationDirective } from './stop-propagation.directive';

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
  ],
  declarations: [
    HdConnectionMenuComponent,
    HdRelativeTimePipe,
    HdStopPropagationDirective,
    HdEditEndpointsComponent,
    HdEditEndpointsModalTriggerDirective,
  ],
  exports: [HdConnectionMenuComponent],
})
export class NgxSolanaMaterialModule {}
