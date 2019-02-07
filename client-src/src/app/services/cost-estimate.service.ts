import { TableData } from './../interfaces/table-data.interface';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConnectedUsers } from '../interfaces/connected-users.interface';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { ResponseContentType } from '@angular/http';
import { SharedDataService } from './shared-data.service';
import { CostEstimate } from '../interfaces/cost-estimate.interface';


@Injectable({
  providedIn: 'root'
})
export class CostEstimateService {
  private update = new Subject<CostEstimate>();
  private addNew = new Subject<string>();
  public remove = new Subject<string>();
  private configUrl = '/api/user/cost-estimate';

  constructor(private http: HttpClient, private userService: UserService, private sharedService: SharedDataService) {
   }

  addNewCostEstimate(name: string) {
    let user : User = this.userService.getLoggedUser();
    if(this.sharedService.costEstimates.find(es => es.name == name)) {
      this.sharedService.errorMessage('Troškovnik sa željenim imenom već postoji!');
      return;
    }
    this.addNew.next(name);

    return this.http.post<any>(this.configUrl + '/create',
      {
        user : {
              name: name,
              userid: user.id,
              token: user.token
        }
      });
  }

  updateCostEstimate(nameCostEstimate: string, estimateid: string) {
    const user = this.userService.getLoggedUser();
    let newCostEstimate: CostEstimate;
    newCostEstimate = {
      estimateid: parseInt(estimateid, 10),
      name: nameCostEstimate
    };
    this.update.next(newCostEstimate);
    return this.http.post<any>(this.configUrl + '/update', {
      user: {
        userid: user.id,
        token: user.token,
        name: nameCostEstimate,
        estimateid: estimateid
      }
    });
  }

  getUpdateObservable(): Observable<CostEstimate> {
    return this.update.asObservable();
  }

  getAddNewObservable(): Observable<string> {
    return this.addNew.asObservable();
  }

  getRemoveObservable(): Observable<string> {
    return this.remove.asObservable();
  }

  getConnectedUsers(): Observable<any> {
    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>('/api/user/friends', {
      user: {
        userid: user.id,
        token: user.token
      }
    });
  }

  sendCostEstimate(nameCostEstimate: string, email: string, userCredentials: string) {
    let user : User = this.userService.getLoggedUser();
    const estId = this.sharedService.costEstimates.find(ce => ce.name === nameCostEstimate).estimateid;
    let auth = email ? email : userCredentials;

    return this.http.post<any>(this.configUrl + '/send', {
      user: {
        estimateid: estId,
        userid: user.id,
        toEmail: auth,
        token: user.token
      }
    });
  }

  getCostEstimates() {
    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>(this.configUrl + '/get',
    {
      user: {
        userid: user.id,
        token: user.token
      }
    });
  }

  getReceivedCostEstimates() {
    let user : User = this.userService.getLoggedUser();

    return this.http.post<any>(this.configUrl + '/receive',
    {
      user: {
        userid: user.id,
        token: user.token
      }
    });
  }
  delete(costEstimate: TableData) {
    let user : User = this.userService.getLoggedUser();

    this.remove.next(costEstimate.name);

    return this.http.post<any>(this.configUrl + '/delete',{
      user: {
        userid: user.id,
        token: user.token,
        estimateid: costEstimate.estimateid
      }
    });
  }

  downloadCostEstimate(estimateName: string): Observable<any> {
    let user : User = this.userService.getLoggedUser();
    const estId = this.sharedService.costEstimates.find(ce => ce.name === estimateName).estimateid;

    console.log('send: ', {
      user: {
        estimateid: estId,
        userid: user.id,
        token: user.token
      }}
    );
    return this.http.post('/api/user/pdf/generate', {
      user: {
        estimateid: estId,
        userid: user.id,
        token: user.token
      }
    }, { responseType: 'blob'});
  }
}
