import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpEndpoint } from '@heavy-duty/ngx-solana';
import { WebSocketEndpoint } from '@heavy-duty/ngx-websocket';
import { NgxEditEndpointsComponent } from './edit-endpoints-modal.component';

@Directive({ selector: 'button[ngxEditEndpointsModalTrigger]' })
export class NgxEditEndpointsModalTriggerDirective {
  @Input() apiEndpoint: HttpEndpoint | null = null;
  @Input() webSocketEndpoint: WebSocketEndpoint | null = null;
  @Output() editEndpoints = new EventEmitter<{
    apiEndpoint: HttpEndpoint;
    webSocketEndpoint: WebSocketEndpoint;
  }>();
  @HostListener('click') onClick(): void {
    if (this.apiEndpoint === null || this.webSocketEndpoint === null) {
      throw new Error('Endpoints missing');
    }

    this._matDialog
      .open<
        NgxEditEndpointsComponent,
        { apiEndpoint: HttpEndpoint; webSocketEndpoint: WebSocketEndpoint },
        { apiEndpoint: HttpEndpoint; webSocketEndpoint: WebSocketEndpoint }
      >(NgxEditEndpointsComponent, {
        panelClass: 'edit-modal',
        maxWidth: '380px',
        maxHeight: '90vh',
        data: {
          apiEndpoint: this.apiEndpoint,
          webSocketEndpoint: this.webSocketEndpoint,
        },
      })
      .afterClosed()
      .subscribe(
        (endpoints) => endpoints && this.editEndpoints.emit(endpoints)
      );
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
