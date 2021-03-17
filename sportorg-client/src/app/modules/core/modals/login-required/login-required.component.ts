import { Component, OnInit } from '@angular/core';
import {FirebaseAuthService} from "../../services/firebase-auth.service";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'login-required',
  templateUrl: './login-required.component.html',
  styleUrls: ['./login-required.component.scss']
})
export class LoginRequiredComponent implements OnInit {

  constructor(private authService: FirebaseAuthService, protected matDialogRef: MatDialogRef<LoginRequiredComponent>) { }

  ngOnInit() {
  }

  public login = (authName: string) => {
    this.authService.toggleLogin(authName);
    this.matDialogRef.close();
  }

}
