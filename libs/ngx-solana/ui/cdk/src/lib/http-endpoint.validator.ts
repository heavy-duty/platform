import { AbstractControl, ValidatorFn } from '@angular/forms';

export function httpEndpoint(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    if (!control.value) {
      return null;
    }

    const [protocol, url] = control.value.split('://');

    return (protocol === 'http' || protocol === 'https') &&
      url.split('.').length > 1
      ? null
      : { httpEndpoint: control.value };
  };
}
