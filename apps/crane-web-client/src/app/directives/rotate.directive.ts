import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({ selector: '[craneRotate]', standalone: true })
export class RotateDirective implements OnInit {
	@Input() set angle(value: number) {
		this.rotateElement(value);
	}

	constructor(
		private readonly el: ElementRef,
		private readonly renderer2: Renderer2
	) {}

	ngOnInit() {
		this.rotateElement(Math.floor(Math.random() * 361));
	}

	private rotateElement(value: number) {
		this.renderer2.setStyle(
			this.el.nativeElement,
			'transform',
			`rotate(${value}deg)`
		);
	}
}
