import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TodoComponent } from './components/todo/todo.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: '/list'
  },
  {
    path: 'new', component: TodoComponent
  },
  {
    path: 'list', component: TodoListComponent
  },
  {
    path: 'edit/:id', component: TodoComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
