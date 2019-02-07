import { SenderDataDialog, NameChangerDialog } from './../cost-estimate/cost-estimate.component';
import { Component, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { CostEstimateService } from '../services/cost-estimate.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Subscription } from 'rxjs';

import { UserService } from '../services/user.service';
import { TableData } from '../interfaces/table-data.interface';
import { Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements AfterViewInit,OnDestroy {
  costEstimates: Array<TableData> = new Array<TableData>();
  showCostEstimates = false;
  myDataArray;
  columnsToDisplay = ['seqNo', 'name'];
  counter;
  displayTable: boolean;
  private renameSubscription: Subscription;
  private addNewSubscription: Subscription;
  private removeCostEstimateSubscription: Subscription;


  constructor(private sharedService: SharedDataService, private costEstimateService: CostEstimateService,
    public dialog: MatDialog, private userService: UserService, public dialogSender: MatDialog , public nameChanger: MatDialog 
    , private router: Router, private http: HttpClient) {
      this.addNewSubscription = costEstimateService.getAddNewObservable().subscribe(data => {
        let es = {
          estimateid: this.costEstimates.length + 1,
          name: data,
          position: ++this.counter
        };

        this.costEstimates.push(es);
        sharedService.costEstimates.push(es);
        this.costEstimates = this.costEstimates.slice();
      });

      this.renameSubscription = costEstimateService.getUpdateObservable().subscribe(data => {
        this.costEstimates.forEach(function(currentValue) {
          if (currentValue.estimateid === data.estimateid) {
            currentValue.name = data.name;
          }
        });
      });

      this.removeCostEstimateSubscription = costEstimateService.getRemoveObservable().subscribe(data => {
        this.costEstimates = this.costEstimates.filter(x => x.name !== data);
        this.sharedService.costEstimates = this.costEstimates.filter(x => x.name !== data);

        console.log('data: ', data);
      });
    }


  ngAfterViewInit() {
    this.userService.validateUserToken().subscribe(data => {
      let logout: boolean;
      console.log('l10 ',localStorage.getItem('currentUser'),data);

      if(data.error) logout = true;
      if(data.data) {
        logout = !data.data.valid;
      }

      if(logout) {
        const user : User = this.userService.getLoggedUser();

        if(user) {
          this.http.post<any>('/api/user/logout', {
            user: { id: user.id, token: user.token}}).subscribe(res => {
              localStorage.removeItem('currentUser');
              this.router.navigateByUrl('/prijava');
            });
        }
      }
    });
  }

  onShow() {
    this.displayTable = true;
    this.costEstimateService.getCostEstimates()
        .subscribe(data=> {
          if(data.error) {
            this.sharedService.errorMessage(data.error);
            return;
          }
          this.costEstimates = new Array<TableData>();
          this.counter = 0;
          data.data.forEach( (x: TableData) => {

            this.costEstimates.push({
              estimateid: x.estimateid,
              name: x.name,
              position: ++this.counter
            });

            this.sharedService.costEstimates.push({
              estimateid: x.estimateid,
              name: x.name
            });

          });
          this.costEstimates = this.costEstimates.slice();
        },
        err => {console.log(err);this.sharedService.error();});
    this.showCostEstimates = !this.showCostEstimates;
  }
  onShowReceived() {
    this.displayTable = false;
    this.costEstimateService.getReceivedCostEstimates()
        .subscribe(data=> {
          if(data.error) {
            this.sharedService.errorMessage(data.error);
            return;
          }

          this.costEstimates = new Array<TableData>();
          this.counter = 0;
          data.data.forEach( (x: TableData) => {

            this.costEstimates.push({
              estimateid: x.estimateid,
              name: x.name,
              position: ++this.counter
            });

            this.sharedService.costEstimates.push({
              estimateid: x.estimateid,
              name: x.name
            });

          });
          this.costEstimates = this.costEstimates.slice();
        },
        err => {console.log(err);this.sharedService.error();});
    console.log('L1 :',this.costEstimates);
    this.showCostEstimates = !this.showCostEstimates;
  }

  onActivateCostEstimate(label: string, received: boolean) {
    this.sharedService.receivedMode = received;
    this.sharedService.activeCostEstimate = label;
  }

  onAddNew() {
    this.dialog.open(DialogData);
  }

  onSend(item: TableData) {
    this.sharedService.activeCostEstimate = item.name;

    this.dialogSender.open(SenderDataDialog, {
      data: {
        costEstimate: this.sharedService.activeCostEstimate
      }
    });
  }

  onUpdate(item: TableData) {
    this.sharedService.estimateid = item.estimateid.toString();
    this.nameChanger.open(NameChangerDialog, {
      data: {
        estimateid: this.sharedService.estimateid,
      }
    });
  }

  onDelete(item: TableData) {
    console.log(item);
    this.costEstimateService.delete(item).subscribe(msg=>{
      if(msg.error) {
        this.sharedService.errorMessage(msg.error);
        return;
      }
    },err=>{console.log(err);this.sharedService.error();});
  }

  onDownload(item: TableData) {
    this.costEstimateService.downloadCostEstimate(item.name).subscribe(msg => {
      console.log(msg);
      if(msg.error) {
        this.sharedService.errorMessage(msg.error);
        return;
      }
    }, err => { console.log(err);this.sharedService.error(); });
  }
  ngOnDestroy() {
    this.addNewSubscription.unsubscribe();
    this.removeCostEstimateSubscription.unsubscribe();
  }
}

@Component({
  selector: 'data-dialog',
  templateUrl: 'data-dialog.html',
})
export class DialogData {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
            public dialogRef: MatDialogRef<DialogData>,private sharedService: SharedDataService,
            private costEstimateService: CostEstimateService) { }

  onCreatedCostEstimate(name: string) {

    this.costEstimateService.addNewCostEstimate(name).subscribe(msg => {
      console.log(msg);
      if(msg.error) {
        this.sharedService.errorMessage(msg.error);
        return;
      }
      console.log(msg);
    }, err => { console.log(err);this.sharedService.error(); });
    this.dialogRef.close();
  }


}
