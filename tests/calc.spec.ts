import { calc, zeros, mat } from '../lib';
import {
  splitOperators, splitOperator, findClosingBracket,
  all_operator_symbols, Expression, combine,
  OperatorSymbol, parseAsExpressionPart, operator_precedence,
  evaluateFn, evaluateOp, Bracket, compute, transformSignOperator
} from '../lib/calc';
import { Operator } from '../lib/operator.enum';
import { Matrix } from '../lib/matrix';
import { BuildInMathFn } from '../lib/build-in-math-fn.enum';

describe('calculate matrix expression', () => {

  it('should split-off the operator', () => {
    const op = Operator.PLUS;
    expect(splitOperator('+(9*5+sin(7)+', op))
      .toEqual(['+', '(9*5', '+', 'sin(7)', '+']);
  });

  it('should split-off the operator', () => {
    const op = Operator.PLUS;
    expect(splitOperator('+', op)).toEqual(['+']);
  });

  it('should split-off the operator', () => {
    const op = Operator.TIMES;
    expect(splitOperator('+', op)).toEqual(['+']);
  });

  it('should parse numbers as numbers', () => {
    expect(parseAsExpressionPart('7' as OperatorSymbol)).toBe(7);
  });

  it('should parse operator-symbols as operator-symbols', () => {
    expect(parseAsExpressionPart(Operator.PLUS)).toBe(Operator.PLUS);
  });

  it('should split into array of operator symbols', () => {
    expect(splitOperators('+(9*5+sin(7)+') as (string | number)[])
      .toEqual(['+', '(', 9, '*', 5, '+', 'sin', '(', 7, ')', '+']);
  });

  it('should find closing bracket', () => {
    expect(
      findClosingBracket('(()()((())))()'.split('') as Expression, 0)
    ).toBe(11);
  });

  it('should find closing bracket', () => {
    expect(
      findClosingBracket('(()()((())))()'.split('') as Expression, 5)
    ).toBe(10);
  });

  it('should evaluate operator expression, number plus number', () => {
    expect(evaluateOp(Operator.PLUS, 2, 2)).toBe(4);
  });

  it('should evaluate operator expression, number minus number', () => {
    expect(evaluateOp(Operator.MINUS, 2, 2)).toBe(0);
  });

  it('should evaluate operator expression, number times number', () => {
    expect(evaluateOp(Operator.TIMES, 2, 2)).toBe(4);
  });

  it('should evaluate operator expression, number % number', () => {
    expect(evaluateOp(Operator.ELEM_W_TIMES, 4, 2)).toBe(8);
  });

  it('should evaluate operator expression, number division number', () => {
    expect(evaluateOp(Operator.DIVISION, 4, 2)).toBe(2);
  });

  it('should evaluate operator expression, number power number', () => {
    expect(evaluateOp(Operator.POWER, 2, 2)).toBe(4);
  });

  it('should evaluate operator expression, number plus matrix', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.PLUS, 1, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, number minus matrix', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.MINUS, 1, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, number times matrix', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.TIMES, 1, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should evaluate operator expression, number division matrix', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.DIVISION, 2, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, number % matrix', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.ELEM_W_TIMES, 2, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should evaluate operator expression, number power matrix', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.POWER, 2, A) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should evaluate operator expression, matrix plus number', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.PLUS, A, 1) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, matrix minus number', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.MINUS, A, 1) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([-1, -1, -1, -1]);
  });

  it('should evaluate operator expression, matrix times number', () => {
    const A = zeros(2, 2);
    const B = evaluateOp(Operator.TIMES, A, 1) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should evaluate operator expression, matrix division number', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.DIVISION, A, 2) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, matrix % number', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.ELEM_W_TIMES, A, 2) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should evaluate operator expression, matrix power number', () => {
    const A = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.POWER, A, 2) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });


  it('should evaluate operator expression, matrix plus matrix', () => {
    const A = zeros(2, 2);
    const C = zeros(2, 2).fill(1);
    const B = evaluateOp(Operator.PLUS, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, matrix minus matrix', () => {
    const A = zeros(2, 2);
    const C = zeros(2, 2).fill(1);
    const B = evaluateOp(Operator.MINUS, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([-1, -1, -1, -1]);
  });

  it('should evaluate operator expression, matrix times matrix', () => {
    const A = zeros(2, 2).fill(1);
    const C = zeros(2, 2).fill(1);
    const B = evaluateOp(Operator.TIMES, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([2, 2, 2, 2]);
  });

  it('should evaluate operator expression, matrix division matrix', () => {
    const A = zeros(2, 2).fill(2);
    const C = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.DIVISION, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should evaluate operator expression, matrix % matrix', () => {
    const A = zeros(2, 2).fill(1);
    const C = zeros(2, 2).fill(3);
    const B = evaluateOp(Operator.ELEM_W_TIMES, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([3, 3, 3, 3]);
  });

  it('should evaluate operator expression, matrix power matrix', () => {
    const A = zeros(2, 2).fill(2);
    const C = zeros(2, 2).fill(2);
    const B = evaluateOp(Operator.POWER, A, C) as Matrix;
    expect([...B.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  Object.values(BuildInMathFn)
    .filter(e => ![BuildInMathFn.max, BuildInMathFn.min, BuildInMathFn.pow].includes(e))
    .forEach(v => {
      it(`it should evaluate fn expression, ${v}(Matrix)`, () => {
        const value = BuildInMathFn.acosh === v ? 2 : 0.5;
        const A = zeros(2, 2).fill(value);
        const B = evaluateFn(v, A) as Matrix;
        expect(B.get(1, 1)).toBeCloseTo(Math[`${v}`](value), 4);
      });
    });

  it('operator precedence', () => {
    console.log(all_operator_symbols.sort(operator_precedence));
  });

  it('should combine the expression A+B', () => {
    const A = zeros(2, 2).fill(1);
    const B = zeros(2, 2).fill(1);
    const expr = [A, Operator.PLUS, B];
    expect([...(combine(expr)[0] as Matrix).iter()]
      .map(({ value }) => value)).toEqual([2, 2, 2, 2]);
  });

  it('should combine the expression A+B-C', () => {
    const expr = [
      zeros(2, 2).fill(1),
      Operator.PLUS,
      zeros(2, 2).fill(1),
      Operator.MINUS,
      zeros(2, 2).fill(1)
    ];
    expect([...(combine(expr)[0] as Matrix).iter()]
      .map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should combine the expression A+B%C', () => {
    const expr = [
      zeros(2, 2).fill(1),
      Operator.PLUS,
      zeros(2, 2).fill(1),
      Operator.ELEM_W_TIMES,
      zeros(2, 2).fill(2)
    ];
    expect([...(combine(expr)[0] as Matrix).iter()]
      .map(({ value }) => value)).toEqual([3, 3, 3, 3]);
  });

  it('should combine the expression A+ceil(B)', () => {
    const expr = [
      zeros(2, 2).fill(1),
      Operator.PLUS,
      BuildInMathFn.ceil,
      zeros(2, 2).fill(1.9)
    ];
    expect([...(combine(expr)[0] as Matrix).iter()]
      .map(({ value }) => value)).toEqual([3, 3, 3, 3]);
  });

  it('should combine the expression -1*A+B', () => {
    const expr = [
      -1,
      Operator.TIMES,
      zeros(2, 2).fill(1),
      Operator.PLUS,
      zeros(2, 2).fill(1)
    ];
    expect([...(combine(expr)[0] as Matrix).iter()]
      .map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should compute expression A%(B+C)', () => {
    const expr = [
      zeros(2, 2).fill(2),
      Operator.ELEM_W_TIMES,
      Bracket.LEFT,
      zeros(2, 2).fill(1),
      Operator.PLUS,
      zeros(2, 2).fill(1),
      Bracket.RIGHT
    ];
    expect([...(compute(expr) as Matrix).iter()]
      .map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should compute expression A%(B+(C - D))', () => {
    const expr = [
      zeros(2, 2).fill(2),
      Operator.ELEM_W_TIMES,
      Bracket.LEFT,
      zeros(2, 2).fill(1),
      Operator.PLUS,
      Bracket.LEFT,
      zeros(2, 2).fill(2),
      Operator.MINUS,
      zeros(2, 2).fill(1),
      Bracket.RIGHT,
      Bracket.RIGHT
    ];
    expect([...(compute(expr) as Matrix).iter()]
      .map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should transformSignOperator of -A-B', () => {
    const A = zeros(2, 2);
    const B = zeros(2, 2);
    const expr = [Operator.MINUS, A, Operator.MINUS, B];
    expect(transformSignOperator(expr))
      .toEqual([
        Bracket.LEFT, -1, Bracket.RIGHT, Operator.TIMES,
        A, Operator.MINUS, B
      ]);
  });

  it('should transformSignOperator of -A+(-B)', () => {
    const A = zeros(2, 2);
    const B = zeros(2, 2);
    const expr = [Operator.MINUS, A, Operator.PLUS,
    Bracket.LEFT, Operator.MINUS, B, Bracket.RIGHT];
    expect(transformSignOperator(expr))
      .toEqual([
        Bracket.LEFT, -1, Bracket.RIGHT, Operator.TIMES,
        A, Operator.PLUS, Bracket.LEFT,
        Bracket.LEFT, -1, Bracket.RIGHT, Operator.TIMES,
        B, Bracket.RIGHT
      ]);
  });

  it('should calculate A+B', () => {
    const A = zeros(2, 2).fill(2);
    const B = zeros(2, 2).fill(2);
    expect([...(calc`${A}+${B}` as Matrix).iter()]
      .map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should calculate -A+B', () => {
    const A = zeros(2, 2).fill(1);
    const B = zeros(2, 2).fill(1);
    expect([...(calc`-${A}+${B}` as Matrix).iter()]
      .map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should calculate A+(-B)', () => {
    const A = zeros(2, 2).fill(1);
    const B = zeros(2, 2).fill(1);
    expect([...(calc`${A}+(-${B})` as Matrix).iter()]
      .map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should assign A=-5*B-C', () => {
    const A = mat(2, 2);
    const B = mat(2, 2).fill(1);
    const C = mat(2, 2).fill(1);
    calc`${A}=-5*${B}-${C}`;
    expect([...A.iter()]
      .map(({ value }) => value)).toEqual([-6, -6, -6, -6]);
  });

  it('should assign filtered matrixes', () => {
    const A1 = mat([[-1, 2, -3], [9, -7, 5]]);
    const A2 = mat([[-1, 2, -3], [9, -7, 5]]);
    const B = zeros(2, 3);
    const only_neg = ({ value }) => value < 0;
    calc`${B}=${A1.filter(only_neg)}+${A2.filter(only_neg)}`;
    expect([...B.iter()].map(({ value }) => value)).toEqual([-2, 0, -6, 0, -14, 0]);
  });

  it('should assign a filtered matrix onto a slice of another', () => {
    const A = mat([
      [-1, 1, -2],
      [1, -2, 3]]);
    const B = mat(2, 3);
    calc`${B.slice(0, 0, 1, 1)} = ${A.slice(0, 0, 1, 1)}+${A.slice(0, 1, 1, 3)}`;
    const C = mat(2, 3).fill(7);
    calc`${C.slice(0, 0, 1, 1)}=${B.filter(({ row, col }) => A.get(row, col) < 0).slice(0, 0, 1, 1)}`;
    expect(C.get(0, 0) === 0 && C.get(1, 0) === 7 && C.get(0, 2) === 7).toBe(true);
  });

  it('should assign a filtered matrix onto a slice of another (one step)', () => {
    const A = mat([
      [-1, 1, -2],
      [1, -2, 3]]);
    const B = calc<Matrix>`${A.slice(0, 0, 1, 1)}+${A.slice(0, 1, 1, 3)}`;
    const C = mat(2, 3).fill(7);
    calc`${C.slice(0, 0, 1, 1)}=${B.filter(({ row, col }) => A.slice(0, 0, 1, 1).get(row, col) < 0)}`;
    expect(C.get(0, 0) === 0 && C.get(1, 0) === 7 && C.get(0, 2) === 7).toBe(true);
  });

  it('should calc correctly: 1-2+1', () => {
    const u = mat(1, 1).fill(1);
    expect(calc<Matrix>`${u}-2*${u}+${u}`.get(0, 0)).toBe(0);
  });

  it('should calc correctly: 1-2-1', () => {
    const u = mat(1, 1).fill(1);
    expect(calc<Matrix>`${u}-2*${u}-${u}`.get(0, 0)).toBe(-2);
  });

  it('should compute max(4,3,5)', () => {
    const a = 3;
    const b = 5;
    expect(calc`max(4, ${a}, ${b})`).toBe(5);
  });

  it('should compute max(M,3,5)', () => {
    const M = mat([[1, 2], [7, 4]]);
    const a = 3;
    const b = 5;
    const r = calc<Matrix>`max(${M}, ${a}, ${b})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([5, 5, 7, 5])
  });

  it('should compute max(M1,M2,5)', () => {
    const M1 = mat([[1, 2], [7, 4]]);
    const M2 = mat(2, 2).fill(3);
    const b = 5;
    const r = calc<Matrix>`max(${M1}, ${M2}, ${b})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([5, 5, 7, 5])
  });

  it('should compute min(M,3,5)', () => {
    const M = mat([[1, 2], [7, 4]]);
    const a = 3;
    const b = 5;
    const r = calc<Matrix>`min(${M}, ${a}, ${b})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([1, 2, 3, 3])
  });

  it('should compute min(M1,M2,5)', () => {
    const M1 = mat([[1, 2], [7, 4]]);
    const M2 = mat(2, 2).fill(3);
    const b = 5;
    const r = calc<Matrix>`min(${M1}, ${M2}, ${b})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([1, 2, 3, 3])
  });

  it('should compute pow(M1,2)', () => {
    const M1 = mat([[1, 2], [7, 4]]);
    const r = calc<Matrix>`pow(${M1}, 2)`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([1, 4, 49, 16])
  });

  it('should compute pow(M1,M2)', () => {
    const M1 = mat([[1, 2], [7, 4]]);
    const M2 = mat(2, 2).fill(2);
    const r = calc<Matrix>`pow(${M1}, ${M2})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([1, 4, 49, 16])
  });

  it('should compute pow(2, M1)', () => {
    const M1 = mat([[1, 2], [3, 4]]);
    const r = calc<Matrix>`pow(2, ${M1})`;
    expect([...r.iter()].map(({ value }) => value)).toEqual([2, 4, 8, 16])
  });

  it('should assign a number to a matrix', () => {
    const A = mat(2, 2);
    calc`${A}=1`;
    expect([...A.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

});