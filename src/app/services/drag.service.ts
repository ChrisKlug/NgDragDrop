import { Subject, Observable, Subscription, BehaviorSubject } from "rxjs";
import { filter, map } from "rxjs/operators";

export class DragService {
    private dropZones: { [index: string]: IDropZone[] } = {};

    beginDrag(drag: Observable<ClientRect>, element: HTMLElement, name = "default"): IDragContext {
        return new DragContext(drag, element, this.dropZones[name]);
    }

    registerDropZone(element: HTMLElement, onEnter: () => void, onDrop: (data: any, element: HTMLElement) => boolean, onLeave: () => void, name = "default"): Subscription {
        if (!this.dropZones[name]) this.dropZones[name] = [];

        let registration: IDropZone = {
            element: element,
            onEnter: onEnter,
            onDrop: onDrop,
            onLeave: onLeave
        };
        this.dropZones[name].push(registration);

        return new Subscription(() => this.dropZones[name].splice(this.dropZones[name].indexOf(registration), 1));
    }
}

export interface IDragContext {
    drop(data:any): boolean;
}

class DragContext implements IDragContext {
    private dragSubscription: Subscription;
    private currentDropZone: IDropZone;

    constructor(drag: Observable<ClientRect>, private element: HTMLElement, private dropZones: IDropZone[]) {
        this.dragSubscription = drag.subscribe(x => this.onDrag(x));
    }

    private onDrag(rect: ClientRect) {
        let dropZone = this.dropZones.find(dropZone => this.rectsIntersect(rect, dropZone.element.getBoundingClientRect()));

        if (this.currentDropZone && dropZone != this.currentDropZone) {
            this.currentDropZone.onLeave();
            delete this.currentDropZone;
        }

        if (!dropZone || this.currentDropZone) return;

        this.currentDropZone = dropZone;
        dropZone.onEnter();
    }

    drop(data:any): boolean {
        this.dragSubscription.unsubscribe();
        delete this.dragSubscription;

        return (this.currentDropZone) ? this.currentDropZone.onDrop(data, this.element) : false;
    }

    private rectsIntersect(rect1: ClientRect, rect2: ClientRect) {
        return !(rect1.left > rect2.right ||
            rect1.right < rect2.left ||
            rect1.top > rect2.bottom ||
            rect1.bottom < rect2.top);
    }
}

interface IDropZone {
    element: HTMLElement;
    onEnter: () => void;
    onDrop: (data: any, element: HTMLElement) => boolean;
    onLeave: () => void;
    subscription?: Subscription
}



// beginDrag(context: DragContext, name = "default") {
//     if (this.dropZones[name]) {
//         this.dropZones[name].forEach(x => x.subscription = context.registerDropZone(x.element, x.onEnter, x.onDrop, x.onLeave));
//         let subscription = context.onEnd.subscribe(x => {
//             this.dropZones[name].forEach(x => {
//                 x.subscription.unsubscribe();
//                 delete x.subscription;
//             });
//             subscription.unsubscribe();
//         });
//     }
// }

// registerDropZone(element: HTMLElement, onEnter: () => void, onDrop: (element: HTMLElement) => boolean, onLeave: () => void, name = "default"): Subscription {
//     if (!this.dropZones[name]) this.dropZones[name] = [];

//     let registration = {
//         element: element,
//         onEnter: onEnter,
//         onDrop: onDrop,
//         onLeave: onLeave
//     };
//     this.dropZones[name].push(registration);

//     return new Subscription(() => this.dropZones[name].splice(this.dropZones[name].indexOf(registration), 1));
// }

// export class DragContext {
//     private dropSubject = new Subject<{ dragRect: Rect, element: HTMLElement, handled: boolean }>();
//     private dragSubject: BehaviorSubject<{ prev: Rect, current: Rect }>;

//     constructor(private dragBox: Rect, private draggedElement: HTMLElement) {
//         this.dragSubject = new BehaviorSubject<{ prev: Rect, current: Rect }>({ prev: null, current: dragBox });
//     }

//     drag(dragBox: Rect) {
//         this.dragSubject.next({ prev: this.dragBox, current: dragBox });
//         this.dragBox = dragBox;
//     }
//     drop() {
//         let dropCtx = { dragRect: this.dragBox, element: this.draggedElement, handled: false };
//         this.dropSubject.next(dropCtx);
//         this.dragSubject.complete();
//         this.dragSubject.complete();
//         return dropCtx.handled;
//     }

//     registerDropZone(element: HTMLElement, onEnter: () => void, onDrop: (element: HTMLElement) => boolean, onLeave: () => void): Subscription {
//         let observable = this.dragSubject.pipe(map(x => {
//             let elementRect = this.getElementRect(element);
//             return {
//                 wasOver: x.prev && x.prev.intersects(elementRect),
//                 isOver: x.current.intersects(elementRect),
//                 dragRect: x.current
//             }
//         }));

//         let onEnterSubscription = observable.pipe(filter(x => !x.wasOver && x.isOver)).subscribe(x => onEnter());
//         let onLeaveSubscription = observable.pipe(filter(x => x.wasOver && !x.isOver)).subscribe(x => onLeave());

//         let dropSubscription = this.dropSubject.pipe(filter(x => {
//             let elementRect = this.getElementRect(element);
//             return x.dragRect.intersects(elementRect);
//         })).subscribe(x => {
//             let ret = onDrop(x.element);
//             if (ret) x.handled = true;
//         });

//         return new Subscription(() => {
//             onEnterSubscription.unsubscribe();
//             onLeaveSubscription.unsubscribe();
//             dropSubscription.unsubscribe();
//         })
//     }

//     private getElementRect(element: HTMLElement): Rect {
//         let elementRect = element.getBoundingClientRect()
//         return new Rect(elementRect.top, elementRect.left, elementRect.width, elementRect.height);
//     }

//     get onEnd() {
//         return this.dropSubject.asObservable();
//     }
// }