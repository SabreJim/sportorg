import { Component, OnInit } from '@angular/core';
import {FirebaseAuthService} from "../services/firebase-auth.service";

@Component({
  selector: 'login-required',
  templateUrl: './login-required.component.html',
  styleUrls: ['./login-required.component.scss']
})
export class LoginRequiredComponent implements OnInit {

  constructor(private authService: FirebaseAuthService) { }

  ngOnInit() {
  }

  public login = this.authService.toggleLogin;

}
