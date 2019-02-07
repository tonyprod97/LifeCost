import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { SharedDataService } from '../services/shared-data.service';
import { GraphService } from '../services/graph.service';
import { TableData } from '../interfaces/table-data.interface';
import { ExpenseStatistics } from '../interfaces/expense-statistics.interface';
import { TableStatisticsData } from '../interfaces/table-statistics-data.interface';

//const moment = require('moment');
import * as moment from 'moment';

@Component({
  selector: 'app-time-scale',
  templateUrl: './time-scale.component.html',
  styleUrls: ['./time-scale.component.css']
})
export class TimeScaleComponent implements OnInit {
  startingDateMessage = 'Odaberite početni datum';
  endingDateMessage = 'Odaberite završni datum';
  startingDate: string; //Date;
  endingDate: string; //Date;
  categories: string[];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  monthRange: number;
  localFormat: string;
  thisYear: Date;
  previousYear: Date;

  @Output() displayTableDataChanged = new EventEmitter<Array<TableStatisticsData>> ();
  @Output() displayGraphDataChanged = new EventEmitter<Array<ExpenseStatistics>> ();

  constructor(private sharedService: SharedDataService,private graphService: GraphService) { }

  ngOnInit() {
    this.thisYear = new Date();
    this.endingDate = this.thisYear.toString();
    this.previousYear = new Date();
    this.previousYear.setMonth(this.previousYear.getMonth() - 12);
    this.startingDate = this.previousYear.toString();
    this.monthRange = 1;
    this.onSubmit();
    this.localFormat = 'DD/MM/YYYY'; //moment.localeData().longDateFormat('L');
  }

  //dateToString(date: Date): string {
  //
  //  let month = '' + (date.getMonth() + 1);
  //  let day = '' + date.getDate();
  //  let year = '' + date.getFullYear();
  //
  //  if (month.length < 2) month = '0' + month;
  //  if (day.length < 2) day = '0' + day;
  //
  //  return [day, month, year].join('.');
  //
  //}
  //
  //parseDate(date: string) : string {
  //
  //  var parts: string[] = date.split(".");
  //
  //  if (parts.length != 3) {
  //    return null; // invalid format
  //  }
  //
  //  var nums: string[] = [];
  //
  //  parts.forEach((element) => {
  //    nums.push(element);
  //  });
  //
  //  return nums.join('-');
  //}

  chosenDateHandler(data, isStartingDate: boolean) {
    console.log(data.date)
    //send starting/ending date to db depending on dateMessage
    if (isStartingDate) {
      this.startingDate = data.date; //this.parseDate(data.date); //new Date(Date.parse(data.date));
    } else {
      this.endingDate = data.date; //this.parseDate(data.date); //new Date(Date.parse(data.date));
    }
    console.log(this.startingDate, this.endingDate);
    console.log(this.localFormat);

    data.datepicker.close();
  }

  onSliderChanged(event: MatSliderChange) {
    console.log(event);
    this.monthRange = +event.value;
    //send event.value to db
  }

  onSubmit() {
    this.graphService.getData(moment.utc(this.startingDate, this.localFormat).toISOString(), moment.utc(this.endingDate, this.localFormat).toISOString(), this.monthRange).subscribe(data => {
      if(data.error) {this.sharedService.errorMessage(data.error);return;};

      console.log(data);
      this.displayTableDataChanged.emit(data.data.tableData);
      this.displayGraphDataChanged.emit(data.data);
    }, err => {
      console.log(err);
      this.sharedService.error();
    });
  }

  disableSubmitButton() {
    return !(this.monthRange && this.startingDate && this.endingDate);
  }

}

