import { NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { TodoService } from "../todo/todo.service";
import { TodoListComponent } from "./todo-list.component";

export class ConfirmationModalHandler {

  constructor(
    private modal: NgbModalRef,
    private listComponent: TodoListComponent) {
  }

  public handle(id: number, todoService: TodoService) {
    this.modal.componentInstance.message = 'Deseja realmente remover o Todo?';
    this.modal.componentInstance.confirmEvent
      .subscribe((result: { active: NgbActiveModal, action: string }) => {
        todoService.delete(id).subscribe({
          next: () => {
            result.active.close('sucesso');
            this.listComponent.subscribeValueChanges();
          },
          error: e => {
            result.active.close('falha');
            this.listComponent.handleErrorConfirmModal();
          }
        });
      });

    this.modal.componentInstance.cancelEvent
      .subscribe((result: { active: NgbActiveModal, action: string }) => {
        result.active.close('cancelar');
      });
  }
}
