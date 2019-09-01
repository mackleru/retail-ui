enum MouseDragEventType {
  MouseDragStart = 'mousedragstart',
  MouseDragMove = 'mousedragmove',
  MouseDragEnd = 'mousedragend',
}

interface MouseDragEvent extends MouseEvent { }

export default class MouseDrag {
  // Радиус окружности, который необходимо преодолеть мышью, чтобы вызвалось событие `MouseDragStart`
  public static readonly RADIUS: number = 5; // px

  public static listen = (elem: HTMLElement) => new MouseDrag(elem);

  private mouseDragStartEvent?: MouseDragEvent;
  private clicked = false;
  private dragging = false;
  private x1?: number;

  private y1?: number;
  private readonly elem: HTMLElement;

  public constructor(elem: HTMLElement) {
    this.elem = elem;
    elem.removeEventListener('mousedown', this.handleMouseDown);
    elem.removeEventListener('mousemove', this.handleMouseMove);
    elem.removeEventListener('mouseup', this.handleMouseUp);
    elem.addEventListener('mousedown', this.handleMouseDown);
    elem.addEventListener('mousemove', this.handleMouseMove);
    elem.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (event: MouseEvent) => {
    if (!this.clicked) {
      this.clicked = true;
      this.x1 = event.pageX;
      this.y1 = event.pageY;
      this.mouseDragStartEvent = this.createEvent(MouseDragEventType.MouseDragStart, event);
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (this.dragging) {
      return this.dispatchEvent(this.createEvent(MouseDragEventType.MouseDragMove, event), event);
    }
    if (this.clicked && this.getLength(event.pageX, event.pageY) > MouseDrag.RADIUS) {
      this.dragging = true;
      this.clicked = false;
      if (this.mouseDragStartEvent) {
        this.dispatchEvent(this.mouseDragStartEvent, event);
      }
    }
  };

  private handleMouseUp = (event: MouseEvent) => {
    this.clicked = false;
    if (this.dragging) {
      this.dragging = false;
      this.dispatchEvent(this.createEvent(MouseDragEventType.MouseDragEnd, event), event);
    }
  };

  private getLength = (x2: number, y2: number): number => {
    return this.x1 !== undefined && this.y1 !== undefined ? Math.sqrt((x2 - this.x1) ** 2 + (y2 - this.y1) ** 2) : 0;
  };

  private createEvent = (type: MouseDragEventType, event: MouseEvent): MouseDragEvent => {
    if (typeof MouseEvent === 'function') {
      return new MouseEvent(type, event);
    }
    // <IE11
    const e = document.createEvent('MouseEvent');
    e.initEvent(type, true, true);
    return e;
  };

  private dispatchEvent = (mouseDragEvent: MouseDragEvent, event: MouseEvent): void => {
    this.elem.dispatchEvent(mouseDragEvent);
    event.preventDefault();
    event.stopImmediatePropagation();
  };
}
