import { MatTableDataSource } from '@angular/material';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as CanvasJS from './canvasjs.min';
import { TableStatisticsData } from '../interfaces/table-statistics-data.interface';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { ExpenseItemGraph } from '../interfaces/expense-item-graph.interface';
import { ExpenseStatistics } from '../interfaces/expense-statistics.interface';
import { IncomeStatisticsItem } from '../interfaces/income-statistics-item.interface';
import { IncomeStatistics } from '../interfaces/income-statistics.interface';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  columnsToDisplay = ['Period', 'Troškovi', 'Prihodi', 'Razlika'];
  tableProps = ['period', 'outcome', 'income', 'difference'];
  displayedColumns = this.columnsToDisplay.slice();
  tableStatisticsData = new Array<TableStatisticsData>();
  dataSource = new MatTableDataSource(this.tableStatisticsData);
  graphExpenseData: Array<ExpenseStatistics>;
  graphIncomeData: Array<IncomeStatistics>;

  constructor(private sharedService: SharedDataService, private changeDetectorRefs: ChangeDetectorRef) {
    for(let i = 1; i < 10; i++) {
      this.tableStatisticsData.push({
        period: i.toString(),
        outcome: 0,
        income: 0,
        difference: 0
      });
    }
  }
  ngOnInit() {
		this.createIncomeChart();

    this.createComparingChart();

    this.createExpenseChart();
  }

  createExpenseChart() {
    const newChart = new CanvasJS.Chart("chartExpensesContainer", {
      theme:"light2",
      animationEnabled: true,
      zoomEnabled: true,
      exportEnabled: true,
  		title: {
  			text: "Kategorije Troškova"
      },
      showLegend: true,
      toolTip: {
        shared: "true"
      },
      axisX: {
        valueFormatString: "MMM YYYY",
        title: "Vrijeme"
      },
      axisY: {
        title: "Iznos",
        suffix: " kn"
      },
      data: this.getExpensesData()
    });

    newChart.render();
  }
  createIncomeChart() {
     const graph = new CanvasJS.Chart("chartIncomeContainer", {
      theme:"light2",
      animationEnabled: true,
      zoomEnabled: true,
      exportEnabled: true,
      title: {
        text: "Statistika Prihoda"
      },
      showLegend: true,
      toolTip: {
        shared: "true"
      },
      axisX: {
        valueFormatString: "MMM YYYY",
        title: "Vrijeme"
      },
      axisY: {
        title: "Iznos",
        suffix: " kn"
      },
      data: this.getIncomeData()
    });

    graph.render();
  }

  getIncomeData(): Array<IncomeGraph> {
    const retArray = new Array<IncomeGraph>();
    if(!this.graphIncomeData) return;

    this.graphIncomeData.forEach(income => {
      const dataPoints = new Array<IncomeStatisticsItem>();

      income.items.forEach(item => {
        dataPoints.push({
          label: item.label,
          y: item.y
        });
      });
      retArray.push({
        name: income.name,
        showInLegend: true,
        type: 'spline',
        dataPoints: dataPoints
      });
    });

    return retArray;
  }
  getExpensesData() : Array<ExpenseCategoriesGraph> {
    const arrayOfCategories = new Array<ExpenseCategoriesGraph>();
    if(!this.graphExpenseData) return;

    for(let i = 0; i < this.graphExpenseData.length; i++) {
      const dataPoints = new Array<ExpenseItemGraph>();
      console.log('cat: ', i, this.graphExpenseData[i].category.name);


      for( let j = 0; j < this.graphExpenseData[i].arrayOfValues.length; j++) {
        const values = this.graphExpenseData[i].arrayOfValues;

        dataPoints.push({
          label: values[j].label,
          y: values[j].y,
          z: 0.5
        });
      }
      /*
      for( let j = 1 ; j<10; j++) {
        const y = (Math.random()* 1000) % 150;
        //if max value use ex: { y: 520, indexLabel: "highest",markerColor: "red", markerType: "triangle" },
        const data = this.tableStatisticsData.find(item => item.period === j.toString());
        data.outcome = y;
        data.difference = Math.abs(data.difference - data.outcome);
        dataPoints.push({
          label: j.toString(),
          y: y,
          z: 0.5
        });
      }*/

      arrayOfCategories.push({
        type: "scatter",
        showInLegend: true,
        name: this.graphExpenseData[i].category.name,
        dataPoints: dataPoints
      });
    }
    console.log(arrayOfCategories);

    return arrayOfCategories;
  }

  createComparingChart() {
    const graph = new CanvasJS.Chart("chartComparingContainer", {
      theme:"light2",
      animationEnabled: true,
      zoomEnabled: true,
      exportEnabled: true,
      title: {
        text: "Statistika Troškova i Prihoda"
      },
      showLegend: true,
      toolTip: {
        shared: "true"
      },
      axisX: {
        valueFormatString: "MMM YYYY",
        title: "Vrijeme"
      },
      axisY: {
        title: "Iznos",
        suffix: " kn"
      },
      data: [
      {
        type: "splineArea",
        showInLegend: true,
        name: "Prihodi",
        dataPoints: this.getTotalIncome()
      },
      {
        type: "splineArea",
        showInLegend: true,
        name: "Troškovi",
        dataPoints: this.getTotoalExpenses()
      }]
    });

    graph.render();
  }
  getSalary(): Array<Object> {
    const salaryArray = new Array<Object>();
    for( let i = 1 ; i<10; i++) {
      const y = (Math.random()* 1000) % 150;
      //if max value use ex: { y: 520, indexLabel: "highest",markerColor: "red", markerType: "triangle" },

      salaryArray.push({
        label: i,
        y: y
      });
    }
    return salaryArray;
  }

  getTotalIncome(): Array<CompareGraphItems>{
    const incomeData = new Array<CompareGraphItems>();

    this.tableStatisticsData.forEach(data => {
      incomeData.push({
        label: data.period,
        y: data.income
      });
    });

    return incomeData;
  }

  getTotoalExpenses(): Array<CompareGraphItems>{
    const expensesData = new Array<CompareGraphItems>();

    this.tableStatisticsData.forEach(data => {
      expensesData.push({
        label: data.period,
        y: data.outcome
      });
    });

    return expensesData;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  updateGraphs(data) {
    this.graphExpenseData = data.graphData.slice();
    this.graphIncomeData = data.incomeData.slice();

    console.log('l9',this.graphIncomeData);
    this.createExpenseChart();
    this.createComparingChart();
    this.createIncomeChart();
  }

  updateTable(tableData: Array<TableStatisticsData>) {
    console.log(tableData);
    this.tableStatisticsData = tableData.slice();
    this.dataSource = new MatTableDataSource(this.tableStatisticsData);
  }
}

interface ExpenseCategoriesGraph {
  type: string;
  showInLegend: boolean;
  name: string;
  dataPoints: ExpenseItemGraph[];
}

interface IncomeGraph {
  type: string;
  showInLegend: boolean;
  name: string;
  dataPoints: IncomeStatisticsItem[];
}

interface CompareGraphItems {
  label: string;
  y: number;
}
