import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ApplicationStore } from '@heavy-duty/bulldozer/application/data-access';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'bd-view-application',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewApplicationComponent implements OnInit {
  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._applicationStore.selectApplication(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray[2] !== 'applications') {
            return null;
          } else {
            return urlAsArray[3];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('applicationId') || null)
      )
    );
  }
}
