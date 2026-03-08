import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/service/UserService';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HandleErrors } from '../../../core/service/HandleErrors';
import { SignupRequest } from '../../../core/service/SignupRequest';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  constructor(
    private router: Router,
    private userService: UserService,
    private handleError: HandleErrors
  ) {}

  formGroup = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      rePassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    },
    { validators: this.passwordMatchValidator }
  );

  error = '';

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('rePassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      for (let key in this.formGroup.value) {
        const checkInput = this.handleError.checkInput(
          this.formGroup,
          key,
          key
        );
        if (checkInput) {
          this.error = checkInput;
          break;
        }
      }
    } else {
      const { rePassword, ...signupRequest } = this.formGroup.value;
      this.userService.save(signupRequest as SignupRequest).then((res) => {
        if (res.data === '') {
          this.error = 'User With this username already exist';
        } else {
          this.router.navigate(['/create']);
        }
      });
    }
  }
}
