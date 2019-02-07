import { DialogError, DialogErrorService } from './services/popup/dialog-error.service';
import { RegisterComponent } from './user/register/register.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomePageComponent, DialogData } from './home-page/home-page.component';
import { UserService } from './services/user.service';
import { CostEstimateComponent, SenderDataDialog, NameChangerDialog } from './cost-estimate/cost-estimate.component';
import { ExpenseComponent } from './expense/expense.component';
import { IncomeComponent } from './income/income.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { ExpenseCategoriesComponent } from './expense/expense-categories/expense-categories.component';
import { LogInComponent } from './user/log-in/log-in.component';
import { UserModule } from './user/user.module';
import { ExpenseContentComponent } from './expense/expense-content/expense-content.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { CalendarComponent } from './calendar/calendar.component';
import { TimeScaleComponent } from './time-scale/time-scale.component';
import { ExpenseService } from './services/expense.service';
import { SharedDataService } from './services/shared-data.service';
import { ProfileComponent } from './user/profile/profile.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { IncomeContentComponent } from './income/income-content/income-content.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomePageComponent,
    CostEstimateComponent,
    ExpenseComponent,
    IncomeComponent,
    ExpenseCategoriesComponent,
    LogInComponent,
    RegisterComponent,
    ExpenseContentComponent,
    StatisticsComponent,
    CalendarComponent,
    TimeScaleComponent,
    DialogData,
    SenderDataDialog,
    NameChangerDialog,
    ProfileComponent,
    ErrorPageComponent,
    DialogError,
    IncomeContentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    UserModule,
    MatSidenavModule,
    MatListModule
  ],
  providers: [
    UserService,
    ExpenseService,
    SharedDataService,
    DialogErrorService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DialogData,
    SenderDataDialog,
    NameChangerDialog,
    DialogError
  ]
})
export class AppModule { }
