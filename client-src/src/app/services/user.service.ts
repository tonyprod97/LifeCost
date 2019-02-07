import { User } from './../interfaces/user.interface';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedDataService } from './shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private router: Router,private sharedService : SharedDataService) {
   }

  login(userName: string, password: string) {
    return this.http.post<any>('/api/user/login', { user: { email: userName, password: password }});
  }

  public isUserLogedIn() {
    return localStorage.getItem('currentUser');
  }
  register( email: string, userName: string, password: string) {
    return this.http.post<any>('/api/user/register', {
      user: { email: email, userName: userName, password: password}});
  }

  logout() {
    const user : User = this.getLoggedUser();
    if(user) {
      this.http.post<any>('/api/user/logout', {
        user: { id: user.id, token: user.token}}).subscribe(data => {
          if(data.error) this.sharedService.errorMessage(data.error)
          console.log(data);
          localStorage.removeItem('currentUser');

        }, err => {
          console.log(err);
          this.sharedService.error();
        });
    }
  }

  openProfile(user: User) {
    return this.http.post<any>('/api/user/profile/get', {
       user: {userid: user.id, token: user.token
       }
     });
   }

  edit(name: string, surname: string, oib: string, homeAddress: string, phoneNumber: string) {
    // console.log(localStorage.getItem('currentUser'));
    const user: User = this.getLoggedUser();
    return this.http.post<any>('/api/user/profile/update', {
      user: {userid: user.id, token: user.token,
        name: name, lastname: surname,
        oib: oib, homeAddress: homeAddress, phoneNumber: phoneNumber
      }
    });
  }

  getLoggedUser(): User {
    return JSON.parse( localStorage.getItem('currentUser') ) as User;
  }

  validateUserToken(): Observable<any> {
    const user : User = this.getLoggedUser();

    return this.http.post<any>('/api/user/validate', {
      user: {
        userid: user.id,
        token: user.token
      }
      });
  }
}
