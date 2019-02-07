import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {MatSnackBar} from '@angular/material';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  returnUrl: string;
  form: FormGroup;
  errorMessage: string;

  constructor(private formBuilder: FormBuilder, private userService: UserService, private sharedService: SharedDataService,
    private route: ActivatedRoute, private router: Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required]),
      userName: new FormControl('', Validators.required)
    });
    this.userService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onRegister() {
    this.errorMessage = '';
    console.log(this.form.controls);
    this.userService.register(this.form.controls.email.value,this.form.controls.userName.value, this.form.controls.password.value)
                      .subscribe(data => {
                        if(data.error) {
                          this.errorMessage = data.error;
                          this.sharedService.errorMessage(data.error);
                          return;
                        }
                        this.openSnackBar();
                        this.router.navigate([this.returnUrl]);
                        console.log(data);
                      },
                                  error => this.sharedService.error());
                                  this.router.navigate([this.returnUrl]);
  }

  openSnackBar() {
    this.snackBar.open('Uspješna Registracija', 'Zahvaljujemo se na registraciji' , {
      duration: 2000,
    });
  }
}
