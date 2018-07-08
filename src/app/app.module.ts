import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DraggableDirective } from './directives/draggable.directive';
import { DragService } from './services/drag.service';
import { DropZoneDirective } from './directives/drop-zone.directive';

@NgModule({
  declarations: [
    AppComponent,
    DraggableDirective,
    DropZoneDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    DragService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
