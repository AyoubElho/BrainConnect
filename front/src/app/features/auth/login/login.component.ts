import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/service/UserService';
import { LoginRequest } from '../../../core/service/LoginRequest';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HandleErrors } from '../../../core/service/HandleErrors';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzCheckboxModule, NzIconModule, NzSpinModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  @ViewChild('template') template!: TemplateRef<{}>;
  constructor(
    private router: Router,
    private userService: UserService,
    private handleError: HandleErrors,
    private notification: NzNotificationService
  ) {}

  formGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  error = '';
  isSpinning = false;

  onSubmit() {
    if (this.formGroup.invalid) {
      const checkUserName = this.handleError.checkInput(
        this.formGroup,
        'email',
        'User Name'
      );
      const checkPassword = this.handleError.checkInput(
        this.formGroup,
        'password',
        'Password'
      );

      if (checkUserName) {
        this.error = checkUserName;
      } else if (checkPassword) {
        this.error = checkPassword;
      }
    } else {
      this.isSpinning = true;
      this.userService
        .checkUser(this.formGroup.value as LoginRequest)
        .then((res) => {
          this.isSpinning = false;
          console.log(res.data);
          if (res.data === '') {
            this.error = 'incorrect username or password';
          } else {
            this.showNotification();
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('data', JSON.stringify(res.data));
            window.dispatchEvent(new Event('user-data-updated'));
            this.router.navigate(['/create']);
          }
        });
    }
  }

  showNotification() {
    this.notification.template(this.template, {
      nzDuration: 3000,
      nzPlacement: 'topRight',
    });
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/create']);
    } else {
    }
  }
}
