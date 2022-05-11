import { Injectable } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    private modalService: NgbModal
  ) { }

  public open(cb: (result: any) => void) {
    const modalRef = this.modalService.open(ModalComponent, { 'backdrop': 'static', 'keyboard': false });
    modalRef.componentInstance.type = 'success';
    modalRef.componentInstance.message = 'Tarefa cadastrada com sucesso!';
    modalRef.result.then(cb);
  }
}
