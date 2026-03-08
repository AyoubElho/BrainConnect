import { Room } from '../module/room/Room';
import axios from 'axios';
import { User } from '../module/room/User';
import { environment } from '../../../environments/environment';

export default class RoomService {
  url: string = `${environment.apiBaseUrl}${environment.apiRoomsPath}`;


  public saveRoom(room: Room, user: User) {
    return axios.post(`${this.url}/save/${user.id}`, room);
  }

  public saveRoomState(stageData: any, roomId: number) {
    return axios.post(
      `${this.url}/saveRoomState/${roomId}`,
      stageData,

      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  public getUserRooms(userId: number) {
    return axios.get(`${this.url}/user/${userId}`);
  }

  public getRoomById(roomId: number) {
    return axios.get(`${this.url}/room/${roomId}`);
  }

  public getRoomByCode(roomCode: string) {
    return axios.get(`${this.url}/roomCode/${roomCode}`);
  }

  public deleteRoomByCode(roomCode: string) {
    return axios.delete(`${this.url}/${encodeURIComponent(roomCode)}`);
  }
}
