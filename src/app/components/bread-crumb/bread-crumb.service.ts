import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbService {

  public static readonly base$: Subject<string> = new Subject<string>();
  public static readonly component$: Subject<string> = new Subject<string>();

  constructor() { }

  public static publishBase(base: string): void {
    this.base$.next(base);
  }

  public static publishComponent(component: string): void {
    this.component$.next(component);
  }
}
