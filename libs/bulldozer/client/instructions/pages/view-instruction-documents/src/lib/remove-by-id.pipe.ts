import { Pipe, PipeTransform } from '@angular/core';
import { List } from 'immutable';
import { InstructionAccountItemView } from './types';

@Pipe({
  name: 'bdRemoveById',
})
export class RemoveByIdPipe implements PipeTransform {
  transform(
    accounts: List<InstructionAccountItemView>,
    id: string
  ): List<InstructionAccountItemView> {
    return accounts.filter((account) => account.id !== id);
  }
}
