import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {
  RouterLink,
  Router,
  NavigationEnd,
} from '@angular/router';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {User} from '../../../core/module/room/User';

@Component({
  selector: 'app-nav-bar',
  imports: [NgClass, RouterLink, NzAvatarComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit, OnDestroy {

  userData: User | null = null;
  private readonly refreshUserDataHandler = () => this.loadUserData();

  constructor(private router: Router) {
  }

  display = true; // To toggle navbar visibility

  ngOnInit(): void {
    // Listen to router events to track current page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide navbar on specific routes
        this.display = !event.urlAfterRedirects.startsWith('/editor');
        this.loadUserData();
      }
    });
    this.loadUserData();
    window.addEventListener('user-data-updated', this.refreshUserDataHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('user-data-updated', this.refreshUserDataHandler);
  }

  private loadUserData(): void {
    const storedData = localStorage.getItem('data');
    if (!storedData) {
      this.userData = null;
      return;
    }

    try {
      this.userData = JSON.parse(storedData) as User;
    } catch (error) {
      this.userData = null;
    }
  }

  isOpenHumb = false;

  openHumburger() {
    this.isOpenHumb = !this.isOpenHumb;
  }


  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  // Log out the user
  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('data');
    window.dispatchEvent(new Event('user-data-updated'));
    this.router.navigate(['/login']);
  }


}
