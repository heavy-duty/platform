import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConstructionNotificationComponent } from './construction-notification.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ConstructionNotificationComponent],
  exports: [ConstructionNotificationComponent],
})
export class ConstructionNotificationModule {}
