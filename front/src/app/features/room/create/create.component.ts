import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {CommonModule} from '@angular/common';
import RoomService from '../../../core/service/RoomService';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-create',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NzButtonModule,
    NzModalModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzLayoutModule,
    CommonModule,
    NzIconDirective,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent implements OnInit {
  roomCode: string = '';
  roomService = new RoomService();
  userData: any;
  roomForm!: FormGroup;
  @ViewChild('template', { static: true }) template!: TemplateRef<any>;

  constructor(private fb: FormBuilder, private notification: NzNotificationService, private router: Router) {}

  ngOnInit(): void {
    // Get user ID from localStorage
    const storageDataString = localStorage.getItem('data');

    if (storageDataString) {
      try {
        this.userData = JSON.parse(storageDataString);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }

      this.roomForm = this.fb.group({
        title: ['', [Validators.required]],
      });
    }
  }

  submitForm(): void {
    if (this.roomForm.valid) {
      this.roomService.saveRoom(this.roomForm.value, this.userData).then(({data}) => {
        this.showNotification()
        this.isVisibleMiddle = false
      });
    } else {
      Object.values(this.roomForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({onlySelf: true});
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


  isVisibleMiddle = false;

  showModalMiddle(): void {
    this.isVisibleMiddle = true;
  }

  handleOkMiddle(): void {
    console.log('click ok');
    this.isVisibleMiddle = false;
  }

  handleCancelMiddle(): void {
    this.isVisibleMiddle = false;
  }

  goToRoom(): void {
    const code = this.roomCode.trim();
    if (!code) {
      this.notification.warning('Room code required', 'Please enter a room code.');
      return;
    }

    this.roomService.getRoomByCode(code)
      .then(({ data }) => {
        if (!data) {
          throw new Error('Room not found');
        }
        this.router.navigate(['/editor', data]);
      })
      .catch((error) => {
        if (error?.response?.status === 404) {
          this.notification.error('Room not found', 'This room code does not exist.');
          return;
        }
        this.notification.error('Unable to join room', 'Please try again.');
      });
  }
}
