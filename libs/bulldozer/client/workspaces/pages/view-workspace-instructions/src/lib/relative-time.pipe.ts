import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bdRelativeTime',
  pure: true,
})
export class RelativeTimePipe implements PipeTransform {
  private readonly _rtf = new Intl.RelativeTimeFormat('en', {
    localeMatcher: 'best fit',
    numeric: 'auto',
    style: 'short',
  });

  private getMessage(seconds: number, sign: number) {
    if (seconds < 60) {
      return this._rtf.format(sign * 1, 'minute');
    } else if (seconds < 3600) {
      return this._rtf.format(sign * Math.floor(seconds / 60), 'minute');
    } else if (seconds < 86400) {
      return this._rtf.format(sign * Math.floor(seconds / 3600), 'hour');
    } else {
      return this._rtf.format(sign * Math.floor(seconds / 86400), 'day');
    }
  }

  transform(value: number, isPast = false): string | null {
    return this.getMessage(Math.floor(value / 1000), isPast ? -1 : 1);
  }
}
