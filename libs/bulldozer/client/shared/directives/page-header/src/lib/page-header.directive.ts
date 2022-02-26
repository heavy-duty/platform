import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[bdPageHeader]',
})
export class PageHeaderDirective implements OnInit {
  constructor(private el: ElementRef<Element>, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setAttribute(
      this.el.nativeElement,
      'class',
      `${this.el.nativeElement.classList.toString()} pl-4 border-l-4 border-solid border-primary`
    );

    if (!this.titleElement) {
      console.error(`There's no h1 in the page header.`);
    } else {
      this.renderer.setAttribute(
        this.titleElement,
        'class',
        'text-2xl flex items-center m-0'
      );
    }

    if (this.subtitleElement) {
      this.renderer.setAttribute(
        this.subtitleElement,
        'class',
        'text-xs opacity-50 m-0'
      );
    }
  }

  private get titleElement() {
    return Array.from(this.el.nativeElement.getElementsByTagName('h1')).reduce(
      (_: HTMLElement | null, element) => element,
      null
    );
  }

  private get subtitleElement() {
    return Array.from(this.el.nativeElement.getElementsByTagName('p')).reduce(
      (_: HTMLElement | null, element) => element,
      null
    );
  }
}
