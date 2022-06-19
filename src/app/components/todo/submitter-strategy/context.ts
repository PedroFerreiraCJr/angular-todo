import { Todo } from "src/app/model/todo.model";
import { SubmitterStrategy } from "./submitter-strategy";

export class Context {

  private _strategy!: SubmitterStrategy;

  constructor() { }

  public set strategy(strategy: SubmitterStrategy) {
    this._strategy = strategy;
  }
  
  public execute(...args: any) {
    this._strategy.perform(args);
  }
}
