import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obscureAddress',
  pure: true,
})
export class ObscureAddressPipe implements PipeTransform {
  transform(value: string | null, symbol = '*'): string {
    if (value === null) {
      return '';
    }

    return value
      .split('')
      .reduce(
        (state: string, curr: string, index: number) =>
          state + (index <= 3 || index >= 39 ? curr : symbol)
      )
      .split(symbol)
      .filter((segment) => segment)
      .join(symbol + symbol + symbol);
  }
}
