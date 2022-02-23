import { AbstractControl, ValidatorFn } from '@angular/forms';
import bs58 from 'bs58';

export function publicKeyValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: unknown } | null => {
    if (!control.value) {
      return null;
    }

    return bs58.decode(control.value).byteLength === 32
      ? null
      : { publicKey: control.value };
  };
}
