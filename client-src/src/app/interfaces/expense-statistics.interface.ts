import { Category } from './category.interface';
import { ExpenseItemGraph } from './expense-item-graph.interface';

/**
 * exp:
 * {
 *   category: {
 *               name: 'Rezije';
 *               categoryid: 1;
 *               parentid: null;
 *             },
 *    arrayOfValues: [{
 *       {
 *         label: 'Ožujak',
 *         y: 2200,
 * 	       z: 0.5
 *       }
 *    }, ...]
 * }
 *
*/

export interface ExpenseStatistics {
  category: Category;
  arrayOfValues: ExpenseItemGraph[];
}
