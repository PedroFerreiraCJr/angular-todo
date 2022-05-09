import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from './bread-crumb.service';

@Component({
  selector: 'app-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.scss']
})
export class BreadCrumbComponent implements OnInit {

  base: string = '';
  component: string = '';

  ngOnInit(): void {
    BreadCrumbService.base$.subscribe(value => this.base = value);
    BreadCrumbService.component$.subscribe(value => this.component = value);
  }
}
