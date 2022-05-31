import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';

import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { ModalService } from '../modal/modal.service';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  subscription!: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly todoService: TodoService,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null, []],
      name: [null, [Validators.required, Validators.minLength(5)]],
      description: [null, [Validators.required, Validators.minLength(10)]],
    });

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Novo');

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') as number | null;
      if (id) {
        // deve carregar e aplicar os valores aos campos do form
        this.todoService.getById(id).subscribe({
          next: todo => {
            this.form.patchValue({
              id: todo.id,
              name: todo.name,
              description: todo.description
            });
          },
          error: (e) => {
            console.log(e);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public fieldHasError(field: string, error: string): boolean {
    const f = this.form.get(field);
    return f?.getError(error) && f.touched;
  }

  public fieldDontHasAnyError(field: string): boolean {
    const f = this.form.get(field);
    return !(f?.errors);
  }

  public getFieldError(field: string, error: string): string {
    const f = this.form.get(field);
    const e = f?.getError(error);

    if (e && error === 'required') {
      return 'O campo é obrigatório.';
    }

    if (e && error === 'minlength') {
      return `O comprimento mínimo é de ${e.requiredLength} carácteres.`;
    }

    return '';
  }

  public onCancel(): void {
    this.location.back();
  }

  public onSubmit(): void {
    const id = this.form.get('id')?.value;

    const todo: Todo = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      date: new Date()
    };

    if (!id) {
      this.subscription = this.todoService.create(todo).subscribe({
        next: (response) => {
          if (this.isStatusCreated(response)) {
            this.onSuccessResponse();
          }
        },
        error: e => {
          this.onErrorResponse(e);
        }
      });
    }
    else {
      this.subscription = this.todoService.update(id, todo).subscribe({
        next: (response: HttpResponse<any>) => {
          if (this.isStatusOk(response)) {
            this.onSuccessResponse(false);
          }
        },
        error: e => {
          this.onErrorResponse(e);
        }
      });
    }
  }

  private isStatusCreated(response: HttpResponse<any>): boolean {
    return response.status === 201;
  }

  private isStatusOk(response: HttpResponse<any>): boolean {
    return response.status === 200;
  }

  private reset(): void {
    this.form.reset();
  }

  private onSuccessResponse(creation: boolean = true): void {
    this.modalService.openModal((_) => {
      this.reset();
      setTimeout(() => {
        this.router.navigate(['/list'], { relativeTo: this.route });
      }, 500);
    }, 'success', (creation) ? 'Tarefa criada com sucesso.' : 'Tarefa atualizada com sucesso.');
  }

  private onErrorResponse(e: HttpErrorResponse | null): void {
    if (this.isStatusClientError(e)) {
      this.modalService.openModal((_) => { }, 'danger', 'Falha no cadastro - Parâmetros inválidos.');
      return;
    }

    this.modalService.openModal((_) => { }, 'danger', 'Falha no cadastro da tarefa.');
  }

  private isStatusClientError(e: HttpErrorResponse | null): boolean {
    return !!(e && e.status && e.status >= 400 && e.status <= 499);
  }
}
