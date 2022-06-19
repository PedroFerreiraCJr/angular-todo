import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoComponent } from './components/todo/todo.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';
import { ModalComponent } from './components/modal/modal.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { AppToastsComponent } from './components/toasts/app-toast/app-toast.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoComponent,
    TodoListComponent,
    BreadCrumbComponent,
    ModalComponent,
    AutofocusDirective,
    ConfirmModalComponent,
    AppToastsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
