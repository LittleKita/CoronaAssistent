import { Component, OnInit } from '@angular/core';
import { MDBModalRef } from 'angular-bootstrap-md';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  action: Subject<void> = new Subject();

  constructor(public modalRef: MDBModalRef) { }

  close(): void {
    this.action.next();
  }

  ngOnInit() {
  }

}
