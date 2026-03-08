import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class HandleErrors {
  checkInput(formGroup: FormGroup, formControl: any, label: string) {
    const input = formGroup.get(formControl);

    if (input?.hasError('required')) {
      return `${label} is required`;
    } else if (input?.hasError('minlength')) {
      return `${label} must be at least 6 characters long`;
    } else if (input?.hasError('email')) {
      return `${label} is invalid`;
    } else if (
      formControl === 'rePassword' &&
      formGroup?.hasError('passwordMismatch')
    ) {
      return `Passwords do not match`;
    } else {
      return null;
    }
  }
}
