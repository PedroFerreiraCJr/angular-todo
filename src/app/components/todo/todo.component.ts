import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
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
    private readonly todoService: TodoService
    ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(5)]],
      description: [null, [Validators.required, Validators.minLength(10)]],
    });

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Novo');
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
      return 'O campo é obrigatório';
    }

    if (e && error === 'minlength') {
      return `O comprimento mínimo é de ${e.requiredLength} carácteres.`;
    }

    console.log(e);

    return '';
  }

  public onCancel(): void {
    this.router.navigate(['/list'], { relativeTo: this.route });
  }

  public onSubmit(): void {
    const todo = this.form.value;
    this.subscription = this.todoService.create(todo).subscribe((response) => {
      // caso seja sucesso
      if (response.status === 201) {
        alert('Tarefa criada com sucesso!');
        this.reset();
      }
    });
  }

  private reset(): void {
    this.form.reset();
  }
}
