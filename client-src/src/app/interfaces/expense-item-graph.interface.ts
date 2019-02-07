/**
 * exp: {
 *   label: 'Ožujak',
 *   y: 2200,
 * 	 z: 0.5
 * }
*/

export interface ExpenseItemGraph {
  label: string; // label on x axis, it should be date or formated string that is going to be displayed
  y: number; // value of category on graph, it represents y axis values
  z: number; // size for zoom of defining property, set it to 0.5
}
