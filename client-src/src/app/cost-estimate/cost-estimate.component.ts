import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../services/shared-data.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { CostEstimateService } from '../services/cost-estimate.service';
import { ConnectedUsers } from '../interfaces/connected-users.interface';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-cost-estimate',
  templateUrl: './cost-estimate.component.html',
  styleUrls: ['./cost-estimate.component.css']
})
export class CostEstimateComponent implements OnInit {
  navLinks = [{
                label: 'Troškovi',
                path: 'troskovi'
               },
               {
                label: 'Prihodi',
                path: 'prihodi'
              },
            {
              label: 'Statistika',
              path: 'statistika'
            }];

  constructor(private router: Router, public dialog: MatDialog, private sharedService: SharedDataService,
    private costEstimateService: CostEstimateService) { }

  ngOnInit() {
    console.log(this.router.url);
    this.router.navigate([this.router.url, 'troskovi']);
  }

  onSend() {
    this.dialog.open(SenderDataDialog, {
      data: {
        costEstimate: this.sharedService.activeCostEstimate
      }
    });
  }

  onDownload(holder) {
    this.costEstimateService.downloadCostEstimate(this.sharedService.activeCostEstimate).subscribe(data => {
      console.log(data);
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        return;
      }

      const file = new Blob([data], {type: 'application/pdf'});
      saveAs(file, this.sharedService.activeCostEstimate + '.pdf');
    }, err => { console.log(err);this.sharedService.error(); });
  }
}

@Component({
  selector: 'name-changer-dialog',
  templateUrl: 'name-changer-dialog.html',
})
export class NameChangerDialog {
  estimateid: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: NameChangerDialog, public dialogRef: MatDialogRef<NameChangerDialog>,
    private costEstimateService: CostEstimateService, private sharedService: SharedDataService) { }

  onNameChangeConfirm(name: string) {
    this.costEstimateService.updateCostEstimate(name, this.data.estimateid).subscribe(msg => {
      console.log(msg);
      if (msg.error) {
        this.sharedService.error();
        return;
      }
    }, err => { console.log(err); this.sharedService.error(); });
    this.dialogRef.close();
  }
}



@Component({
  selector: 'sender-data-dialog',
  templateUrl: 'sender-data-dialog.html',
})
export class SenderDataDialog implements OnInit{
  connectedUsers: ConnectedUsers[];
  enableButton: boolean;
  costEstimate: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: SenderDataDialog,
            public dialogRef: MatDialogRef<SenderDataDialog>,
            private costEstimateService: CostEstimateService, private sharedService: SharedDataService) {
             }

  onSendConfirmed(userIdentity: string, el) {
    this.costEstimateService.sendCostEstimate(this.data.costEstimate, userIdentity, el.value).subscribe(msg => {
      console.log(msg);
      if(msg.error) {
        this.sharedService.errorMessage(msg.error);
        return;
      }
    }, err => { console.log(err);this.sharedService.error(); });
    this.dialogRef.close();
  }

  ngOnInit() {
    this.costEstimateService.getConnectedUsers().subscribe(data => {
      console.log(data);
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        return;
      }
      this.connectedUsers = data.data;
    }, err => { console.log(err);this.sharedService.error(); });
  }

}
