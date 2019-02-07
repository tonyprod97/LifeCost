import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {MatSnackBar} from '@angular/material';
import { User } from 'src/app/interfaces/user.interface';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
  returnUrl: string;
  form: FormGroup;
  errorMessage: string;

  constructor(private formBuilder: FormBuilder, private userService: UserService,private sharedService: SharedDataService,
    private route: ActivatedRoute, private router: Router, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      password: new FormControl('', [Validators.required]),
      userName: new FormControl('', Validators.required)
    });
    this.userService.logout();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLogIn() {
    this.errorMessage = '';
    this.userService.login(this.form.controls.userName.value, this.form.controls.password.value)
                          .subscribe(data => {
                            if(data.error) {
                              this.sharedService.errorMessage(data.error);
                              this.errorMessage = data.error;
                            } else {
                        	    let user = JSON.stringify(data.user);
                              localStorage.setItem('currentUser',user);
                              this.openSnackBar();
                              this.router.navigate(['/naslovna']);
                            }
                          },
                                  error => {console.log(error);
                                  this.sharedService.error();
                                                           });
  }

  openSnackBar() {
    this.snackBar.open('Uspješna Prijava', 'Zahvaljujemo na prijavi' , {
      duration: 2000,
    });
  }
}
