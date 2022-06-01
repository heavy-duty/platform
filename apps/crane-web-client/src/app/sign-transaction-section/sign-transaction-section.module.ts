import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { KeypairsSectionModule } from './keypairs-section.module';
import { SignTransactionSectionComponent } from './sign-transaction-section.component';
import { SignaturesProgressModule } from './signatures-progress.module';

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    MatButtonModule,
    KeypairsSectionModule,
    SignaturesProgressModule,
  ],
  exports: [SignTransactionSectionComponent],
  declarations: [SignTransactionSectionComponent],
})
export class SignTransactionSectionModule {}
