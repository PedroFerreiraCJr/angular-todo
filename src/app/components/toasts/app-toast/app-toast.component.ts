import { Component } from '@angular/core';

import { AppToastService } from '../app-toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './app-toast.component.html',
  styleUrls: ['./app-toast.component.scss']
})
export class AppToastsComponent {

  constructor(public toastService: AppToastService) { }
}
