import { IncomeStatisticsItem } from './income-statistics-item.interface';
/**
 * exp:{
 *   name: 'Moja plaća',
 *   items: [{
 *           label: 'Ožujak',
 *           y: 2200,
 *          },....]
 * }
*/

export interface IncomeStatistics {
  name: string;// name of income exp: salary, apartmanes...
  items: IncomeStatisticsItem[];// data for income
}
