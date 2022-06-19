import { HttpErrorResponse, HttpResponse } from "@angular/common/http";

import { TodoService } from "./todo.service";
import { ClientErrorResponse } from "./client-error-response.enum";
import { SuccessResponse } from "./success-response.enum";

export enum MessagesType {
  SUCCESS = 'success',
  DANGER = 'danger'
}

export namespace Messages {
  export const TASK_COMPLETION_SUCCESS = 'Tarefa atualizada com sucesso';
  export const TASK_COMPLETION_FAILED_INVALID_PARAMS = 'Falha no cadastro - Parâmetros inválidos';
  export const TASK_COMPLETION_FAILED_GENERIC_MESSAGE = 'Falha no cadastro da tarefa';
}

export abstract class AbstractTaskSubmitter {

  protected _onSuccessResponseListener!: (_: SuccessResponse, value: any) => void;
  protected _onErrorResponseListener!: (_: ClientErrorResponse) => void;

  constructor(
    protected readonly todoService: TodoService,
  ) { }

  public set onSuccessResponseListener(listener: (result: SuccessResponse, value: any) => void) {
    this._onSuccessResponseListener = listener;
  }

  public set onErrorResponseListener(listener: (result: ClientErrorResponse) => void) {
    this._onErrorResponseListener = listener;
  }

  protected isStatusOk(response: HttpResponse<any>): boolean {
    return response.status === 200;
  }

  protected isStatusCreated(response: HttpResponse<any>): boolean {
    return response.status === 201;
  }

  protected isStatusClientError(e: HttpErrorResponse | null): boolean {
    return !!(e && e.status && e.status >= 400 && e.status <= 499);
  }

  protected onSuccessResponse(value: any): void {
    if (!!this._onSuccessResponseListener) {
      this._onSuccessResponseListener(SuccessResponse.SUCCESS, value);
    }
  }

  protected onErrorResponse(e: HttpErrorResponse | null): void {
    if (this.isStatusClientError(e)) {
      this._onErrorResponseListener(ClientErrorResponse.CLIENT_ERROR);  
      return;
    }

    this._onErrorResponseListener(ClientErrorResponse.UNKNOWN);
  }

  protected abstract getResponseHandler(): any;
}