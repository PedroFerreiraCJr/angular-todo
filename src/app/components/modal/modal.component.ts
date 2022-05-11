import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input('alertType')
  type: string = 'success';

  @Input('alertMessage')
  message: string = 'Operação efetuada com sucesso!';

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }
}
