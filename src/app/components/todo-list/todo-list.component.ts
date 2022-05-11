import { Component, OnInit } from '@angular/core';

import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    BreadCrumbService.publishBase('Todo List');
    BreadCrumbService.publishComponent('Listagem');
  }
}
