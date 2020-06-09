import { Matrix } from './matrix';

/**
 * Creates an empty matrix of given shape.
 * @param rows
 * @param cols
 */
export function mat(rows: number, cols: number): Matrix;

/**
 * Creates a matrix by cloning the given.
 * @param m
 */
export function mat(m: Matrix): Matrix;

/**
 * Creates a matrix by using the data of given array. The data are not shared.
 * @param a
 */
export function mat(a: number[][]): Matrix;

export function mat(...args): Matrix {
  if (args[0] instanceof Matrix) {
    return args[0].clone();
  } else if (Array.isArray(args[0])) {
    const rows = args[0].length;
    const firstCol = args[0].find(e => e && Array.isArray(e));
    const cols = firstCol ? firstCol.length : 1;
    const m = new Matrix(rows, cols);
    args[0].forEach((v, row) => v && v.forEach((e, col) => e && m.set(row, col, e)));
    return m;
  } else {
    const [rows, cols] = args;
    return new Matrix(rows, cols);
  }
}

/**
 * Creates a matrix filled with zeros.
 * @param rows
 * @param cols
 */
export function zeros(rows: number, cols: number): Matrix {
  const m = mat(rows, cols);
  for (let { row, col } of m.iter()) {
    m.set(row, col, 0);
  }
  return m;
}

/**
 * Creates a matrix by filling elements with uniform distributed values between 0 and 1.
 * @param rows
 * @param cols
 */
export function randu(rows: number, cols: number): Matrix {
  const r = mat(rows, cols);
  for (let { row, col } of r.iter()) {
    r.set(row, col, Math.random());
  }
  return r;
}