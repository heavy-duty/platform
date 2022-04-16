import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditCollectionModule } from '@bulldozer-client/edit-collection';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { HdBroadcasterCdkModule } from '@heavy-duty/broadcaster-cdk';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewCollectionComponent } from './view-collection.component';

@NgModule({
  declarations: [ViewCollectionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewCollectionComponent,
        children: [
          {
            path: 'attributes',
            loadChildren: () =>
              import('@bulldozer-client/view-collection-attributes').then(
                (m) => m.ViewCollectionAttributesModule
              ),
          },
          {
            path: 'code-viewer',
            loadChildren: () =>
              import('@bulldozer-client/view-collection-code-viewer').then(
                (m) => m.ViewCollectionCodeModule
              ),
          },
          {
            path: '',
            redirectTo: 'attributes',
          },
        ],
      },
    ]),
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
    EditCollectionModule,
    HdWalletAdapterCdkModule,
    HdBroadcasterCdkModule,
  ],
})
export class ViewCollectionModule {}
