import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, take } from 'rxjs';

import { Todo } from 'src/app/model/todo.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(
    private readonly http: HttpClient
  ) { }

  /**
   * Para saber qual o código de status da resposta enviada pelo servidor, basta adicionar
   * a configuração "{ observer: 'response' }", e alterar o tipo da resposta para
   * HttpReponse tipado com o objeto a ser retornado pelo servidor.
   * 
  */
  public create(todo: Todo): Observable<HttpResponse<Todo>> {
    return this.http.post<Todo>(`${environment.API_URL}/todos`, todo, { observe: 'response' }).pipe(take(1));
  }

  public list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${environment.API_URL}/todos`);
  }
}
