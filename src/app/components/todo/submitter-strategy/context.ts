import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";

import { SubmitterStrategy } from "./submitter-strategy";

@Injectable()
export class Context {

  private _strategy!: SubmitterStrategy;

  constructor() { }

  public set strategy(strategy: SubmitterStrategy) {
    this._strategy = strategy;
  }
  
  public execute(...args: any): Subscription {
    return this._strategy.perform(args);
  }
}
