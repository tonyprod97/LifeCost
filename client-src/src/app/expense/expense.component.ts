import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { SharedDataService } from '../services/shared-data.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
  })
export class ExpenseComponent implements OnInit {
  currentCostEstimate: string;

  constructor(private router: Router,private expenseService: ExpenseService,
              private sharedService: SharedDataService) {}

  ngOnInit() {

    this.currentCostEstimate = this.sharedService.activeCostEstimate;
  }
}
