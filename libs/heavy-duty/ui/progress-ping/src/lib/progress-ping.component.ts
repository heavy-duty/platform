import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'hd-progress-ping',
  template: `
    <span
      class="rounded-full h-full w-full bg-white opacity-50 animate-ping"
    ></span>
  `,
})
export class ProgressPingComponent {
  @HostBinding('class') class =
    'flex justify-center items-center relative rounded-full';
}
