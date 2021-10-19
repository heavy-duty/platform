import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DarkThemeDirectivesModule } from '@heavy-duty/bulldozer/application/ui/directives/dark-theme';

import { DarkThemeSwitchComponent } from './dark-theme-switch.component';

@NgModule({
  declarations: [DarkThemeSwitchComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DarkThemeDirectivesModule,
  ],
  exports: [DarkThemeSwitchComponent],
})
export class DarkThemeSwitchModule {}
