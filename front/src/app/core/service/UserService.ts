import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../module/room/User';
import { LoginRequest } from './LoginRequest';
import { SignupRequest } from './SignupRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}${environment.apiUserPath}`;

  saveUser(user: User) {
    return axios.post(this.apiUrl + 'save', user);
  }

  updateProfilePicture(userId: number, profilePicture: string) {
    return axios.put(this.apiUrl + `${userId}/profile-picture`, { profilePicture });
  }

  // Login and Signup
  checkUser(user: LoginRequest) {
    return axios.post(this.apiUrl + 'login', user);
  }

  save(user: SignupRequest) {
    return axios.post(this.apiUrl + 'signup', user);
  }
}
