import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { Todo } from 'src/app/model/todo.model';
import { ToastInfo } from '../toasts/toast-info';
import { AppToastService } from '../toasts/app-toast.service';
import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { TodoService } from './todo.service';
import { ModalService } from '../modal/modal.service';
import { Context } from './submitter-strategy/context';
import { TaskCreationSubmitter } from './task-creation-submitter';
import { TaskUpdateSubmitter } from './task-update-submitter';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  subscription!: Subscription;
  
  private submitted: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly todoService: TodoService,
    private readonly modalService: ModalService,
    private readonly toastService: AppToastService
  ) { }

  ngOnInit(): void {
    this.buildFormGroup();

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Novo');

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') as number | null;
      if (id) {
        this.todoService.getById(id).subscribe({
          next: todo => {
            this.prepareEdit(todo);
          },
          error: e => console.log(e)
        });
      }
    });
  }

  /**
   * Remove da memória a última inscrição realizada no momento da destruição deste componente.
  */
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private buildFormGroup(initState?: any): void {
    this.form = this.fb.group({
      id: [null, []],
      name: [null, [Validators.required, Validators.minLength(5)]],
      description: [null, [Validators.required, Validators.minLength(10)]],
    });
  }

  private prepareEdit(todo: Todo): void {
    this.form.patchValue({
      id: todo.id,
      name: todo.name,
      description: todo.description
    });
  }

  public fieldHasError(field: string, error: string): boolean {
    const f = this.form.get(field);
    return f?.getError(error) && f.touched;
  }

  public fieldDontHasAnyError(field: string): boolean {
    const f = this.form.get(field);
    return !(f?.errors);
  }

  public getFieldError(field: string, error: string): string | null {
    const f = this.form.get(field);
    const e = f?.getError(error);

    if (e && error === 'required') {
      return 'O campo é obrigatório.';
    }

    if (e && error === 'minlength') {
      return `O comprimento mínimo é de ${e.requiredLength} carácteres.`;
    }

    return null;
  }

  public onCancel(): void {
    this.location.back();
  }

  public reset(): void {
    this.form.reset();
    this.submitted = false;
  }

  public onSubmit(event: any): void {
    event.preventDefault();

    if (this.submitted) {
      return;
    }

    /**
     * Somente permite cadastrar nova tarefa em caso de dados válidos. Se os dados estiverem
     * incorretos, uma toast será apresentada no canto superior direito.
    */
    if (this.form.invalid) {
      const toast: ToastInfo = {
        header: 'Aviso',
        body: 'Informações inválidas'
      }
      
      this.toastService.show(toast.header, toast.body);
      this.form.get('description')?.markAsTouched();
      return;
    }

    const id = this.form.get('id')?.value;

    const todo: Todo = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      date: new Date()
    };

    // remove a inscrição anterior, em caso de mais de uma tentativa de envio com falha
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    const ctx = new Context();

    if (this.isTaskCreation(id)) {
      // o cliente deve selecionar qual algoritmo deve ser utilizado
      ctx.strategy = this.getTaskCreationSubmitterStrategy();
      ctx.execute(todo);
    }
    else {
      // o cliente deve selecionar qual algoritmo deve ser utilizado
      ctx.strategy = this.getTaskUpdateSubmitterStrategy();
      ctx.execute(id, todo);
    }
  }
  
  /**
   * Retorna verdadeiro caso o id seja falsy.
  */
   private isTaskCreation(id: number): boolean {
    return !id;
  }

  private getTaskCreationSubmitterStrategy(): TaskCreationSubmitter {
    const strategy = new TaskCreationSubmitter(this.todoService, this.modalService, this.route, this.router);
    strategy.addDefaultListeners();
    strategy.submittedCallback = () => this.submitted = true;
    strategy.resetFormCallback = () => this.reset();
    return strategy;
  }

  private getTaskUpdateSubmitterStrategy() {
    const strategy = new TaskUpdateSubmitter(this.todoService, this.modalService, this.route, this.router);
    strategy.addDefaultListeners();
    strategy.submittedCallback = () => this.submitted = true;
    strategy.resetFormCallback = () => this.reset();
    return strategy;
  }
}
