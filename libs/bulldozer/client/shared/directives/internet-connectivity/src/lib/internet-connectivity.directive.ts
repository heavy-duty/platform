import { Directive, HostListener } from '@angular/core';
import { InternetConnectivityStore } from '@bulldozer-client/core-data-access';

@Directive({
  selector: '[bdInternetConnectivity]',
})
export class InternetConnectivityDirective {
  constructor(
    private readonly internetConnectivity: InternetConnectivityStore
  ) {}

  @HostListener('window:offline')
  setNetworkOffline() {
    this.internetConnectivity.setOnline(false);
  }

  @HostListener('window:online')
  setNetworkOnline() {
    this.internetConnectivity.setOnline(true);
  }
}
