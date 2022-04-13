import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface CustomNotificationData {
  title: string;
  message: string;
  type: 'error' | 'success' | 'warning';
}

@Component({
  selector: 'bd-construction-notification',
  template: `
    <div class="container flex ">
      <div class="flex flex-col items-center relative left-5">
        <div
          class="w-5 relative bd-top-2 border-2 border-gray-600 h-5 rounded-2xl"
        >
          <div
            class="w-full h-full relative animate-pulse rounded-2xl"
            [ngClass]="getClassesByType(data.type)"
          ></div>
        </div>
        <div class="w-3 bg-gray-600 h-32"></div>
      </div>

      <div class="w-64  h-24 bd-bg-image-8 relative top-7 z-10 p-3 pt-5">
        <p class="m-0 text-xl">{{ data.title }}</p>
        <p class="m-0 text-sm">{{ data.message }}</p>
      </div>

      <div class="flex flex-col items-center relative right-5">
        <div
          class="w-5 relative bd-top-2 border-2 border-gray-600 h-5 rounded-2xl"
        >
          <div
            class="w-full h-full relative animate-pulse rounded-2xl"
            [ngClass]="getClassesByType(data.type)"
          ></div>
        </div>
        <div class="w-3 bg-gray-600 h-32"></div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConstructionNotificationComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: CustomNotificationData
  ) {}

  getClassesByType(type: string) {
    switch (type) {
      case 'success':
        return ['bg-green-600', 'bd-box-shadow-bg-green'];
      case 'warning':
        return ['bg-yellow-600', 'bd-box-shadow-bg-yellow'];
      case 'error':
        return ['bg-red-600', 'bd-box-shadow-bg-red'];
      default:
        return ['bg-black-600'];
    }
  }
}
