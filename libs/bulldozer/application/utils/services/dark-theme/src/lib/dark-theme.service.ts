import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DarkThemeService {
  private _darkTheme = new BehaviorSubject<boolean>(this.defaultValue);
  isDarkThemeEnabled$ = this._darkTheme.asObservable();

  get defaultValue() {
    return localStorage.getItem('darkTheme') === 'true';
  }

  setDarkTheme(isDarkThemeOn: boolean) {
    this._darkTheme.next(isDarkThemeOn);
    localStorage.setItem('darkTheme', isDarkThemeOn.toString());
  }

  toggleDarkTheme() {
    const currentStatus = this._darkTheme.value;
    this._darkTheme.next(!currentStatus);
    localStorage.setItem('darkTheme', (!currentStatus).toString());
  }
}
