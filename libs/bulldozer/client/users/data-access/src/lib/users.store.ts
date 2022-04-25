import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Document, User, UserFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Map, Set } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { UserApiService } from './user-api.service';

interface ViewModel {
  loading: boolean;
  filters: UserFilters | null;
  userIds: Set<string> | null;
  usersMap: Map<string, Document<User>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  userIds: null,
  usersMap: null,
};

@Injectable()
export class UsersStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly userIds$ = this.select(({ userIds }) => userIds);
  readonly usersMap$ = this.select(({ usersMap }) => usersMap);

  constructor(
    private readonly _userApiService: UserApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadUsers(this.userIds$);
  }

  readonly setUserIds = this.updater<Set<string> | null>((state, userIds) => ({
    ...state,
    userIds,
    usersMap: null,
  }));

  private readonly _loadUsers = this.effect<Set<string> | null>(
    switchMap((userIds) => {
      if (userIds === null) {
        return EMPTY;
      }

      this.patchState({ usersMap: null, loading: true });

      return this._userApiService.findByIds(userIds.toArray()).pipe(
        tapResponse(
          (users) => {
            this.patchState({
              loading: false,
              usersMap: users
                .filter((user): user is Document<User> => user !== null)
                .reduce(
                  (usersMap, user) => usersMap.set(user.id, user),
                  Map<string, Document<User>>()
                ),
            });
          },
          (error) => {
            this.patchState({ loading: false });
            this._notificationStore.setError({ error });
          }
        )
      );
    })
  );
}
