import { Injectable, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { IncomeItem } from '../interfaces/income-item.interface';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import { SharedDataService } from './shared-data.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private localFormat: string;
  activeIncome = new Subject<IncomeItem>();
  addIncomeSubject = new Subject<IncomeItem>();
  activeIncomeName: string;
  activeIncomeid: string;
  activeIncomeItem: IncomeItem;
  @Input() incomes: Array<IncomeItem> = new Array();
  public IncomesSubject = new Subject();


  constructor(private router: Router, private http: HttpClient, private userService: UserService,
    private sharedService: SharedDataService) {
      this.localFormat = 'DD/MM/YYYY';
    }

  error() {
    this.router.navigate(['/error']);
  }

  getActiveIncomeObservable(): Observable<IncomeItem> {
    return this.activeIncome.asObservable();
  }

  getIncomesObservable(): Observable<any> {
    return this.IncomesSubject.asObservable();
  }

  getAddIncome(): Observable<IncomeItem> {
    return this.addIncomeSubject.asObservable();
  }




  collectAllIncomes(): Observable<any> {
    const user: User = this.userService.getLoggedUser();
    return this.http.post<any>('/api/user/income/get', {
      user: {
        userid: user.id,
        estimateid: this.sharedService.estimateid,
        token: user.token
      }
    });
  }

  onSelectIncome(incomeid: string) {
    const incomeItem = this.getActiveIncome(incomeid);
    this.activeIncomeItem = incomeItem;
    this.activeIncomeid = incomeItem.id.toString();
    console.log(incomeItem);
    this.activeIncome.next(incomeItem);
  }

  getActiveIncome(incomeid: string): IncomeItem {
    return this.incomes.find(x => x.id === parseInt(incomeid, 10));
  }

  createIncome(item: IncomeItem, estimateid: string): Observable<any> {
    const user: User = this.userService.getLoggedUser();
    console.log( {
      user: {
        userid: user.id,
        estimateid: estimateid,
        value: item.price,
        startDate: moment.utc(item.fromDate, this.localFormat).toISOString(),
        endDate: moment.utc(item.toDate, this.localFormat).toISOString(),
        evaluate: item.evaluate,
        name: item.label,
        comment: item.comment,
        token: user.token
      }
    });

    return this.http.post<any>('/api/user/income/create', {
      user: {
        userid: user.id,
        estimateid: estimateid,
        value: item.price,
        startDate: moment.utc(item.fromDate, this.localFormat).toISOString(),
        endDate: moment.utc(item.toDate, this.localFormat).toISOString(),
        evaluate: item.evaluate,
        name: item.label,
        comment: item.comment,
        token: user.token
      }
    });
  }

}
