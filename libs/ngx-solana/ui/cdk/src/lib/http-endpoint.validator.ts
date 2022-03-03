import { AbstractControl, ValidatorFn } from '@angular/forms';

export function httpEndpoint(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    if (!control.value) {
      return null;
    }

    const [protocol, url] = control.value.split('://');

    if (protocol !== 'http' && protocol !== 'https') {
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
