import { Component, OnInit } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  Router,
  NavigationEnd,
} from '@angular/router';

@Component({
  imports: [NzLayoutModule,NzTypographyModule,NzIconModule],
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
})
export class AppFooter implements OnInit{
  currentYear = new Date().getFullYear(); 
 

  //Hide the Footer on Editor Page .... Adam Kourchi

  constructor(private router: Router) {
  }

  display = true; // To toggle Footer visibility

  ngOnInit(): void {
    // Listen to router events to track current page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide navbar on specific routes
        this.display = !event.urlAfterRedirects.startsWith('/editor');
        console.log(this.display);
        
      }
    });
  }



}



