import { ElementRef, OnInit, OnDestroy, HostListener, Renderer2, Directive, Input } from "@angular/core";
import { Subscription, fromEvent, BehaviorSubject } from "rxjs";
import { scan } from 'rxjs/operators';
import { DragService, IDragContext } from "../services/drag.service";

@Directive({
    selector: '[draggable]'
})
export class DraggableDirective {
    private draggableElement: DraggableElement;
    private dragContext: IDragContext;

    constructor(private el: ElementRef, private renderer: Renderer2, private dragService: DragService) {}

    private beginDrag() {
        this.draggableElement = new DraggableElement(this.element, this.data, this.renderer);
        this.dragContext = this.dragService.beginDrag(this.draggableElement.drag, this.element);
    }
    private endDrag() {
        if (this.dragContext.drop(this.data)) {
            this.draggableElement.dragComplete();
        } else {
            this.draggableElement.cancelDrag();
        }
        delete this.draggableElement;
    }

    private get element() {
        return <HTMLLIElement>this.el.nativeElement;
    }

    @HostListener("mousedown", ['$event']) onMouseDown(ev: MouseEvent) {
        if (ev.button != 0) return;

        this.beginDrag();

        return false;
    }
    @HostListener("document:mouseup", ['$event']) onMouseUp(ev: MouseEvent) {
        if (!this.draggableElement) return;
        this.endDrag();
    }
    @Input("draggable") data; 
}

class DraggableElement {
    private dragSubject: BehaviorSubject<ClientRect>;
    private moveSubscription: Subscription;
    private placeHolder = document.createElement("div");
    private originalStyle: { position: string, left: string, top: string, width: string, height: string, clientRect: ClientRect };
    private currentPosition = { left: 0, top: 0 }

    constructor(private element: HTMLElement, private data: any, private renderer: Renderer2) {
        this.originalStyle = {
            position: element.style.position,
            left: element.style.left,
            top: element.style.top,
            width: element.style.width,
            height: element.style.height,
            clientRect: element.getBoundingClientRect()
        };
        
        this.addPlaceholder();
        this.moveElementToBody();

        this.dragSubject = new BehaviorSubject<ClientRect>(this.element.getBoundingClientRect());

        this.moveSubscription = fromEvent<MouseEvent>(document, "mousemove")
            .pipe(scan<MouseEvent, IMouseMovement>((prev, current) => {
                return {
                    absoluteX: current.x,
                    absoluteY: current.y,
                    moveX: prev ? current.x - prev.absoluteX : 0,
                    moveY: prev ? current.y - prev.absoluteY : 0,
                };
            }, null))
            .subscribe(x => this.onDrag(x));
    }

    cancelDrag() {
        this.placeHolder.parentElement.insertBefore(this.element, this.placeHolder);
        this.dragComplete();
    }
    dragComplete() {
        this.placeHolder.remove();
        this.element.style.position = this.originalStyle.position;
        this.element.style.top = this.originalStyle.top;
        this.element.style.left = this.originalStyle.left;
        this.element.style.width = this.originalStyle.width;
        this.element.style.height = this.originalStyle.height;
        this.renderer.removeClass(this.element, "dragging");
        this.moveSubscription.unsubscribe();
    }

    private addPlaceholder() {
        this.placeHolder.style.display = "inline-block";
        this.placeHolder.style.width = (this.originalStyle.clientRect.width) + "px";
        this.placeHolder.style.height = (this.originalStyle.clientRect.height) + "px";
        this.element.parentElement.insertBefore(this.placeHolder, this.element);
    }
    private moveElementToBody() {
        this.element.style.width = (this.element.offsetWidth + 1) + "px";
        this.element.style.height = this.element.offsetHeight + "px";
        this.element.style.position = "absolute";
        this.renderer.addClass(this.element, "dragging");
        document.body.appendChild(this.element);
        this.moveTo(this.originalStyle.clientRect.left, this.originalStyle.clientRect.top + 1);
    }
    private onDrag(mouseMovement: IMouseMovement) {
        this.moveTo(this.currentPosition.left + mouseMovement.moveX, this.currentPosition.top + mouseMovement.moveY);
        this.dragSubject.next(this.element.getBoundingClientRect());
    }
    private moveTo(left: number, top:number) {
        this.element.style.top = top + "px";
        this.element.style.left = left + "px";
        this.currentPosition.top = top;
        this.currentPosition.left = left;
    }

    get drag() {
        return this.dragSubject.asObservable();
    }
}

interface IMouseMovement {
    absoluteX: number;
    absoluteY: number;
    moveX: number;
    moveY: number;
}

interface IPosition {
    x: number;
    y: number;
}