import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedDataService } from './shared-data.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import { ExpenseItem } from '../interfaces/expense-item.interface';
import { Subject, Observable } from 'rxjs';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseItemService {
  private configUrl = '/api/user/expense/';
  public allItems: Array<ExpenseItem>;
  public itemsForCategoryCollectedSubject : Subject<Array<ExpenseItem>> = new Subject();

  private localFormat: string;

  constructor(private  http:  HttpClient, private userService: UserService, private sharedService: SharedDataService) {
    this.allItems = new Array();
    this.localFormat = 'DD/MM/YYYY'; //moment.localeData().longDateFormat('L');
  }

  addNewItem(item: ExpenseItem,categoryName: string) {
    let user : User = this.userService.getLoggedUser();
    let cat = this.sharedService.allCategories.find(cat => cat.name === categoryName);
    //let tempDateFrom = item.fromDate.split('.');
    //let tempDateTo = item.toDate.split('.');

    console.log("test_date");
    console.log(JSON.stringify(item.fromDate));
    console.log(JSON.stringify(item.toDate));

    return this.http.post<any>(this.configUrl + 'create', {
      user: {
        userid: user.id,
        estimateid: this.sharedService.estimateid,
        categoryid: cat.categoryid,
        value: item.price,
        startDate: moment.utc(item.fromDate, this.localFormat).toISOString(),
        endDate: moment.utc(item.toDate, this.localFormat).toISOString(),
        evaluate: item.evaluate,
        name: item.label,
        token: user.token,
        comment: item.comment
      }
    });
  }

  deleteItem(item: ExpenseItem) {
    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>(this.configUrl+ 'delete',{
      user:{
        expenseid: item.id,
        userid: user.id,
        name: item.label,
        token: user.token
      }
    });
  }

  updateItem(item: ExpenseItem) {
    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>(this.configUrl+ 'update',{
      user:{
        expenseid: item.id,
        userid: user.id,
        name: item.label,
        token: user.token,
        value: item.price,
        comment: item.comment
      }
    });
  }
  collectAllItems() {
    let user : User = this.userService.getLoggedUser();

    this.http.post<any>(this.configUrl + 'get', {
      user: {
        userid: user.id,
        estimateid: this.sharedService.estimateid,
        token: user.token
      }
    }).subscribe(data => {
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        return;
      }
      this.allItems = data.data;
      this.fireItemsForActiveCategorySubject();
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
  }

  fireItemsForActiveCategorySubject() {
    let items: Array<ExpenseItem> = new Array();

    let categoryId = this.sharedService.allCategories.find(cat => cat.name == this.sharedService.activaCategoryName);

    this.allItems.forEach(item => {
      if(item.categoryid == categoryId.categoryid) {
        items.push(item);
      }
    });

    this.itemsForCategoryCollectedSubject.next(items);
  }

  getSubjectForItems(): Observable<any> {
    return this.itemsForCategoryCollectedSubject.asObservable();
  }
}
