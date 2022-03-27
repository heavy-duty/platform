import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';
import { HdBroadcasterStore } from './broadcaster.store';

@NgModule({
  imports: [HttpClientModule],
})
export class HdBroadcasterModule {
  static forRoot(): ModuleWithProviders<HdBroadcasterModule> {
    return {
      ngModule: HdBroadcasterModule,
      providers: [HdBroadcasterSocketStore, HdBroadcasterStore],
    };
  }
}
