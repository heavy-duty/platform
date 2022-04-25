import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'obscureAddress',
  pure: true,
})
export class ObscureAddressPipe implements PipeTransform {
  transform(value: string | null, symbol = '*', limits = [3, 39]): string {
    if (value === null) {
      return '';
    }

    return value
      .split('')
      .reduce(
        (state: string, curr: string, index: number) =>
          state + (index <= limits[0] || index >= limits[1] ? curr : symbol)
      )
      .split(symbol)
      .filter((segment) => segment)
      .join(symbol + symbol + symbol);
  }
}
