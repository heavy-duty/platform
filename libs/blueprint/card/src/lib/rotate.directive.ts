import {
	Directive,
	ElementRef,
	inject,
	Input,
	OnInit,
	Renderer2,
} from '@angular/core';

@Directive({ selector: '[bpRotate]', standalone: true })
export class RotateDirective implements OnInit {
	private readonly el = inject(ElementRef);
	private readonly renderer2 = inject(Renderer2);

	@Input() set angle(value: number) {
		this.rotateElement(value);
	}

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
