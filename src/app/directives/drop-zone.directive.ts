import { Directive, OnInit, OnDestroy, ElementRef, Renderer2 } from "@angular/core";
import { DragService } from "../services/drag.service";
import { Subscription } from "rxjs";

@Directive({
    selector: "[dropZone]"
})
export class DropZoneDirective implements OnInit, OnDestroy {
    private subscription: Subscription;

    constructor(private el: ElementRef, private renderer: Renderer2, private dragService: DragService) {}

    ngOnInit() {
        this.subscription = this.dragService.registerDropZone(this.el.nativeElement, () => this.onDragEnter(), (data, element) => this.onDragDrop(data, element), () => this.onDragLeave());
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onDragEnter() {
        this.renderer.addClass(this.el.nativeElement, "drag-over");
    }
    onDragDrop(data: any, element: HTMLElement) {
        console.log("on drop", data);
        //element.remove();
        (<HTMLElement>this.el.nativeElement).appendChild(element);
        this.renderer.removeClass(this.el.nativeElement, "drag-over");
        return true;
    }
    onDragLeave() {
        this.renderer.removeClass(this.el.nativeElement, "drag-over");
    }
}