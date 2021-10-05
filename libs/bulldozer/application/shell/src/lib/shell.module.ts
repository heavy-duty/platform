import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ApplicationShellComponent } from './shell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ApplicationShellComponent }]),
  ],
  declarations: [ApplicationShellComponent],
  exports: [ApplicationShellComponent],
})
export class ApplicationShellModule {}
