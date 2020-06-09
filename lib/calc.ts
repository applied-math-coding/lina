import { Matrix } from './matrix';
import { Operator } from './operator.enum';
import { BuildInMathFn } from './build-in-math-fn.enum';
import { mat } from './mat';

export type CalculationOperators = Operator | BuildInMathFn;
export enum Assignment { EQ = '=' };
export type OperatorSymbol = Assignment | Bracket | CalculationOperators | Separator;
export type ValueType = Matrix | number;
export type ExpressionPart = ValueType | ValueType[] | OperatorSymbol | Assignment;
export type Expression = ExpressionPart[];

export enum Separator {
  COMMA = ','
}

export enum Bracket {
  LEFT = '(',
  RIGHT = ')'
}

// sorting ensures for instance: 'sinh' is parsed before 'sin'
export const all_operator_symbols: OperatorSymbol[] = [
  ...Object.values(Assignment),
  ...Object.values(Bracket),
  ...Object.values(Separator),
  ...Object.values(Operator),
  ...Object.values(BuildInMathFn)
].sort((a, b) => b.length - a.length);

// for performance
export const operator_map = Object.values(Operator)
  .reduce((prev, curr) => ({ ...prev, [curr]: curr }), {});
export const isOperator = (op: OperatorSymbol): boolean => !!operator_map[op];

export const buildInMathFn_map = Object.values(BuildInMathFn)
  .reduce((prev, curr) => ({ ...prev, [curr]: curr }), {});
export const isBuildInMathFn = (op: OperatorSymbol): boolean => !!buildInMathFn_map[op];

export const is_number = (v: ValueType): boolean => typeof v === 'number';
export const is_matrix = (v: ValueType): boolean => v instanceof Matrix;

export function operator_precedence(a: CalculationOperators, b: CalculationOperators): number {
  const a_is_build_in = isBuildInMathFn(a);
  const b_is_build_in = isBuildInMathFn(b);
  if (a_is_build_in && b_is_build_in) {
    return b.length - a.length;
  } else if (a_is_build_in) {
    return -1;
  } else if (b_is_build_in) {
    return 1;
  } else {
    return Object.keys(Operator).findIndex(e => e === a) - Object.keys(Operator).findIndex(e => e === b);
  }
}

//TODO add exceptions
export function calc<T extends (ValueType | void) = (ValueType | void)>(operators: TemplateStringsArray, ...vars: ValueType[]): T {
  try {
    let expression: Expression = operators
      .map(o => o.replace(/\s/g, ''))
      .map((e, idx) => {
        const variable = vars[idx] !== undefined ? [vars[idx]] : [];
        return e !== '' ? [...splitOperators(e), ...variable] : [...variable];
      })
      .reduce((prev, curr) => [...prev, ...curr], []);
    //TODO transform shorthand minus-expression: 5/-[(, v]  to 5/(-[(, v]) the same with *, ^, %, +
    expression = transformSignOperator(expression);

    if (expression[1] === Assignment.EQ) {
      const res = compute(expression.slice(2)) as Matrix;
      assignValue(expression[0] as Matrix, res);
    } else if (expression.length > 1) {
      return compute(expression) as T;
    } else {
      return expression[0] instanceof Matrix ? expression[0].clone() as T : expression[0] as T;
    }
  } catch (e) {
    throw new Error(e);  // this re-throw ensures better error traces for consumers
  }
}

function assignValue(target: Matrix, v: ValueType) {
  if (typeof v === 'number') {
    target.fill(v);
  } else {
    for (let { value, row, col } of v.iter()) {
      target.set(row, col, value);
    }
  }
}

/**
 * Transforming all occurrences '-' which are not between expressions,
 * that is a)-b, a-b to (-1)* *
 * @param expr
 */
export function transformSignOperator(expr: Expression = []): Expression {
  const sign_idx = expr.findIndex((e, idx) => e === Operator.MINUS
    && !is_number(expr[idx - 1] as ValueType)
    && !is_matrix(expr[idx - 1] as ValueType)
    && !(expr[idx - 1] === Bracket.RIGHT));
  if (sign_idx > -1) {
    return [
      ...expr.slice(0, sign_idx),
      Bracket.LEFT, -1, Bracket.RIGHT, Operator.TIMES,
      ...transformSignOperator(expr.slice(sign_idx + 1))
    ];
  } else {
    return expr;
  }
}

/**
 * Given an expression of form '(a+b)*c-sin(d)', it intends to produce an array containing
 * [(,a,+,b,),*,c,-,sin,(,d,)].
 * @param s: string
 * @param operatorsToSplit
 */
export function splitOperators(s: string, opsToSplit: OperatorSymbol[] = all_operator_symbols): ExpressionPart[] {
  const op = opsToSplit[0];
  return splitOperator(s, op)
    .map(e => opsToSplit.length > 1 && !all_operator_symbols.includes(e as OperatorSymbol)
      ? splitOperators(e, opsToSplit.filter((o, idx) => idx > 0)) : [parseAsExpressionPart(e)])
    .reduce((prev, curr) => [...prev, ...curr], []) as ExpressionPart[];
}

export function parseAsExpressionPart(e: string): ExpressionPart {
  const parsed = parseFloat(e);
  if (all_operator_symbols.includes(e as OperatorSymbol)) {
    return e as OperatorSymbol;
  } else if (!Number.isNaN(parsed)) {
    return parsed;
  } else if (Assignment.EQ === e as Assignment) {
    return e as Assignment;
  }
  throw new Error(`Cannot parse expression ${e} as ExpressionPart.`);
}

/**
 * Splits a string into found occurrences of given operator.
 * '*(,)/*' with op=* produces ['*','(,)/', '*']
 * @param s : string
 * @param op : OperatorSymbol
 */
export function splitOperator(s: string = '', op: OperatorSymbol): (string | OperatorSymbol)[] {
  const idx = s.indexOf(op);
  if (idx === -1) {
    return [s];
  } else {
    const idx_end = idx + op.length - 1;
    return [
      ...(idx > 0 ? [s.substring(0, idx)] : []),
      op,
      ...(idx_end < s.length - 1 ? splitOperator(s.substring(idx_end + 1), op) : [])
    ];
  }
}

/**
 * Recursively computes given expression until its length is 1 and so contains the result.
 * Computation is done by implementing operator_precedence and using parenthesis to construct
 * the computation tree.
 * @param expr: Expression
 */
export function compute(expr: Expression): ValueType | ValueType[] {
  expr = [...expr];
  while (expr.includes(Bracket.LEFT)) {
    const idx_start = expr.findIndex(e => e === Bracket.LEFT);
    const idx_end = findClosingBracket(expr, idx_start);
    const result = compute(expr.slice(idx_start + 1, idx_end));
    expr = [...expr.slice(0, idx_start), result, ...expr.slice(idx_end + 1)];
  }
  const components = split_components(expr)  // supports tuples of expressions in fn-calls
    .map(c => combine(c)).map(r => r[0] as ValueType);
  return components.length > 1 ? components : components[0];
}

/**
 * Splits an expression into its components. That is, something like
 * [a, ',', b, ',', c] is split into [[a], [b], [c]]
 * @param exprs
 */
export function split_components(exprs: Expression): Expression[] {
  const idx = exprs.findIndex(e => e === Separator.COMMA);
  if (idx < 0) {
    return [exprs];
  } else {
    return [exprs.slice(0, idx), ...split_components(exprs.slice(idx + 1))];
  }
}

export function findClosingBracket(expr: Expression, idx_start: number): number {
  let open_brackets = 1;
  for (let [idx, e] of expr.slice(idx_start + 1).entries()) {
    if (e === Bracket.RIGHT) {
      if (open_brackets === 1) {
        return idx_start + 1 + idx;
      } else {
        open_brackets = open_brackets - 1;
      }
    } else if (e === Bracket.LEFT) {
      open_brackets = open_brackets + 1;
    }
  }
  throw new Error('miss-matching parenthesis in expression');
}

/**
 * Combines recursively an expression which is required to not contain parenthesis until
 * it contains only a ValueType.
 * operator_precedence is ensured to be withhold.
 * Combination takes place from left to right to ensure '-' is captured correctly.
 * @param expr: Expression
 */
export function combine(expr: Expression): Expression {
  expr = [...expr];
  all_operator_symbols.sort(operator_precedence)
    .forEach(op => {
      while (expr.includes(op)) {
        const op_idx = expr.findIndex(e => op === e);
        if (isOperator(op)) {
          const lhs_idx = op_idx - 1;
          const rhs_idx = op_idx + 1;
          const result = evaluateOp(op as Operator, expr[lhs_idx] as ValueType, expr[rhs_idx] as ValueType);
          expr = [...expr.slice(0, lhs_idx), result, ...expr.slice(rhs_idx + 1)];
        } else if (isBuildInMathFn(op)) {
          const rhs_idx = op_idx + 1;
          const result = evaluateFn(op as BuildInMathFn, expr[rhs_idx] as ValueType | ValueType[]);
          expr = [...expr.slice(0, op_idx), result, ...expr.slice(rhs_idx + 1)];
        }
      }
    });
  return expr;
}

export function evaluateOp(op: Operator, lhs: ValueType, rhs: ValueType): ValueType {
  const lhs_is_number = typeof lhs === 'number';
  const rhs_is_number = typeof rhs === 'number';
  if (lhs_is_number && rhs_is_number) {
    switch (op) {
      case Operator.PLUS:
        return (lhs as number) + (rhs as number);
      case Operator.MINUS:
        return (lhs as number) - (rhs as number);
      case Operator.POWER:
        return (lhs as number) ** (rhs as number);
      case Operator.DIVISION:
        return (lhs as number) / (rhs as number);
      case Operator.ELEM_W_TIMES:
        return (lhs as number) * (rhs as number);
      case Operator.TIMES:
        return (lhs as number) * (rhs as number);
      default:
        throw new Error(`Not supported operator ${op} between numbers.`);
    }
    // avoiding eval(`${lhs}${Operator.POWER === op ? '**' : op}${rhs}`) due to performance
  }
  const createOperand = (targetValue: number, m: Matrix): Matrix => {
    return mat(...m.shape()).fill(targetValue);
  }
  lhs = lhs_is_number ? createOperand(lhs as number, rhs as Matrix) : lhs;
  rhs = rhs_is_number ? createOperand(rhs as number, lhs as Matrix) : rhs;
  if ((lhs_is_number || rhs_is_number) && (op === Operator.TIMES || op === Operator.ELEM_W_TIMES)) {
    return (lhs as Matrix).apply((value, row, col) => value * (rhs as Matrix).get(row, col));
  } else {
    return lhs[op](rhs);
  }
}

export function evaluateFn(op: BuildInMathFn, rhs: ValueType | ValueType[]): ValueType {
  if (Array.isArray(rhs)) {
    const m = rhs.find(e => e instanceof Matrix) as Matrix;
    if (!m) {
      return Math[`${op}`](...rhs);
    } else {
      const rhs_as_matrixes = rhs.map(e => typeof e === 'number' ? mat(...m.shape()).fill(e) : e) as Matrix[];
      return evaluateMultiArgFn(op, rhs_as_matrixes);
    }
  } else {
    return typeof rhs === 'number'
      ? Math[`${op}`](rhs)
      : rhs.apply((v: number) => Math[`${op}`](v));
  }
}

/**
 * Evaluates expression like: Math.max(A, B, C) where A, B, C are matrixes.
 * Evaluation takes place component-wise.
 * @param op
 * @param rhs
 */
export function evaluateMultiArgFn(op: BuildInMathFn, rhs: Matrix[]): Matrix {
  const res = mat(...rhs[0].shape());
  for (let { row, col } of res.iter()) {
    const value = Math[`${op}`](...rhs.map(e => e.get(row, col)));
    res.set(row, col, value);
  }
  return res;
}

