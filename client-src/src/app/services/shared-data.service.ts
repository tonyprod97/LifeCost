import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../interfaces/category.interface';
import { TableData } from '../interfaces/table-data.interface';
import { CostEstimate } from '../interfaces/cost-estimate.interface';
import { DialogErrorService } from './popup/dialog-error.service';
import { IncomeItem } from '../interfaces/income-item.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  activeCategory = new Subject<string>();
  activaCategoryName: string;
  activeCostEstimate: string;
  costEstimateTitle: string;
  allCategories: Category[];
  deleteCategories = new Subject<any>();
  addSubCategories = new Subject<any>();
  estimateid: string;
  costEstimates: Array<CostEstimate> = new Array();
  receivedMode: boolean;
  incomeList: Array<IncomeItem>;

  constructor(private router: Router, private errorDialogService: DialogErrorService){}

  errorMessage(message: string) {
    this.errorDialogService.openErrorDialog(message);
  }

  error() {
    this.router.navigate(['/error']);
  }
  getActiveCategorySubject(): Observable<string> {
    return this.activeCategory.asObservable();
  }
  getDeleteCategoriesSubject(): Observable<any> {
    return this.deleteCategories.asObservable();
  }

  getAddSubCategoriesSubject(): Observable<any> {
    return this.addSubCategories.asObservable();
  }
}
