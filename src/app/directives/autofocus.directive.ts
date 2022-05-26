import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * Link de referência desta impl:
 * https://stackoverflow.com/questions/41873893/angular2-autofocus-input-element
 */
@Directive({
  selector: '[autofocus]'
})
export class AutofocusDirective implements OnInit {
  private _autofocus = true;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    if (this._autofocus || typeof this._autofocus === "undefined")
      this.el.nativeElement.focus();
  }

  @Input() set autofocus(condition: boolean) {
    this._autofocus = condition != false;
  }
}
