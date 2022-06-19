import { Subscription } from "rxjs";

export interface SubmitterStrategy {
  perform(...args: any): Subscription;
}
