import { Injectable } from '@angular/core';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private modalService: NgbModal
  ) { }

  public openModal(callback: (result: any) => void, type?: string, message?: string,) {
    /**
     * Os parâmetro de configuração da modal são para definir que ela não deve ser fechada caso
     * o usuário clique fora, no backdrop, e que não deve fechar com a tecla ESC.
    */
    const modalRef = this.modalService.open(ModalComponent, { 'backdrop': 'static', 'keyboard': false });
    modalRef.componentInstance.type = type || 'success';
    modalRef.componentInstance.message = message || 'Tarefa cadastrada com sucesso!';
    modalRef.result.then(callback);
  }

  public open(component: any, config: any, callback: (value: NgbModalRef) => void): void {
    const modalRef = this.modalService.open(component, config);
    callback(modalRef);
  }
}
