import { ActivatedRoute, Router } from "@angular/router";

import { catchError, Subscription, throwError } from "rxjs";

import { Todo } from "src/app/model/todo.model";
import { TodoService } from "./todo.service";
import { AbstractTaskSubmitter, Messages, MessagesType } from "./abstract-task-submitter";
import { SubmitterStrategy } from "./submitter-strategy/submitter-strategy";
import { ModalService } from "../modal/modal.service";
import { SuccessResponse } from "./success-response.enum";
import { ClientErrorResponse } from "./client-error-response.enum";

export class TaskUpdateSubmitter extends AbstractTaskSubmitter implements SubmitterStrategy {

  private _resetFormCallback!: () => void;
  private _submittedCallback!: () => void;

  constructor(todoService: TodoService,
    private readonly modalService: ModalService,
    private readonly route: ActivatedRoute,
    private readonly router: Router) {
    super(todoService);
  }

  public set resetFormCallback(fn: () => void) {
    this._resetFormCallback = fn;
  }

  public set submittedCallback(fn: () => void) {
    this._submittedCallback = fn;
  }

  public submit(id: number, todo: Todo): Subscription {
    return this.todoService.update(id, todo)
      /**
       * Captura erros comuns que podem ser tratados na classe de serviço ao invés do
       * tratamento direto no componente.
      */
      .pipe(
        catchError((e) => {
          console.log('erro recebido na atualização de tarefa', e);
          /**
           * Repassa o erro para quem fez o subscribe. Caso fosse retornado através
           * do operador of() do RxJS, não seria apresentadda a modal de erro.
          */
          return throwError(() => e);
        })
      )
      .subscribe(this.getResponseHandler());
  }
  
  protected getResponseHandler(): any {
    return {
      next: (res: any) => {
        if (this.isStatusOk(res)) {
          this.onSuccessResponse(res);
        }
      },
      error: (e: any) => {
        this.onErrorResponse(e);
      }
    }
  }

  public addDefaultListeners(): void {
    this.onSuccessResponseListener = (_: SuccessResponse, value: any) => {
      const id = value.body.id;
      this.modalService.openMessageModal((result) => {
        console.log('resposta na atualização: ', value);
        if (!!this._resetFormCallback) this._resetFormCallback();
        if (result && result == 'fechar') {
          if (!!this._submittedCallback) this._submittedCallback();
          setTimeout(() => {
            this.router.navigate(['/list'], { relativeTo: this.route });
          }, 500);
        }
      } , MessagesType.SUCCESS, `Tarefa de id ${id} foi atualizada com sucesso!`);
    };

    this.onErrorResponseListener = (v: ClientErrorResponse) => {
      if (v == ClientErrorResponse.CLIENT_ERROR) {
        this.modalService.openMessageModal((_) => { }, MessagesType.DANGER, Messages.TASK_COMPLETION_FAILED_INVALID_PARAMS);
        return;
      }

      if (v == ClientErrorResponse.UNKNOWN) {
        this.modalService.openMessageModal((_) => { }, MessagesType.DANGER, Messages.TASK_COMPLETION_FAILED_GENERIC_MESSAGE);
      }
    };
  }

  /**
   * Método da interface SubmitterStrategy que invoca a operação de envio dos dados para o backend.
  */
  perform(...args: any): Subscription {
    const [id, todo] = args[0];
    return this.submit(id, todo);
  }
}
