import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[bdSectionHeader]',
})
export class SectionHeaderDirective implements OnInit {
  constructor(private el: ElementRef<Element>, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setAttribute(
      this.el.nativeElement,
      'class',
      [
        ...new Set([
          'pl-4',
          'border-l-4',
          'border-solid',
          'border-primary',
          ...this.el.nativeElement.classList.toString().split(' '),
        ]),
      ].join(' ')
    );

    if (!this.titleElement) {
      console.error(`There's no h2 in the page header.`);
    } else {
      this.renderer.setAttribute(
        this.titleElement,
        'class',
        [
          ...new Set([
            'text-lg',
            'flex',
            'items-center',
            'm-0',
            ...this.titleElement.classList.toString().split(' '),
          ]),
        ].join(' ')
      );
    }

    if (this.subtitleElement) {
      this.renderer.setAttribute(
        this.subtitleElement,
        'class',
        [
          ...new Set([
            'text-xs',
            'opacity-50',
            'm-0',
            ...this.subtitleElement.classList.toString().split(' '),
          ]),
        ].join(' ')
      );
    }
  }

  private get titleElement() {
    return Array.from(this.el.nativeElement.getElementsByTagName('h2')).reduce(
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
