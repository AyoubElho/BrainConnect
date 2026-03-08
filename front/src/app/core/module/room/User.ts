import {Room} from './Room';

export class User {
  id: number; // Corresponds to the `Long id` in Java
  username: string; // Username of the user
  email: string; // Email address of the user
  password: string; // User's password
  profilePicture: string | undefined; // Profile picture (nullable)
  rooms: Room[]; // List of rooms associated with the user

  constructor(
    id: number,
    username: string,
    email: string,
    password: string,
    profilePicture: string,
    rooms: Room[] = []
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.profilePicture = profilePicture;
    this.rooms = rooms;
  }
}
