import {Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {Router} from '@angular/router';
import {NzInputDirective, NzInputGroupComponent} from 'ng-zorro-antd/input';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzUploadChangeParam, NzUploadComponent} from 'ng-zorro-antd/upload';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {UserService} from '../../../core/service/UserService';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {User} from '../../../core/module/room/User';

@Component({
  selector: 'app-profile',
  imports: [
    MatIconModule,
    NzAvatarComponent,
    NzInputDirective,
    NzButtonComponent,
    NzUploadComponent,
    NzIconDirective,
    NzInputGroupComponent,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  dataUser: User | null = null;
  avatarUrl: string | undefined = '';
  isEmailDisabled = true;
  isUsernameDisabled = true;
  isSavingPicture = false;
  isVisible = false;

  userService = new UserService();

  constructor(private router: Router) {
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  ngOnInit(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const storedData = localStorage.getItem('data');
    this.dataUser = storedData ? JSON.parse(storedData) : null;
  }

  handleChange(info: NzUploadChangeParam): void {
    if (!info.file.originFileObj) {
      return;
    }

    this.compressImage(info.file.originFileObj)
      .then((compressedDataUrl) => {
        this.avatarUrl = compressedDataUrl;
      })
      .catch(() => {
        alert('Unable to read image. Please choose another file.');
      });
  }

  handlePicture(): void {
    if (!this.dataUser || !this.avatarUrl || this.isSavingPicture) {
      return;
    }

    this.isSavingPicture = true;

    this.userService.updateProfilePicture(this.dataUser.id, this.avatarUrl)
      .then((response) => {
        this.dataUser = response.data;
        this.persistUserData();
        window.dispatchEvent(new Event('user-data-updated'));
        this.avatarUrl = '';
        alert('Picture updated successfully');
      })
      .catch((error) => {
        const serverMessage = error?.response?.data;
        const message = typeof serverMessage === 'string' ? serverMessage : 'Please try again.';
        alert(`Unable to update picture. ${message}`);
      })
      .finally(() => {
        this.isSavingPicture = false;
      });
  }

  toggleEmailEdit(): void {
    this.isEmailDisabled = !this.isEmailDisabled;
  }

  toggleUsernameEdit(): void {
    this.isUsernameDisabled = !this.isUsernameDisabled;
  }

  showModal(): void {
    if (this.dataUser?.profilePicture) {
      this.isVisible = true;
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  private persistUserData(): void {
    if (!this.dataUser) {
      return;
    }

    const safeUserData = {
      ...this.dataUser,
      rooms: [],
    };

    try {
      localStorage.setItem('data', JSON.stringify(safeUserData));
    } catch (error) {
      console.warn('Unable to store user data in localStorage after picture update.', error);
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxSize = 512;
          let {width, height} = image;

          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        image.onerror = () => reject(new Error('Unable to load image'));
        image.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });
  }
}
