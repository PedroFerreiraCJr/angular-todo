import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  @Input()
  type: string = 'warn';

  @Input()
  message: string = 'Confirme sua ação';

  @Output()
  confirmEvent: EventEmitter<{ active: NgbActiveModal, action: string }> = new EventEmitter<{ active: NgbActiveModal, action: string }>();

  @Output()
  cancelEvent: EventEmitter<{ active: NgbActiveModal, action: string }> = new EventEmitter<{ active: NgbActiveModal, action: string }>();

  constructor(public activeModal: NgbActiveModal) { }

  public confirm(): void {
    this.confirmEvent.emit({
      active: this.activeModal,
      action: 'confirmar'
    });
  }

  public cancelar(): void {
    this.cancelEvent.emit({
      active: this.activeModal,
      action: 'cancelar'
    });
  }
}
