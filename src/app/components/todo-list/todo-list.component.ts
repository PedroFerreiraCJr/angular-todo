import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { distinctUntilChanged, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';

import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { ModalService } from '../modal/modal.service';
import { TodoService } from '../todo/todo.service';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  todos$!: Observable<Todo[]> | undefined;
  form!: FormGroup;

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

  private subscribeValueChanges(): void {
    this.todos$ = this.form.get('search')?.valueChanges.pipe(
      tap(console.log),
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
      return;
    }

    console.log('editar', id);
  }

  public onRemove(id: number): void {
    if (!id) {
      this.modalService.openModal((_) => {}, 'error', 'Parâmetro inválido.');
      return;
    }

    this.modalService.open(
      ConfirmModalComponent,
      { 'backdrop': 'static', 'keyboard': false },
      (modal: NgbModalRef) => {
        modal.componentInstance.message = 'Deseja realmente remover o Todo?';
        modal.componentInstance.confirmEvent.subscribe((result: { active: NgbActiveModal, action: string }) => {
          result.active.close('confirmar');
          this.todoService.delete(id).subscribe((response) => {
            this.subscribeValueChanges();
          }, error => {
            result.active.close('falha');
            this.modalService.openModal((_) => {}, 'error', 'Houve um erro na deleção.');
          });
        });

        modal.componentInstance.cancelEvent.subscribe((result: { active: NgbActiveModal, action: string }) => {
          result.active.close('cancelar');
        });
      }
    );
  }
}
