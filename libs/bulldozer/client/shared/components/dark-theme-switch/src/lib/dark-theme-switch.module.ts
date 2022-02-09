import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DarkThemeDirectiveModule } from '@bulldozer-client/dark-theme';
import { DarkThemeSwitchComponent } from './dark-theme-switch.component';

@NgModule({
  declarations: [DarkThemeSwitchComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DarkThemeDirectiveModule,
  ],
  exports: [DarkThemeSwitchComponent],
})
export class DarkThemeSwitchModule {}
