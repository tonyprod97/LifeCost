import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedDataService } from './shared-data.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  configUrl = '/api/user/expense/';

  constructor(private http: HttpClient,private sharedService: SharedDataService,private userService: UserService) { }

  getData(startDate: string, endDate: string, monthRange: number) {
    let user: User = this.userService.getLoggedUser();

    let localFormat = 'DD/MM/YYYY'; //moment.localeData().longDateFormat('L');

    let thisYear = new Date();
    let previousYear = new Date();
    previousYear.setMonth(previousYear.getMonth() - 12);


    if(!startDate) {
      startDate = moment.utc(previousYear, localFormat).toISOString();
    }
    if(!endDate) {
      endDate = moment.utc(thisYear, localFormat).toISOString();
    }

    return this.http.post<any>(this.configUrl + 'get-evaluated', {
      user: {
        userid: user.id,
        estimateid: this.sharedService.estimateid,
        startDate: startDate,
        endDate: endDate,
        monthRange: monthRange,
        token: user.token
      }
    });
  }
}
