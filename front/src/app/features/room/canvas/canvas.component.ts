import {Component, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzColorPickerComponent} from 'ng-zorro-antd/color-picker';
import {FormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import RoomService from '../../../core/service/RoomService';
import {ActivatedRoute} from '@angular/router';
import * as fabric from 'fabric';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';

@Component({
  selector: 'app-canvas',
  imports: [
    NzIconModule,
    NzColorPickerComponent,
    FormsModule,
    NzButtonModule,
    NzDrawerModule
  ],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})

export class CanvasComponent implements OnInit, OnDestroy {
  private intervalId: any;
  private copyFeedbackTimeoutId: any;
  private readonly REFRESH_INTERVAL = 1000; // Refresh every 1 seconds
  private readonly MIN_ZOOM = 0.2;
  private readonly MAX_ZOOM = 4;
  private readonly ZOOM_STEP = 0.15;
  private readonly resizeHandler = () => this.setCanvasSize();
  private readonly keyDownHandler = (event: KeyboardEvent) => this.handleKeyDown(event);
  private readonly keyUpHandler = (event: KeyboardEvent) => this.handleKeyUp(event);
  roomId!: number;
  room: any;
  roomName: string = '';
  roomCode: string = '';
  canvas: any;
  drawingSelected: boolean = false;
  oldX: number = 0;
  oldY: number = 0;
  strokeColor: string = 'black';
  strokeWidth: number = 1;
  textSelected: boolean = false;
  roomService: RoomService = new RoomService();
  private lastFetchedData: string = ''; // Stores the last fetched canvas data
  private pendingSaveData: string | null = null;
  private isUserInteracting: boolean = false; // Tracks user interaction
  private saveSubject = new Subject<void>();
  private isSpacePressed = false;
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;
  private wasDrawingModeBeforePan = false;
  visible = false;
  zoomPercent = 100;
  copyCodeLabel = 'Copy code';

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  async copyRoomCode(): Promise<void> {
    if (!this.roomCode) {
      return;
    }

    const copied = await this.writeToClipboard(this.roomCode);
    this.copyCodeLabel = copied ? 'Copied!' : 'Copy failed';
    clearTimeout(this.copyFeedbackTimeoutId);
    this.copyFeedbackTimeoutId = setTimeout(() => {
      this.copyCodeLabel = 'Copy code';
    }, 2000);
  }

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
    this.canvas = new fabric.Canvas('canvas');
    this.syncZoomPercent();

    this.saveSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.saveStage();
    });
  }

  ngOnDestroy(): void {
    this.saveSubject.complete();
    clearInterval(this.intervalId);
    clearTimeout(this.copyFeedbackTimeoutId);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
  }

  ngAfterViewInit(): void {
    // Set canvas to fullscreen
    this.setCanvasSize();
    // Optionally handle window resize
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    this.setupCanvasListeners();
    this.setupZoomListeners();
    this.setupPanListeners();

    this.roomService.getRoomById(this.roomId).then((response) => {
      this.room = response.data;
      this.roomName = this.room.title;
      this.roomCode = this.room.codeRoom;

      this.restoreStage(this.room.design);
    });

    this.intervalId = setInterval(() => {
      this.roomService.getRoomById(this.roomId).then((response) => {
        this.room = response.data;
        if (this.isUserInteracting) {
          return;

        }
        this.restoreStage(this.room.design);
      });
    }, this.REFRESH_INTERVAL);
  }

  private setCanvasSize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set canvas size to full screen
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    this.canvas.renderAll(); // Re-render canvas after resizing
  }

  clearCanvas() {
    this.canvas.clear();
  }

  zoomIn(): void {
    const nextZoom = this.canvas.getZoom() + this.ZOOM_STEP;
    this.applyZoom(nextZoom);
  }

  zoomOut(): void {
    const nextZoom = this.canvas.getZoom() - this.ZOOM_STEP;
    this.applyZoom(nextZoom);
  }

  resetZoom(): void {
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.canvas.requestRenderAll();
    this.syncZoomPercent();
  }

  addText() {
    const text = new fabric.Textbox('Enter text here...', {
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      fontSize: 40,
      fill: this.strokeColor,
      editable: true,
      selectable: true

    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    this.canvas.renderAll();

    // Make text movable
    text.on('mousedown', () => {
      text.set({cursor: 'move'});
    });
  }

  handleColorChange() {
    console.log(this.strokeColor);
  }

  handleSelectText() {
    // Deselect other modes
    this.drawingSelected = false;
    this.canvas.isDrawingMode = this.drawingSelected;

    // Toggle text mode
    this.textSelected = !this.textSelected;

    // If text mode is activated, add text to the canvas
    if (this.textSelected) {
      this.addText();
    }
  }

  handleSelectDraw() {
    // Deselect other modes
    this.textSelected = false;
    this.drawingSelected = !this.drawingSelected;
    this.canvas.isDrawingMode = this.drawingSelected;

    if (this.drawingSelected) {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
      this.canvas.freeDrawingBrush.color = this.strokeColor; // Brush color
      this.canvas.freeDrawingBrush.width = 5; // Brush width
    }
  }

  handleSelectErase() {
    this.deleteSelectedObjects();

  }

  deleteSelectedObjects(): void {
    const activeObjects = this.canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj: fabric.Object) => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject();
    }
  }


  saveStage() {
    const savedData = JSON.stringify(this.canvas.toJSON());
    this.pendingSaveData = savedData;
    this.lastFetchedData = savedData;
    // Also save to database
    this.roomService.saveRoomState(savedData, this.roomId).catch(() => {
      this.pendingSaveData = null;
    });
  }


  restoreStage(savedData: string): void {

    if (this.isUserInteracting || !savedData) return;

    // Ignore stale server state while waiting for the latest local save to be persisted.
    if (this.pendingSaveData && savedData !== this.pendingSaveData) {
      return;
    }

    if (this.pendingSaveData && savedData === this.pendingSaveData) {
      this.pendingSaveData = null;
    }

    if (savedData !== this.lastFetchedData) {

      this.lastFetchedData = savedData;

      this.canvas.loadFromJSON(savedData, () => {
        this.canvas.requestRenderAll();

        this.canvas.forEachObject((obj: fabric.Object) => {
          obj.set('opacity', 1); // Ensure objects are fully visible
          obj.set('selectable', true); // Make sure objects are selectable (if needed)
        });
        this.canvas.requestRenderAll();
      });
    }
  }


  private setupCanvasListeners(): void {
    const events = [
      'object:modified',
      'object:added',
      'object:removed',
      'canvas:modified',
      'mouse:up',
      'mouse:down',
      'selection:created',
      'object:moved',
      'text:changed',
      'text:editing:entered',
      'text:editing:exited',
      'text:selection:changed',
      'text:changed',
      'object:rotating',
      'object:scaling',
      'object:skewing',
      'path:created'
    ];

    events.forEach(event => {
      this.canvas.on(event, () => {
        this.isUserInteracting = true;
        this.saveSubject.next();
        this.resetInteractionFlag();
      });
    });
  }

  private setupZoomListeners(): void {
    this.canvas.on('mouse:wheel', (opt: any) => {
      const event = opt.e as WheelEvent;
      const delta = event.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;

      const pointer = this.canvas.getPointer(event);
      const point = new fabric.Point(pointer.x, pointer.y);
      this.applyZoom(zoom, point);

      event.preventDefault();
      event.stopPropagation();
    });
  }

  private setupPanListeners(): void {
    this.canvas.on('mouse:down', (opt: any) => {
      if (!this.isSpacePressed) {
        return;
      }

      const event = opt.e as MouseEvent;
      this.isPanning = true;
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
      this.canvas.defaultCursor = 'grabbing';
    });

    this.canvas.on('mouse:move', (opt: any) => {
      if (!this.isPanning) {
        return;
      }

      const event = opt.e as MouseEvent;
      const vpt = this.canvas.viewportTransform;
      if (!vpt) {
        return;
      }

      vpt[4] += event.clientX - this.lastPanX;
      vpt[5] += event.clientY - this.lastPanY;
      this.canvas.requestRenderAll();
      this.lastPanX = event.clientX;
      this.lastPanY = event.clientY;
    });

    this.canvas.on('mouse:up', () => {
      this.isPanning = false;
      this.canvas.defaultCursor = this.isSpacePressed ? 'grab' : 'default';
    });
  }

  private applyZoom(zoomValue: number, point?: fabric.Point): void {
    const zoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, zoomValue));
    const zoomPoint = point ?? new fabric.Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2);

    this.canvas.zoomToPoint(zoomPoint, zoom);
    this.canvas.requestRenderAll();
    this.syncZoomPercent();
  }

  private syncZoomPercent(): void {
    this.zoomPercent = Math.round(this.canvas.getZoom() * 100);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.code !== 'Space') {
      return;
    }

    if (this.isInputFocused(event.target as HTMLElement | null) || this.isTextEditing()) {
      return;
    }

    if (!this.isSpacePressed) {
      this.isSpacePressed = true;
      this.enablePanMode();
    }
    event.preventDefault();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Space') {
      return;
    }

    if (this.isSpacePressed) {
      this.isSpacePressed = false;
      this.disablePanMode();
    }
  }

  private enablePanMode(): void {
    this.wasDrawingModeBeforePan = this.canvas.isDrawingMode;
    this.isPanning = false;
    this.canvas.isDrawingMode = false;
    this.canvas.skipTargetFind = true;
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'grab';
    this.canvas.hoverCursor = 'grab';
    this.canvas.moveCursor = 'grabbing';
  }

  private disablePanMode(): void {
    this.isPanning = false;
    this.canvas.skipTargetFind = false;
    this.canvas.selection = true;
    this.canvas.defaultCursor = 'default';
    this.canvas.hoverCursor = 'move';
    this.canvas.moveCursor = 'move';
    this.canvas.isDrawingMode = this.wasDrawingModeBeforePan && this.drawingSelected;
  }

  private isInputFocused(target: HTMLElement | null): boolean {
    if (!target) {
      return false;
    }
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
  }

  private isTextEditing(): boolean {
    const activeObject = this.canvas.getActiveObject() as fabric.Object & { isEditing?: boolean } | null;
    return !!activeObject?.isEditing;
  }

  private resetInteractionFlag(): void {
    setTimeout(() => {
      this.isUserInteracting = false;
    }, 1000); // Adjust delay as needed
  }

  private async writeToClipboard(value: string): Promise<boolean> {
    if (!value) {
      return false;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fallback for restricted clipboard contexts.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }


}
