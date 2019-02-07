import { TimeScaleComponent } from './time-scale/time-scale.component';
import { ExpenseContentComponent } from './expense/expense-content/expense-content.component';
import { ExpenseComponent } from './expense/expense.component';
import { CostEstimateComponent } from './cost-estimate/cost-estimate.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { IncomeComponent } from './income/income.component';
import { LogInComponent } from './user/log-in/log-in.component';
import { RegisterComponent } from './user/register/register.component';
import { ExpenseCategoriesComponent } from './expense/expense-categories/expense-categories.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AuthenticationGuard } from './gurad/authentication.guard';
import { ProfileComponent } from './user/profile/profile.component';
import { ErrorPageComponent } from './error-page/error-page.component';

const appRoutes = [
  {
    path: 'troskovnik/:id', component: CostEstimateComponent, canActivate: [AuthenticationGuard],
    children: [
      {
        path: 'troskovi', component: ExpenseComponent,
        children: [{ path: ':category', component: ExpenseContentComponent }]
      },
      { path: 'prihodi', component: IncomeComponent },
      { path: 'statistika', component: StatisticsComponent }
    ]
  },
  { path: 'prijava', component: LogInComponent },
  { path: 'registracija', component: RegisterComponent },
  { path: 'profil', component: ProfileComponent },
  { path: 'naslovna', component: HomePageComponent },
  { path: '', redirectTo: '/naslovna', pathMatch: 'full' },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
