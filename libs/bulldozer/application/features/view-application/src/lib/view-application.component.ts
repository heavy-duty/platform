import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationStore } from '@heavy-duty/bulldozer/application/data-access';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'bd-view-application',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApplicationComponent implements OnInit {
  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._applicationStore.selectApplication(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('applicationId')),
        map((paramMap) => paramMap.get('applicationId') as string)
      )
    );
  }
}
