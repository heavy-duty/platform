import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConnectionMenuComponent } from './connection-menu.component';
import { RelativeTimePipe } from './relative-time.pipe';
import { StopPropagationDirective } from './stop-propagation.directive';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    ConnectionMenuComponent,
    RelativeTimePipe,
    StopPropagationDirective,
  ],
  exports: [ConnectionMenuComponent],
})
export class NgxSolanaMaterialModule {}
