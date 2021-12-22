import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceStore } from '@heavy-duty/bulldozer/application/data-access';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'bd-view-workspace',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewWorkspaceComponent implements OnInit {
  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._workspaceStore.selectWorkspace(
      this._route.paramMap.pipe(
        filter((paramMap) => paramMap.has('workspaceId')),
        map((paramMap) => paramMap.get('workspaceId') as string)
      )
    );
  }
}
