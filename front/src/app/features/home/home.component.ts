import { Component } from "@angular/core";
import {Router, RouterLink} from "@angular/router";
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';


@Component({
  selector: "app-home",
  imports: [NzButtonModule, RouterLink],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(private router: Router) {}
  size: NzButtonSize = 'large';

  NavigateLogin() {
    this.router.navigate(["login"]);
  }

  NavigateSignup() {
    this.router.navigate(["signup"]);
  }
  get isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

}
