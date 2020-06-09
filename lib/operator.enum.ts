/**
 * Enumerates mathematical operators which have left and right hand side.
 * That is, expression always look like:  LHS OP RHS
 * The order defines the operator precedence!
 */
export enum Operator {
  POWER = '^',
  DIVISION = '/',
  TIMES = '*',
  ELEM_W_TIMES = '%',
  MINUS = '-',
  PLUS = '+'
}
