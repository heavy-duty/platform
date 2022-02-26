import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DepositToBudgetTriggerDirective } from './deposit-to-budget-trigger.directive';
import { DepositToBudgetComponent } from './deposit-to-budget.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: [DepositToBudgetComponent, DepositToBudgetTriggerDirective],
  exports: [DepositToBudgetTriggerDirective],
})
export class DepositToBudgetComponentModule {}
