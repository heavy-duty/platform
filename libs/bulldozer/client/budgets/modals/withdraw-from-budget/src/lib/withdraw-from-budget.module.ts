import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { WithdrawFromBudgetComponent } from './withdraw-from-budget.component';
import { WithdrawFromBudgetDirective } from './withdraw-from-budget.directive';

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
  declarations: [WithdrawFromBudgetComponent, WithdrawFromBudgetDirective],
  exports: [WithdrawFromBudgetDirective],
})
export class WithdrawFromBudgetModule {}
