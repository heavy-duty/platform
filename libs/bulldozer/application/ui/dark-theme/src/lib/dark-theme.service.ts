import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
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
}
