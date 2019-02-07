import { Component, OnInit, ViewChild, Input, OnDestroy, ElementRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { SharedDataService } from '../../services/shared-data.service';
import { Subscription } from 'rxjs';
import { ExpenseItem } from '../../interfaces/expense-item.interface';
import { ExpenseItemService } from '../../services/expense-item.service';


@Component({
  selector: 'app-expense-content',
  templateUrl: './expense-content.component.html',
  styleUrls: ['./expense-content.component.css']

})
export class ExpenseContentComponent implements OnInit, OnDestroy {
  limit = false;
  startingDateSelected = false;
  @ViewChild('renderedExpense') current: ExpenseItem;
  @ViewChild('selectionElementRef') selectionElementRef;
  @ViewChild('comment') comment;
  timeOption: string;
  frequencyMessage = 'Početak evidentiranja';
  activeCategory: string;
  subcategoryActive: boolean;
  subscriptionOnCategory: Subscription;
  categorySubs: Subscription;
  hideItemForm: boolean;
  newItem: ExpenseItem ;
  addSubcategoryMode: boolean;
  subCategoryName: string;
  subscriptionItemsForCategory: Subscription;
  isUpdating = false;
  receivedMode: boolean;
  today = new Date();

  @Input() itemsList: Array<ExpenseItem>;

  constructor(private router: Router, private expenseService: ExpenseService,
              private sharedService: SharedDataService, private itemService: ExpenseItemService) {

    this.hideItemForm = true;

    this.newItem = {
      id: null,
      categoryid: sharedService.allCategories.find(cat => cat.name == sharedService.activaCategoryName).categoryid,
      label: '',
      comment: '',
      price: null,
      evaluate: null,
      fromDate:null,
      toDate:null
    };

    this.current = this.newItem;

    if(this.activeCategory === undefined) {
      this.activeCategory = sharedService.activaCategoryName;
    }

    this.receivedMode = sharedService.receivedMode;
  }

  ngOnInit() {
    this.subscriptionItemsForCategory = this.itemService.getSubjectForItems().subscribe(items =>
      {
        this.itemsList = items;
        this.subscriptionOnCategory = this.sharedService.getActiveCategorySubject().subscribe( category => {
          this.activeCategory = category;
          this.addSubcategoryMode = false;
        });
        this.subcategoryActive = this.sharedService.allCategories.find(cat => cat.name === this.activeCategory).parentid !== null;
      });
      this.current = this.newItem;

      this.categorySubs = this.sharedService.getActiveCategorySubject().subscribe( cat =>
        this.hideItemForm = true
      );
   }


  chosenDateHandler(data) {
    data.datepicker.close();

    if(this.frequencyMessage === 'Datum evidentiranja') {
      this.limit = false;
      this.current.toDate = data.date;
      this.current.fromDate = data.date;
      return;
    }

    if(this.frequencyMessage === 'Kraj evidentiranja') {
      this.limit = false;
      this.current.toDate = data.date;
    } else {
      this.current.fromDate = data.date;
    }
    this.frequencyMessage = this.startingDateSelected ? 'Početak evidentiranja' : 'Kraj evidentiranja';
    this.startingDateSelected = !this.startingDateSelected;
  }

  onOptionsSelected(options) {
    this.timeOption = options.value;
    this.limit = true;
    if(this.timeOption === 'once') {
      this.frequencyMessage = 'Datum evidentiranja';
    } else
    {
      this.frequencyMessage = 'Početak evidentiranja';
    }
  }

  enableButton() {
    if(this.timeOption === 'once') {
      return this.current.fromDate && this.current.toDate && this.current.label && this.current.price;
    } else {
      return this.current.fromDate && this.current.toDate && this.current.label && this.current.price && this.current.evaluate;
    }
  }
  onSave() {
    console.log('l1:',this.comment,this.current);

    if(!this.isUpdating) {

      this.itemsList.push(this.current);
      if(this.timeOption === 'once') this.current.evaluate = 1;
      this.itemService.addNewItem(this.current, this.activeCategory).subscribe(data => {
        console.log(data);
        if(data.error) {
          this.itemsList.pop();
          this.sharedService.errorMessage(data.error);
          return;
        }
        this.itemService.collectAllItems();
      }, err => {
        console.log(err);
        this.sharedService.error();
      });
    } else {
      this.itemService.updateItem(this.current).subscribe(data => {
        console.log(data);
        if(data.error) {
          this.sharedService.errorMessage(data.error);
          return;
        }
        this.itemService.collectAllItems();
      }, err => {
        console.log(err);
        this.sharedService.error();
      });
    }

    this.newItem = {
      id: null,
      categoryid: this.sharedService.allCategories.find(cat => cat.name == this.sharedService.activaCategoryName).categoryid,
      label: '',
      comment: '',
      price: null,
      evaluate: null,
      fromDate:null,
      toDate:null
    };
    this.timeOption = null;
    this.current = this.newItem;
    this.hideItemForm = !this.hideItemForm;
    this.selectionElementRef.value = null;
  }
  onDeleteItem() {
    //delete from db
    this.itemService.deleteItem(this.current).subscribe(data => {
      console.log(data);
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        return;
      }
      this.itemService.collectAllItems();
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
    this.itemsList = this.itemsList.filter(item => item.label!== this.current.label);

    if(this.itemsList.length === 0) this.onAddNewItem();
    else {
      this.current = this.itemsList[0];
    }
    this.hideItemForm = !this.hideItemForm;
  }

  onDeleteCategory(label) {
    this.expenseService.deleteCategory(label).subscribe(data => {
      console.log(data);
      if(!data.error) {
        this.sharedService.deleteCategories.next(label);
        this.sharedService.activeCategory.next('');
      } else {
        this.sharedService.errorMessage(data.error);
      }
    }, err => {
      console.log(err);
      this.sharedService.error();
    });

  }

  onAddNewItem() {
    this.newItem = {
      id: null,
      categoryid: this.sharedService.allCategories.find(cat => cat.name == this.sharedService.activaCategoryName).categoryid,
      label: '',
      comment: '',
      price: null,
      evaluate: null,
      fromDate:null,
      toDate:null
    };
    this.selectionElementRef.value = null;
    this.isUpdating = false;
    this.current = this.newItem;
    this.hideItemForm = false;
    this.timeOption = null;

  }

  onUpdateCategoryName() {
    const category = this.sharedService.allCategories.find(c => c.name === this.sharedService.activaCategoryName);

    this.expenseService.updateCategoryName(this.activeCategory,category.categoryid).subscribe(data => {
      if(data.error) {
        this.sharedService.errorMessage(data.error);
      } else {
        this.sharedService.addSubCategories.next();
        this.subCategoryName = null;
      }
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
  }

  onExpenseItemClicked(item) {
    console.log('CLICKED item')
    let label = item.value;
    let itemFromArray = this.itemsList.find(x => x.label === label);
    this.isUpdating = true;
    this.current = itemFromArray;
    this.hideItemForm = false;

    if(this.receivedMode) {
      this.isUpdating = false;
    }
  }

  onAddNewSubcategory() {
    let parentCat = this.sharedService.allCategories.find(c => c.name === this.activeCategory);

    this.addSubcategoryMode = !this.addSubcategoryMode;

    this.expenseService.createSubCategory( parentCat.categoryid,this.subCategoryName,this.sharedService.estimateid).subscribe(data => {
      console.log(data);
      if(data.error) {
        this.sharedService.errorMessage(data.error);
        this.subCategoryName = null;
      } else {
        this.sharedService.addSubCategories.next();
        this.subCategoryName = null;
      }
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
  }
  ngOnDestroy() {
    this.subscriptionOnCategory.unsubscribe();
    this.subscriptionItemsForCategory.unsubscribe();
    this.categorySubs.unsubscribe();
  }
}


