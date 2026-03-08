import {Routes} from "@angular/router";
import {HomeComponent} from "./features/home/home.component";
import {LoginComponent} from "./features/auth/login/login.component";
import {SignupComponent} from "./features/auth/signup/signup.component";
import {CreateComponent} from "./features/room/create/create.component";
import {ProfileComponent} from "./features/auth/profile/profile.component";
import {EditorComponent} from './features/room/editor/editor.component';
import {AuthGuard} from './core/guards/AuthGuard';
import {MyRoomsComponent} from './features/room/my-rooms/my-rooms.component';

export const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "login", component: LoginComponent},
  {path: "signup", component: SignupComponent},
  {path: "create", component: CreateComponent, canActivate: [AuthGuard]},
  {path: "my-rooms", component: MyRoomsComponent, canActivate: [AuthGuard]},
  {path: "profile", component: ProfileComponent, canActivate: [AuthGuard]},
  { path: "editor/:roomId", component: EditorComponent, canActivate: [AuthGuard] },
  {path: "**", redirectTo: "/"},

];
