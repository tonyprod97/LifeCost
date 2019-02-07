import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import { IncomeItem } from '../interfaces/income-item.interface';
import { IncomeService } from './income.service';
import { SharedDataService } from './shared-data.service';

import * as moment from 'moment';
import { Subject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class IncomeItemService {

  incomeListSubject = new Subject<boolean>();
  currentIncomeSubject = new Subject<IncomeItem>();
  isItUpdateSubject = new Subject<boolean>();
  currentIncome: IncomeItem;

  deleteIncomeSubject = new Subject<any>();
  updateIncomeSubject = new Subject<any>();
  createIncomeSubject = new Subject<any>();

  private localFormat: string;
  /*
  isUpdatingSubject = new Subject<boolean>();
  deleteIncomeSubject = new Subject<any>();
  addIncomeSubject = new Subject<any>();
  updateIncomeSubject = new Subject<any>();
  */

  constructor(private http: HttpClient, private userService: UserService,
    private sharedService: SharedDataService, private incomeService: IncomeService) {
    this.localFormat = 'DD/MM/YYYY'; //moment.localeDate().LongDateFormat('L');
  }

  getCurrentIncomeContent(): IncomeItem {
    return this.currentIncome;
  }

  getIncomeListObservable(): Observable<boolean> {
    return this.incomeListSubject.asObservable();
  }

  getCurrentIncomeObservable(): Observable<IncomeItem> {
    return this.currentIncomeSubject.asObservable();
  }

  setIsItUpdate() {
    this.isItUpdateSubject.next(false);
  }

  getIsItUpdateObservable(): Observable<boolean> {
    return this.isItUpdateSubject.asObservable();
  }




  getCurrentIncome(label: string, isItUpdate: boolean): IncomeItem {
    console.log(label)
    this.currentIncome = this.sharedService.incomeList.find(x => x.label === label);
    this.currentIncomeSubject.next(this.currentIncome);
    this.isItUpdateSubject.next(isItUpdate);
    return this.currentIncome;
  }

  collectAllIncomes() {
  }

  getCreateIncomeObservable(): Observable<IncomeItem> {
    return this.createIncomeSubject.asObservable();
  }

  createIncome(item: IncomeItem, estimateid: string): Observable<any> {
    console.log(item);
    const user: User = this.userService.getLoggedUser();
    console.log(user);

    return this.http.post<any>('/api/user/income/create', {
      user: {
        userid: user.id,
        estimateid: estimateid,
        value: item.price,
        startDate: item.fromDate,
        endDate: item.toDate,
        evaluate: item.evaluate,
        name: item.label,
        comment: item.comment,
        token: user.token
      }
    });
  }


  getUpdateIncomeObservable(): Observable<IncomeItem> {
    return this.updateIncomeSubject.asObservable();
  }


  updateItem(item: IncomeItem) {
    let user: User = this.userService.getLoggedUser();
    console.log({
      user: {
        incomeid: item.id,
        userid: user.id,
        name: item.label,
        token: user.token,
        value: item.price,
        comment: item.comment
      }
    })
    return this.http.post<any>('/api/user/income/update', {
      user: {
        incomeid: item.id,
        userid: user.id,
        name: item.label,
        token: user.token,
        value: item.price,
        comment: item.comment
      }
    });
  }


  getDeleteIncomeObservable(): Observable<IncomeItem> {
    return this.deleteIncomeSubject.asObservable();
  }

  deleteIncome(item: IncomeItem) {
    console.log(item);
    const user: User = this.userService.getLoggedUser();
    this.deleteIncomeSubject.next(item);
    //this.addNewIncomeButton();
    return this.http.post<any>('/api/user/income/delete', {
      user: {
        incomeid: item.id,
        userid: user.id,
        token: user.token
      }
    });

    /*
    getUpdateIncome(): Observable<IncomeItem> {
      return this.updateIncomeSubject.asObservable();
    }

    getAddIncome(): Observable<IncomeItem> {
      return this.addIncomeSubject.asObservable();
    }

    getIsUpdatingObservable(): Observable<any> {
      return this.isUpdatingSubject.asObservable();
    }

    onClick() {
      this.isUpdatingSubject.next(false);
    }

    addNewIncome(item: IncomeItem) {
      const user: User = this.userService.getLoggedUser();
      console.log(item);
      this.addIncomeSubject.next(item);
      return this.http.post<any>('/api/user/income/create', {
        user: {
          userid: user.id,
          estimateid: this.sharedService.estimateid,
          value: item.value,
          startDate: item.fromDate, //new Date(Number(tempDateFrom[2]),Number(tempDateFrom[1]),Number(tempDateFrom[0])),
          endDate: item.toDate, //new Date(Number(tempDateTo[2]),Number(tempDateTo[1]),Number(tempDateTo[0])),
          evaluate: item.evaluate,
          name: item.label,
          token: user.token,
          comment: item.comment
        }
      });
    }


    }

    updateIncome(item: IncomeItem) {
      const user: User = this.userService.getLoggedUser();
      this.updateIncomeSubject.next(item);
      return this.http.post<any>('/api/user/income/update', {
        user: {
          incomdeid: item.id,
          value: item.value,
          userid: user.id,
          name: item.label,
          comment: item.comment,
          token: user.token
        }
      });
    }

    */

  }
}
