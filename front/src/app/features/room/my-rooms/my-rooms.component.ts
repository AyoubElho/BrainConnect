import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule} from 'ng-zorro-antd/modal';
import RoomService from '../../../core/service/RoomService';
import {User} from '../../../core/module/room/User';
import {Room} from '../../../core/module/room/Room';
import * as fabric from 'fabric';

@Component({
  selector: 'app-my-rooms',
  imports: [ReactiveFormsModule, NzButtonModule, NzModalModule],
  templateUrl: './my-rooms.component.html',
  styleUrl: './my-rooms.component.css'
})
export class MyRoomsComponent implements OnInit {
  dataUser: User | null = null;
  roomService = new RoomService();
  roomPreviewById: Record<number, string> = {};
  readonly defaultRoomPreview = '/assets/editor/EditorBackground.png';
  deletingRoomCode: string | null = null;
  isCreateRoomVisible = false;
  createRoomError = '';
  roomForm!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      this.router.navigate(['/login']);
      return;
    }

    const storedData = localStorage.getItem('data');
    this.dataUser = storedData ? JSON.parse(storedData) : null;

    if (!this.dataUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.roomForm = this.fb.group({
      title: ['', [Validators.required]],
    });

    this.loadUserRooms();
  }

  private loadUserRooms(): void {
    if (!this.dataUser) {
      return;
    }

    this.roomService.getUserRooms(this.dataUser.id).then((response) => {
      if (!this.dataUser) {
        return;
      }
      this.dataUser.rooms = response.data;
      this.generateRoomPreviews(this.dataUser.rooms);
    });
  }

  private async generateRoomPreviews(rooms: Room[]): Promise<void> {
    this.roomPreviewById = {};

    const previewEntries = await Promise.all(
      rooms.map(async (room) => {
        const preview = await this.createPreviewFromDesign(room.design);
        return [room.id, preview] as const;
      })
    );

    previewEntries.forEach(([roomId, preview]) => {
      if (preview) {
        this.roomPreviewById[roomId] = preview;
      }
    });
  }

  private async createPreviewFromDesign(design: string | null | undefined): Promise<string | null> {
    if (!design) {
      return null;
    }

    const parsedDesign = this.parseDesignPayload(design);
    if (!parsedDesign) {
      return null;
    }

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 920;
    canvasElement.height = 420;
    const previewCanvas = new fabric.StaticCanvas(canvasElement, {
      backgroundColor: '#ffffff',
      enableRetinaScaling: false,
    });

    try {
      await previewCanvas.loadFromJSON(parsedDesign);
      previewCanvas.backgroundImage = undefined;
      previewCanvas.backgroundColor = '#ffffff';
      this.fitPreviewToContent(previewCanvas);
      previewCanvas.renderAll();
      return previewCanvas.toDataURL({
        format: 'png',
        quality: 0.95,
        multiplier: 1,
      });
    } catch {
      return null;
    } finally {
      previewCanvas.dispose();
    }
  }

  private parseDesignPayload(design: string): unknown | null {
    try {
      const firstParse = JSON.parse(design);
      if (typeof firstParse === 'string') {
        return JSON.parse(firstParse);
      }
      return firstParse;
    } catch {
      return null;
    }
  }

  private fitPreviewToContent(canvas: fabric.StaticCanvas): void {
    const objects = canvas.getObjects();
    if (!objects.length) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      return;
    }

    const bounds = objects.reduce(
      (acc, obj) => {
        const rect = obj.getBoundingRect();
        return {
          minX: Math.min(acc.minX, rect.left),
          minY: Math.min(acc.minY, rect.top),
          maxX: Math.max(acc.maxX, rect.left + rect.width),
          maxY: Math.max(acc.maxY, rect.top + rect.height),
        };
      },
      {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      }
    );

    const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const padding = 28;
    const zoomX = (canvasWidth - padding * 2) / contentWidth;
    const zoomY = (canvasHeight - padding * 2) / contentHeight;
    const zoom = Math.max(0.05, Math.min(zoomX, zoomY));
    const translateX = (canvasWidth - contentWidth * zoom) / 2 - bounds.minX * zoom;
    const translateY = (canvasHeight - contentHeight * zoom) / 2 - bounds.minY * zoom;

    canvas.setViewportTransform([zoom, 0, 0, zoom, translateX, translateY]);
  }

  onEdit(id: number): void {
    this.router.navigate(['/editor', id]);
  }

  onDelete(code: string): void {
    if (!this.dataUser || !code || this.deletingRoomCode) {
      return;
    }

    const confirmed = window.confirm('Delete this room permanently?');
    if (!confirmed) {
      return;
    }

    this.deletingRoomCode = code;
    this.roomService.deleteRoomByCode(code)
      .then(() => {
        this.loadUserRooms();
      })
      .catch(() => {
        alert('Unable to delete room. Please try again.');
      })
      .finally(() => {
        this.deletingRoomCode = null;
      });
  }

  showCreateRoomModal(): void {
    this.isCreateRoomVisible = true;
    this.createRoomError = '';
    this.roomForm.reset();
  }

  handleCreateRoomCancel(): void {
    this.isCreateRoomVisible = false;
    this.createRoomError = '';
  }

  submitCreateRoom(): void {
    if (!this.dataUser) {
      return;
    }

    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.roomService.saveRoom(this.roomForm.value as Room, this.dataUser)
      .then(() => {
        this.isCreateRoomVisible = false;
        this.roomForm.reset();
        this.loadUserRooms();
      })
      .catch(() => {
        this.createRoomError = 'Unable to create room. Please try again.';
      });
  }
}
