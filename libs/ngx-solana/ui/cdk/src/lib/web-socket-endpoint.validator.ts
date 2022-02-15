import { AbstractControl, ValidatorFn } from '@angular/forms';

export function webSocketEndpoint(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    if (!control.value) {
      return null;
    }

    const [protocol, url] = control.value.split('://');

    return (protocol === 'ws' || protocol === 'wss') &&
      url.split('.').length > 1
      ? null
      : { webSocketEndpoint: control.value };
  };
}
