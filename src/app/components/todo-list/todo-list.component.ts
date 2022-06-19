import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { distinctUntilChanged, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';

import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ModalService } from '../modal/modal.service';
import { TodoService } from '../todo/todo.service';
import { ConfirmationModalHandler } from './confirmation-modal-handler';

import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  form!: FormGroup;
  todos$!: Observable<Todo[]> | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly todoService: TodoService,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      search: ['', [Validators.min(2)]]
    });

    /**
     * Implementação de busca reativa através do observable valuechanges
    */
    this.subscribeValueChanges();

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Listagem');
  }

  public subscribeValueChanges(): void {
    this.todos$ = this.form.get('search')?.valueChanges.pipe(
      // tap(console.log),
      startWith(''),
      distinctUntilChanged(),
      switchMap(value => this.todoService.list()
        .pipe(
          map(todos =>
            todos.filter((t) => {
              return this.onSearch(value, t);
            }))
        )
      )
    );
  }

  private onSearch(value: string, t: Todo): boolean {
    if (!value) {
      return true;
    }

    return t.description.toLocaleLowerCase().includes(value.toLocaleLowerCase());
  }

  public onSubmit(): void {
    /**
     * Dispara o evento de valuechanges programaticamente no formcontrol
     * https://stackoverflow.com/questions/42435736/how-to-fire-the-valuechanges-programmatically
    */
    this.form.get('search')?.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  public onNew(): void {
    this.router.navigate(['/new'], { relativeTo: this.route });
  }

  public onEdit(id: number): void {
    if (!id) {
      this.handleErrorModal();
      return;
    }

    /**
     * passa o parâmetro 'id' para a rota ativada
     * link: https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
    */
    this.router.navigate(['/edit', id], { relativeTo: this.route });
  }

  public onRemove(id: number): void {
    if (!id) {
      this.handleErrorModal();
      return;
    }

    this.handleSuccessModal(id);
  }

  private handleErrorModal(): void {
    this.modalService.openMessageModal((_) => { }, 'error', 'Parâmetro inválido.');
  }

  private handleSuccessModal(id: number) {
    /**
     * O método open, abaixo, recebe um component e configurações que serão usados para abrir uma modal.
     * Após a instanciação do component na modal, é recebido um NgbModalRef em um callback para fazer
     * a configuração dos inputs do component informado.
    */
    this.modalService.open(
      ConfirmModalComponent,
      { 'backdrop': 'static', 'keyboard': false },
      (modal: NgbModalRef) => {
        this.handleConfirmModal(id, modal);
      }
    );
  }

  private handleConfirmModal(id: number, modal: NgbModalRef): void {
    new ConfirmationModalHandler(modal, this).handle(id, this.todoService);
  }

  public handleErrorConfirmModal(): void {
    this.modalService.openMessageModal((_) => { }, 'error', 'Houve um erro na remoção da tarefa.');
  }
}
