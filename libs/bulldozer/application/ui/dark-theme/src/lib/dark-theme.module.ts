import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DarkThemeSwitchComponent } from './dark-theme-switch.component';
import { DarkThemeDirective } from './dark-theme.directive';
import { DarkThemeService } from './dark-theme.service';

@NgModule({
  declarations: [DarkThemeDirective, DarkThemeSwitchComponent],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  providers: [DarkThemeService],
  exports: [DarkThemeDirective, DarkThemeSwitchComponent],
})
export class DarkThemeModule {}
