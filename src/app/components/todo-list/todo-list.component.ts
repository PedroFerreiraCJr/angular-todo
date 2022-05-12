import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, map, Observable, of, switchMap, tap } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';

import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { TodoService } from '../todo/todo.service';

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
    private readonly todoService: TodoService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      search: ['', [Validators.min(2)]]
    });

    this.todos$ = this.todoService.list();

    /**
     * Implementeação de busca reativa através do observable valuechanges
    */
    this.todos$ = this.form.get('search')?.valueChanges.pipe(
      switchMap(value => this.todoService.list()
        .pipe(
          map(todos =>
            todos.filter((t) => {
              return this.onSearch(value, t);
            }))
        )
      )
    );

    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Listagem');
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
      return;
    }

    console.log('remover', id);
  }
}
