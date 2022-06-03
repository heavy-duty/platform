import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KeypairsSectionComponent } from './keypairs-section.component';

@NgModule({
	imports: [CommonModule, MatButtonModule, MatIconModule, ClipboardModule],
	exports: [KeypairsSectionComponent],
	declarations: [KeypairsSectionComponent],
	providers: [],
})
export class KeypairsSectionModule {}
