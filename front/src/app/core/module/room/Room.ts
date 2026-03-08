export class Room {
  id: number; // The ID will be a number in TypeScript (similar to Long in Java)
  codeRoom: string; // Default to an empty string, it will be assigned from the backend or generated
  design: string; // Design can be a string or null if not provided
  title : string
  user_id:string

  constructor(id: number, codeRoom: string, design: string,title: string,user_id:string) {
    this.id = id;
    this.codeRoom = codeRoom;
    this.design = design;
    this.title = title;
    this.user_id = user_id
  }
}

