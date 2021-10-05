import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShellComponent } from './shell.component';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ShellComponent }]),
    NavigationModule,
  ],
  declarations: [ShellComponent],
  exports: [ShellComponent],
})
export class ShellModule {}
