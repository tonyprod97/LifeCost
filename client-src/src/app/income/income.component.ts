import { Component, OnInit, Input } from '@angular/core';
import { IncomeItem } from './../interfaces/income-item.interface';
import { IncomeService } from '../services/income.service';
import { IncomeItemService } from '../services/income-item.service';
import { SharedDataService } from '../services/shared-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IncomeContentComponent } from './income-content/income-content.component';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css']
})
export class IncomeComponent implements OnInit {
  @Input() incomeList: Array<IncomeItem>;
  currentCostEstimate: string;
  currentIncome: IncomeItem;
  updatedIncomeListSubscription: Subscription;
  deleteIncomeSubscription: Subscription;
  createIncomeSubscription: Subscription;
  updateIncomeSubscription: Subscription;
  /*subscriptionIncomeItems: Subscription;
  estimateid: string;
  currentCostEstimate: string;
  activeIncome: IncomeItem;
  activeIncomeid: string;
  incomeid: string;
  subscriptionIncomeSelected: Subscription;
  incomeDeleteSubscriber: Subscription;
  incomeAddSubscriber: Subscription;
  @Input() incomeList: Array<IncomeItem>;
  */
  constructor(private router: Router, private incomeService: IncomeService,
    private sharedService: SharedDataService, private incomeItemService: IncomeItemService) {
    this.updatedIncomeListSubscription = this.incomeService.getIncomesObservable().subscribe(msg => {
      incomeService.collectAllIncomes().subscribe(data => {
        if (data.error) {
          this.sharedService.errorMessage(data.error);
          return;
        }
        this.incomeList = data.data.slice();
        sharedService.incomeList = data.data;
        //this.incomeListSubject.next(this.incomeList);
        console.log('l1:', this.incomeList);
      });
    });

    this.deleteIncomeSubscription = this.incomeItemService.getDeleteIncomeObservable().subscribe(incomeItem => {
      for (let i = 0; i < this.incomeList.length; i++) {
        if (this.incomeList[i] === incomeItem) {
          this.incomeList.splice(i, 1);
        }
      }
    });
  }

  onSelectIncome(incomeid: string) { //za html
    this.currentIncome = this.incomeItemService.getCurrentIncome(incomeid, true);
    console.log(this.currentIncome);
  }


  addNewIncomeButton() {
    let newIncome: IncomeItem;
    newIncome = {
      id: null,
      label: 'Novi prihod',
      comment: null,
      price: null,
      evaluate: 1,
      fromDate: null,
      toDate: null
    };
    this.currentIncome = newIncome;
    this.incomeItemService.currentIncomeSubject.next(this.currentIncome);
    this.incomeItemService.isItUpdateSubject.next(false);
    this.currentIncome = newIncome;
  }

  ngOnInit() {
    this.incomeService.IncomesSubject.next();
  }
  /*

    onAddIncome() {
      let incomeItem = {
        id: null,
        label: 'Novi',
        comment: null,
        value: null,
        evaluate: null,
        fromDate: null,
        toDate: null
      };
      this.incomeAddSubscriber = this.incomeItemService.addNewIncome(incomeItem).subscribe(data => {
        this.activeIncome = data;
        this.incomeService.collectAllIncomes();
      });


    }

    onChange() {
      this.incomeService.collectAllIncomes();
    }

    onActivateIncome(id: string) { //ide u html
      console.log(id);
      //this.incomeItemService.onClick();
      this.activeIncome = this.incomeService.getActiveIncome(id);
      this.activeIncome = this.incomeService.getActiveIncome(id);
      this.incomeService.onSelectIncome(id);
    }
  */

}
