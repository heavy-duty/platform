import { FormControl, ValidationErrors } from '@angular/forms';
import { PublicKey } from '@solana/web3.js';

export function PublicKeyValidator(
  control: FormControl
): ValidationErrors | null {
  try {
    new PublicKey(control.value);
    return null;
  } catch (error) {
    return { publicKey: true };
  }
}
