import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionCodeEditorComponent } from './view-instruction-code-editor.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewInstructionCodeEditorComponent,
      },
    ]),
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
    CodeEditorModule,
    HdWalletAdapterCdkModule,
  ],
  declarations: [ViewInstructionCodeEditorComponent],
})
export class ViewInstructionCodeEditorModule {}
