import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';


@Directive({
  standalone: true,
  selector: '[appBooleanColor]'
})
export class BooleanColorDirective implements OnChanges {
  @Input('appBooleanColor') value: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.el.nativeElement.style.color = this.value ? 'green' : 'red';
  }
}
