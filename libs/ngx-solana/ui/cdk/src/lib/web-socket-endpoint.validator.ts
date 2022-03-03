import { AbstractControl, ValidatorFn } from '@angular/forms';

export function webSocketEndpoint(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    if (!control.value) {
      return null;
    }

    const [protocol, url] = control.value.split('://');

    if (protocol !== 'ws' && protocol !== 'wss') {
      return { httpEndpoint: control.value };
    }

    if (url.includes('localhost')) {
      return url.split(':').length === 2
        ? null
        : { httpEndpoint: control.value };
    }

    return url.split('.').length > 1 ? null : { httpEndpoint: control.value };
  };
}
