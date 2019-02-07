import { UserService } from './../../services/user.service';
import { Component, OnInit, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Profile } from './../../interfaces/profile.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  returnUrl: string;
  form: FormGroup;
  subscription: Subscription;
  @Input() profile: Profile;
  user: User;
  obs: Observable<Profile>;
  constructor(private formBuilder: FormBuilder, private userService: UserService,
    private route: ActivatedRoute, private router: Router, public snackBar: MatSnackBar) {
      this.form = new FormGroup({
        name: new FormControl(null),
        surname: new FormControl(null),
        oib: new FormControl(null),
        homeAddress: new FormControl(null),
        phoneNumber: new FormControl(null)
      });
      this.subscription = this.userService.openProfile(this.userService.getLoggedUser()).subscribe(data => {
        this.profile = data.data;
        const profilee = JSON.stringify(this.profile);
        localStorage.setItem('profile', profilee);
        this.form.controls.name.setValue(data.data.name);
        this.form.controls.surname.setValue(data.data.lastname);
        this.form.controls.oib.setValue(data.data.oib);
        this.form.controls.homeAddress.setValue(data.data.homeAddress);
        this.form.controls.phoneNumber.setValue(data.data.phoneNumber);
        console.log(this.form.controls.surname.value);
      });
    }

  ngOnInit() {
    this.obs = this.userService.openProfile(this.userService.getLoggedUser());

    //this.form.valueChanges.subscribe(profile => {this.form.setValue = profile; console.log(profile); });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onOpenProfile() {
    console.log(this.profile);
  }

  onEdit() {
    this.userService.edit(this.form.controls.name.value, this.form.controls.surname.value,
      this.form.controls.oib.value, this.form.controls.homeAddress.value, this.form.controls.phoneNumber.value)
      .subscribe(data => {
        this.router.navigate([this.returnUrl]);
        console.log(data);
      },
        error => console.log(error));
    this.router.navigate([this.returnUrl]);
  }

  openSnackBar() {
    console.log(this.form.controls);
    this.snackBar.open('Uspješna izmjena!', '', {
      duration: 2000,
    });
  }
}
