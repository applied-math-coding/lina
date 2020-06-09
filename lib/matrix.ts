import { Operator } from "./operator.enum";

/**
 * Remark/Concept:
 * Filtering and slices operates on the original data.
 * Filtering mostly has an effect on how data are iterated, that is
 * leaving those out which are not in range of filter.
 * Slicing affects the coordinates with which to access certain elements
 * in the original data.
 * All operators apply on subview coordinates when being sliced.
 * The underlying data though, remain the original ones.
 * The coordinates of a filter refer to the original data.
 * The iterator iterates through subview coordinates but only those which
 * are in range of filter.
 */
export class Matrix {
  private rows: number;
  private cols: number;
  private data: number[][];
  private sliceParams: [number, number, number, number];
  private coordFilter: boolean[][];

  constructor(rows: number = 0, cols: number = 0) {
    this.rows = rows;
    this.cols = cols;
    this.initOperators();
    this.data = [];  // important to ensure slicing to work correctly
  }

  /**
   * Returns the raw data by reference.
   */
  rawData(): number[][] {
    return this.data;
  }

  shape(): [number, number] {
    return [this.rows, this.cols];
  }

  clone(): Matrix {
    const m = new Matrix(this.rows, this.cols);
    for (let { value, row, col } of this.iter()) {
      if (value != undefined) {
        m.set(row, col, value);
      }
    }
    return m;
  }

  /**
   * Produces a matrix operating on the same data but restricting coordinates on the
   * given window. This is a read/write view on a window.
   * @param param0
   */
  slice(...[row1, col1, row2, col2]: [number, number, number, number]): Matrix {
    [row1, col1, row2, col2] = [...this.transToDataCoords(row1, col1), ...this.transToDataCoords(row2, col2)];
    const m = new Matrix(row2 - row1 + 1, col2 - col1 + 1);
    m.data = this.data;
    m.coordFilter = this.coordFilter;
    m.sliceParams = [row1, col1, row2, col2];
    return m;
  }

  /**
   * Produces a slice of the given column.
   * @param idx
   */
  col(idx: number): Matrix {
    return this.slice(0, idx, this.rows - 1, idx);
  }

  /**
   * Produces a slice of the given row.
   * @param idx
   */
  row(idx: number): Matrix {
    return this.slice(idx, 0, idx, this.cols - 1);
  }

  /**
   * Creates a new matrix instance sharing the same data but having all operations restricted on the
   * indexes as specified by the predicate.
   * In other words, this operation restricts the iterator.
   * Note: the method 'slice' still refers to the original data's coordinates
   * Note: Operators which create new instances leave values undefined for coordinates not in range of filter
   * Note: also, these operators create instances which have set the same filter
   * @param fn
   */
  filter(fn: (e: { row: number, col: number, value: number }) => boolean): Matrix {
    const m = new Matrix(this.rows, this.cols);
    m.data = this.data;
    m.coordFilter = [];
    for (let { row, col, value } of this.iter()) {
      const [d_row, d_col] = this.transToDataCoords(row, col);
      if (!m.coordFilter[d_row]) {
        m.coordFilter[d_row] = [];
      }
      m.coordFilter[d_row][d_col] = fn({ row, col, value });
    }
    return m;
  }

  get(row: number, col: number): number {
    this.checkIndexes(row, col);
    [row, col] = this.transToDataCoords(row, col);
    this.checkFilterCoordinates(row, col);
    return this.data?.[row]?.[col];
  }

  /**
   * Fills all entries with the given value.
   * @param v: number
   */
  fill(v: number): Matrix {
    for (let { row, col } of this.iter()) {
      this.set(row, col, v);
    }
    return this;
  }

  /**
   * Returns a sliced version of this matrix shrink by v from all sides.
   * @param v
   */
  shrink(v: number): Matrix {
    return this.slice(v, v, this.rows - 1 - v, this.cols - 1 - v);
  }

  /**
   * Returns a sliced version of this matrix shifted along the columns-direction by v.
   * Note: consumer is responsible to not produce overflowing coordinates
   * @param v
   */
  shift_c(v: number): Matrix {
    return this.slice(0, v, this.rows - 1, this.cols - 1 + v);
  }

  /**
   * Like shift_c but in rows-direction.
   * @param v
   */
  shift_r(v: number): Matrix {
    return this.slice(v, 0, this.rows - 1 + v, this.cols - 1);
  }

  /**
   * Produces a new matrix with the given wrapped into given numbers of
   * rows and columns.
   * @param v
   */
  wrap(v: number): Matrix {
    const m = this.clone();
    for (let i = 1; i <= v; i++) {
      m.addRow(0);
      m.addRow(m.rows);
      m.addColumn(0);
      m.addColumn(m.cols);
    }
    return m;
  }

  /**
   * In place adds a row at the given position.
   * @param atRow
   * @param data
   */
  addRow(atIdx: number, row: number[] = []) {
    if (this.coordFilter || this.sliceParams) {
      throw new Error('Not supported for sliced or filtered matrixes.');
    }
    this.rows = this.rows + 1;
    this.data.splice(atIdx, 0, row);
  }

  /**
   * In place adds a column at the given position.
   * @param atCol
   * @param data
   */
  addColumn(atIdx: number, col: number[] = []) {
    if (this.coordFilter || this.sliceParams) {
      throw new Error('Not supported for sliced or filtered matrixes.');
    }
    this.cols = this.cols + 1;
    for (let i = 0; i < this.data.length; i++) {
      this.data[i]?.splice(atIdx, 0, col[i]);
    }
  }

  set(row: number, col: number, value: number) {
    this.checkIndexes(row, col);
    if (!this.data) {
      this.data = [];
    }
    [row, col] = this.transToDataCoords(row, col);
    this.checkFilterCoordinates(row, col);
    if (!this.data[row]) {
      this.data[row] = [];
    }
    this.data[row][col] = value;
  }

  /**
   * Returns an iterator which iterates over all coordinates in the
   * current slice (if any) but restricts to only those which refer
   * to an element in the underlying original data which are in range of
   * the filter (if any).
   */
  iter(): Generator<{ value: number, row: number, col: number }> {
    return (function* generator() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (this.isFilteredCoord(i, j)) {
            yield { value: this.get(i, j), row: i, col: j };
          }
        }
      }
    }).bind(this)();
  }

  print() {
    console.log('[');
    this.data
      .filter((e, idx) => this.sliceParams ? idx >= this.sliceParams[0] && idx <= this.sliceParams[2] : true)
      .forEach(r => {
        const rr = r.filter((e, idx) => this.sliceParams ? idx >= this.sliceParams[1] && idx <= this.sliceParams[3] : true)
        console.log(`[${rr}],`);
      });
    console.log(']');
  }

  plus(m: Matrix): Matrix {
    return this.apply((value, row, col) => value + m.get(row, col));
  }

  minus(m: Matrix): Matrix {
    return this.apply((value, row, col) => value - m.get(row, col));
  }

  divide(m: Matrix): Matrix {
    return this.apply((value, row, col) => value / m.get(row, col));
  }

  power(m: Matrix): Matrix {
    return this.apply((value, row, col) => value ** m.get(row, col));
  }

  elem_w_times(m: Matrix): Matrix {
    return this.apply((value, row, col) => value * m.get(row, col));
  }

  times(m: Matrix): Matrix {
    if (this.coordFilter) {
      throw new Error(`Matrix multiplication not supported for filtered matrixes.`);
    }
    const result = new Matrix(this.rows, m.cols);
    for (let { row, col } of result.iter()) {
      let sum = 0;
      for (let j = 0; j < this.cols; j++) {
        sum = sum + this.get(row, j) * m.get(j, col);
      }
      result.set(row, col, sum);
    }
    return result;
  }

  mod(m: Matrix): Matrix {
    return this.apply((value, row, col) => value % m.get(row, col));
  }

  max(): number {
    return Math.max(...[...this.iter()].map(({ value }) => value));
  }

  min(): number {
    return Math.min(...[...this.iter()].map(({ value }) => value));
  }

  /**
   * Element-wise applies given function onto the matrix.
   * Only elements of the curent slice (if any) are affected.
   * In case this instance has a filter, the filter is applied on
   * the resulting instance as well.
   * @param fn
   */
  apply(fn: (value: number, row?: number, col?: number) => number): Matrix {
    const result = this.clone();
    result.coordFilter = this.coordFilter;
    for (let { value, row, col } of this.iter()) {
      result.set(row, col, fn(value, row, col));
    }
    return result;
  }

  private checkIndexes(...[row, col]: [number, number]) {
    if (row > this.rows || col > this.cols || row < 0 || col < 0) {
      throw new Error('Index out of bounds.');
    }
  }

  private initOperators() {
    Object.values(Operator).forEach(op => {
      this[op] = this.createPartialFn(op);
    });
  }

  private createPartialFn(op: Operator): (rhs: Matrix) => Matrix {
    return {
      [Operator.POWER]: (rhs: Matrix) => this.power(rhs),
      [Operator.TIMES]: (rhs: Matrix) => this.times(rhs),
      [Operator.ELEM_W_TIMES]: (rhs: Matrix) => this.elem_w_times(rhs),
      [Operator.DIVISION]: (rhs: Matrix) => this.divide(rhs),
      [Operator.PLUS]: (rhs: Matrix) => this.plus(rhs),
      [Operator.MINUS]: (rhs: Matrix) => this.minus(rhs),
    }[op];
  }

  private transToDataCoords(row: number, col: number): [number, number] {
    return [
      this.sliceParams ? this.sliceParams[0] + row : row,
      this.sliceParams ? this.sliceParams[1] + col : col
    ];
  }

  private checkFilterCoordinates(row: number, col: number) {
    if (this.coordFilter && !this.coordFilter[row][col]) {
      throw new Error(`Coordinates ${row}, ${col} are not in filtered range.`);
    }
  }

  private isFilteredCoord(row: number, col: number): boolean {
    [row, col] = this.transToDataCoords(row, col);
    return !this.coordFilter || this.coordFilter[row][col];
  }
}
