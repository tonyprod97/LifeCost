import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IncomeItem } from './../../interfaces/income-item.interface';
import { Router } from '@angular/router';
import { IncomeItemService } from './../../services/income-item.service';
import { IncomeService } from './../../services/income.service';
import { SharedDataService } from '../../services/shared-data.service';


@Component({
  selector: 'app-income-content',
  templateUrl: './income-content.component.html',
  styleUrls: ['./income-content.component.css']
})
export class IncomeContentComponent implements OnInit {

  @ViewChild('renderedIncome') currentIncome: IncomeItem;
  showForm = false; //poslje stavi false i promjeni pomocu metode
  isItUpdate: boolean;
  currentIncomeSubscription: Subscription;
  isItUpdateSubscription: Subscription;
  newIncome: IncomeItem;

  timeOption: string;
  frequencyMessage = 'Početak evidentiranja';
  limit = false;
  startingDateSelected = false;
  @ViewChild('selectionElementRef') selectionElementRef;
  @ViewChild('comment') comment: string;
  /*
  @ViewChild('renderedExpense') current: IncomeItem;
  @ViewChild('selectionElementRef') selectionElementRef;
  //@ViewChild('comment') comment: string;


  subscriptionIncomeSelected: Subscription;
  subscriptionIsUpdating: Subscription;
  activeIncome: string;+++++
  hideItemForm: boolean;----
  showForm = false;
  newItem: IncomeItem;+++++----
  howMany: number;

  isUpdating = true;
  today = new Date();
*/
  constructor(private router: Router, private sharedService: SharedDataService
    ,private incomeService: IncomeService, private incomeItemService: IncomeItemService) {
    this.currentIncome = {
      id: null,
      label: null,
      comment: null,
      price: null,
      evaluate: null,
      fromDate: null,
      toDate: null
    };
    this.currentIncomeSubscription = this.incomeItemService.getCurrentIncomeObservable().subscribe(currentIncome => {
      this.currentIncome = currentIncome;
      this.showForm = true;
      console.log(this.currentIncome);
    });
    this.isItUpdateSubscription = this.incomeItemService.getIsItUpdateObservable().subscribe(isItUpdate => {
      this.isItUpdate = isItUpdate;
      console.log(isItUpdate);
    });
    /*
      this.subscriptionIsUpdating = this.incomeItemService.getIsUpdatingObservable().subscribe(showForm => {
        this.showForm = true;
        this.isUpdating = showForm;
        this.newItem = {
          id: null,
          label: '',
          comment: '',
          value: null,
          evaluate: null,
          fromDate: null,
          toDate: null
        };
        this.current = this.newItem;
      });
  */
  }

  enableButton() {
    if(this.timeOption === 'once') {
      return this.currentIncome.fromDate && this.currentIncome.toDate && this.currentIncome.label && this.currentIncome.price;
    } else {
      return this.currentIncome.fromDate && this.currentIncome.toDate &&
       this.currentIncome.label && this.currentIncome.price && this.currentIncome.evaluate;
    }
  }

  resetItem() {
    this.currentIncome = {
      id: null,
      label: null,
      comment: null,
      price: null,
      evaluate: null,
      fromDate: null,
      toDate: null
    };

    this.timeOption = null;
  }

  chosenDateHandler(data) {
    data.datepicker.close();

    if (this.frequencyMessage === 'Datum evidentiranja') {
      this.limit = false;
      this.currentIncome.toDate = data.date;
      this.currentIncome.fromDate = data.date;
      return;
    }

    if (this.frequencyMessage === 'Kraj evidentiranja') {
      this.limit = false;
      this.currentIncome.toDate = data.date;
    } else {
      this.currentIncome.fromDate = data.date;
    }
    this.frequencyMessage = this.startingDateSelected ? 'Početak evidentiranja' : 'Kraj evidentiranja';
    this.startingDateSelected = !this.startingDateSelected;
  }

  onOptionsSelected(options) {
    console.log(options.value);
    this.timeOption = options.value;
    this.limit = true;
    if (this.timeOption === 'once') {
      this.frequencyMessage = 'Datum evidentiranja';
    } else {
      this.frequencyMessage = 'Početak evidentiranja';
    }
  }

  updateItem() {
    this.incomeItemService.updateItem(this.currentIncome).subscribe(data => {
      console.log('l8: ',data,'sub',this.incomeService.IncomesSubject);
      if (data.error) {
        this.sharedService.errorMessage(data.error);
        return;
      }
      this.incomeService.IncomesSubject.next();
    },
      err => {
      this.sharedService.error();
    });


  }
  onCreateIncome() {
    this.incomeService.createIncome(this.currentIncome, this.sharedService.estimateid).subscribe(data => {
      console.log('l6: ',data);
      if (data.error) {
        this.sharedService.errorMessage(data.error);
          return;
        }
        this.incomeService.IncomesSubject.next();
        this.resetItem();
      },
        err => {
        this.sharedService.error();
      });

    /*
    if (!this.isItUpdate) {
      this.incomeItemService.currentIncomeSubject.next(this.currentIncome);
      this.incomeItemService.createIncome(this.currentIncome, this.getEstimateId()).subscribe(data => {
        console.log(data);
        if (data.error) {
          this.error();
          return;
        }
        this.incomeItemService.collectAllIncomes();
      }, err => {
        console.log(err);
        this.error();
      });
    } else {
      this.incomeItemService.updateItem(this.currentIncome).subscribe(data => {
        console.log(data);
        if (data.error) {
          this.error();
          return;
        }
        this.incomeItemService.collectAllIncomes();
      }, err => {
        console.log(err);
        this.error();
      });
    }*/

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
  this.currentIncome = this.newIncome;
}


onDeleteIncome() {
  this.incomeItemService.deleteIncome(this.currentIncome).subscribe(data => {
    console.log(data);
    if (data.error) {
      this.error();
      return;
    }
    //this.incomeService.collectAllIncomes();
  }, err => {
    console.log(err);
    this.error();
  });
}


error() {
  this.router.navigate(['/error']);
}

getEstimateId(): string {
  const url = this.router.url.split('/');
  return url[url.length - 2];
}


ngOnInit() {
  /*this.subscriptionIncomeSelected = this.incomeService.getActiveIncomeObservable().subscribe(activeIncome => {
    console.log(activeIncome);
    this.current = activeIncome;
    //this.comment = activeIncome.comment;
    this.activeIncome = activeIncome.label;
    //this.hideItemForm = false;
  });
  this.newItem = {
    id: null,
    label: '',
    comment: '',
    value: null,
    evaluate: null,
    fromDate: null,
    toDate: null
  };
  this.current = this.newItem;*/
}
  /*


  onCreateIncome() {
    if (!this.isUpdating) {
      if (this.timeOption === 'once') {
        this.current.evaluate = 1;
      }
      this.incomeItemService.addNewIncome(this.current).subscribe(data => {
        console.log(data);
        if (data.error) {
          this.error();
          return;
        }
        this.incomeService.collectAllIncomes();
      }, err => {
        console.log(err);
        this.error();
      });
    }
    this.newItem = {
      id: null,
      label: '',
      comment: '',
      value: null,
      evaluate: null,
      fromDate: null,
      toDate: null
    };
    this.timeOption = null;
    this.current = this.newItem;
    //this.hideItemForm = !this.hideItemForm;
    //this.selectionElementRef.value = null;
  }


  onDeleteIncome(incomeItem: IncomeItem) {
    this.incomeItemService.deleteIncome(incomeItem).subscribe(data => {
      console.log(data);
      if (data.error) {
        this.error();
        return;
      }
      this.incomeService.collectAllIncomes();
    }, err => {
      console.log(err);
      this.error();
    });
    this.newItem = {
      id: null,
      label: '',
      comment: '',
      value: null,
      evaluate: null,
      fromDate: null,
      toDate: null
    };

    this.current = this.newItem;
  }

  onUpdateIncome(incomeItem: IncomeItem) {
    this.incomeItemService.updateIncome(incomeItem).subscribe(data => {
      console.log(data);
      if (data.error) {
        this.error();
        return;
      }
      this.incomeService.collectAllIncomes();
    }, err => {
      console.log(err);
      this.error();
    });
  }
  */
}

