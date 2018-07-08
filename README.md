# NgDragDrop
Proof of Concept around building a generic drag and drop feature for Angular. Very far from complete, but still fun to have a look at. Might become something in the future...

## Making an element draggable
Make an element draggable by adding a `draggable` attribute to it.
```html
<div draggable>
    My draggable element
</div>
```
As it is dropped, the receiver will get the element passed to it.

If you want to pass data to the receiver instead of just the element, bind the data to the attribute
```html
<div [draggable]="{ message:'Hello world!' }">
    My draggable element with data
</div>
```

## Creating a "drop zone"
Just add a `dropZone` attribute to the target element.
```html
<div dropZone></div>
```

## Future
The current demo only moves the dragged element to the drop zone. In the future it would be interesting to make it possible to bind the drop like
```html
<div dropZone (drop)="onDrop($event)"></div>
```
Having the `$event` object contain the `handled` property to handle whether or not the component have handled the drop or not. The current, hardcoded version where the `dropZone` directive was just a quick version to test is for this POC...