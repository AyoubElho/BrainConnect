import { Component } from '@angular/core';
import { CanvasComponent } from '../canvas';


@Component({
  selector: 'app-editor',
  imports: [CanvasComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {
  constructor () { 
  }
  editor = true; 
}
