import { FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import {default as _rollupMoment, Moment} from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CalendarComponent implements OnInit {


  date;

  @Input() initialValue;
  @Input() message;
  @Output() dateChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
    console.log('init val: ',this.initialValue)
    this.date = new FormControl(this.initialValue);
  }

  chosenDateHandler(datepicker: MatDatepicker<Moment>, event: MatDatepickerInputEvent<Date>,date) {
    this.dateChange.emit({ datepicker: datepicker,event: event,date: date});
  }


}
