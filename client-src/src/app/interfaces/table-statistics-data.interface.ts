/**
 * exp: {
 *   Period: 'Travanj-Rujan',
 *   Troškovi: 5000,
 *   Prihodi: 6000,
 *   Razlika: 1000
 * }
*/
export interface TableStatisticsData {
  period: string;
  outcome: number;
  income: number;
  difference: number;
}
