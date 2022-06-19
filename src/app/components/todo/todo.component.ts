import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
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
import { MessagesType } from './abstract-task-submitter';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  providers: [Context, TaskCreationSubmitter, TaskUpdateSubmitter]
})
export class TodoComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  subscription!: Subscription;
  
  private id: number | null = null;
  private submitted: boolean = false;
  private readonly ctx = new Context();

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    private readonly todoService: TodoService,
    private readonly modalService: ModalService,
    private readonly toastService: AppToastService,
    private readonly injector: Injector
  ) { }

  ngOnInit(): void {
    this.buildFormGroup();

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Novo');

    // captura o parâmetro passado para a rota
    this.route.paramMap.subscribe((params) => {
      // se o parâmetro for null, então estamos criando uma nova tarefa, e portanto, não existe id
      this.id = params.get('id') as number | null;
      if (this.id) {
        // caso exista id na rota ativa, busca os dados do Todo para editar no mesmo formulário de cadastro
        this.todoService.getById(this.id).subscribe({
          next: todo => {
            // prepara os dados para edição
            this.prepareEdit(todo);
          },
          error: e => this.modalService
            .openMessageModal((result) => {
              if (result && result == 'fechar') {
                this.gotoListComponent();
              }
            }, MessagesType.DANGER, 'Falha no carregamento dos dados da tarefa para atualização')
        });
      }
    });

    if (this.isTaskCreation()) {
      this.configureStrategy(() => this.injector.get<TaskCreationSubmitter>(TaskCreationSubmitter));
    }
    else {
      this.configureStrategy(() => this.injector.get<TaskUpdateSubmitter>(TaskUpdateSubmitter));
    }
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

  private gotoListComponent(): void {
    setTimeout(() => {
      this.router.navigate(['/list'], { relativeTo: this.route });
    }, 500);
  }

  /**
   * Retorna verdadeiro caso o id seja falsy.
  */
   private isTaskCreation(): boolean {
    return !this.id;
  }

  /**
   * Esta função é responsável por receber uma factory de strategy e a partir do resultado da invocação
   * da fábrica obter o strategy correto para ser utilizado no âmbito da classe Context.
   * 
   * Esse método configura as responsabilidades default dos strategies recebidos através do método
   * configureSubmitterStrategy, que recebe o strategy e o configura
  */
  private configureStrategy(factory: () => any): void {
    // solicita ao framework de injeção de dependência do angular que resolva a dependência da classe
    // de serviço chamada TaskCreationSubmitter.
    const concreteStrategy = factory.call(this);
    this.configureSubmitterStrategy(concreteStrategy);
    this.ctx.strategy = concreteStrategy;
  }

  private configureSubmitterStrategy(strategy: TaskCreationSubmitter | TaskUpdateSubmitter): void {
    strategy.addDefaultListeners();
    strategy.submittedCallback = () => this.submitted = true;
    strategy.resetFormCallback = () => this.reset();
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
    
    const todo: Todo = {
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      date: new Date()
    };
    
    // remove a inscrição anterior, em caso de mais de uma tentativa de envio com falha
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    /**
     * Com base em uma flag, a classe cliente deve configurar o algoritmo a ser utilizado
     * no objeto Context que mantém a referência para o Strategy.
     * 
     * Essa configuração é feita no método ngOnInit() de ciclo de vida do componente.
     */
    if (this.isTaskCreation()) {
      this.subscription = this.ctx.execute(todo);
    }
    else {
      this.subscription = this.ctx.execute(this.id, todo);
    }
  }
}
