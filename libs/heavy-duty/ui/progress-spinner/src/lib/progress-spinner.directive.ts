import {
  Directive,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
} from '@angular/core';

@Directive({ selector: '[hdProgressSpinner]' })
export class ProgressSpinnerDirective {
  constructor(
    private readonly renderer2: Renderer2,
    private readonly elementRef: ElementRef
  ) {
    this.renderer2.addClass(this.elementRef.nativeElement, 'rounded-full');
    this.renderer2.addClass(this.elementRef.nativeElement, 'animate-spin');
    this.renderer2.setStyle(
      this.elementRef.nativeElement,
      'border-top-color',
      'transparent',
      RendererStyleFlags2.Important
    );
  }
}
