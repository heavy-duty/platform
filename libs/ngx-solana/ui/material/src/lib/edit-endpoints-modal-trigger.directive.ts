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
import { HdEditEndpointsComponent } from './edit-endpoints-modal.component';

@Directive({ selector: 'button[hdEditEndpointsModalTrigger]' })
export class HdEditEndpointsModalTriggerDirective {
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
        HdEditEndpointsComponent,
        { apiEndpoint: HttpEndpoint; webSocketEndpoint: WebSocketEndpoint },
        { apiEndpoint: HttpEndpoint; webSocketEndpoint: WebSocketEndpoint }
      >(HdEditEndpointsComponent, {
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
