import { zeros, mat } from '../lib';
import { Operator } from '../lib/operator.enum';

describe('matrix functionalities', () => {
  it('should set a value', () => {
    const A = zeros(10, 10);
    A.set(5, 3, 8);
    expect(A.get(5, 3) === 8).toBe(true);
  });

  it('should print', () => {
    zeros(3, 5).print();
    expect(true).toBe(true);
  });

  it('should fill value', () => {
    const A = mat(2, 2).fill(2);
    expect([...A.iter()].map(({ value }) => value)).toEqual([2, 2, 2, 2]);
  });

  it('should clone a matrix', () => {
    const A = mat(2, 2).fill(1);
    const B = A.clone();
    B.fill(2);
    expect(A.get(0, 0) === 1 && B.get(0, 0) === 2).toBe(true);
  });

  it('should add', () => {
    const A = zeros(2, 2).fill(1);
    const B = zeros(2, 2).fill(2);
    const C = A[Operator.PLUS](B);
    expect([...C.iter()].map(({ value }) => value)).toEqual([3, 3, 3, 3]);
  });

  it('should substract', () => {
    const A = zeros(2, 2).fill(1);
    const B = zeros(2, 2).fill(2);
    const C = B[Operator.MINUS](A);
    expect([...C.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should divide', () => {
    const A = zeros(2, 2).fill(2);
    const C = A[Operator.DIVISION](A);
    expect([...C.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should compute power', () => {
    const A = zeros(2, 2).fill(2);
    const C = A[Operator.POWER](A);
    expect([...C.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should compute element-wise times', () => {
    const A = zeros(2, 2).fill(2);
    const C = A[Operator.ELEM_W_TIMES](A);
    expect([...C.iter()].map(({ value }) => value)).toEqual([4, 4, 4, 4]);
  });

  it('should compute matrix product', () => {
    const A = zeros(2, 2).fill(1);
    const b = zeros(2, 1).fill(1);
    const C = A[Operator.TIMES](b);
    expect([...C.iter()].map(({ value }) => value)).toEqual([2, 2]);
  });

  it('should compute matrix product', () => {
    const A = zeros(2, 2).fill(1);
    const C = A[Operator.TIMES](A);
    expect([...C.iter()].map(({ value }) => value)).toEqual([2, 2, 2, 2]);
  });

  it('should create a slice', () => {
    const A = mat([
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4]]);
    const B = A.slice(1, 1, 2, 2);
    expect([...B.iter()].map(({ value }) => value)).toEqual([2, 2, 3, 3]);
  });

  it('should edit a slice', () => {
    const A = mat([
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4]]);
    const B = A.slice(1, 1, 2, 2);
    B.set(0, 0, 7);
    expect(B.get(0, 0) === 7).toBe(true);
  });

  it('should edit a slice on orig data', () => {
    const A = mat([
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
      [4, 4, 4, 4]]);
    const B = A.slice(1, 1, 2, 2);
    B.set(0, 0, 7);
    expect(A.get(1, 1) === 7).toBe(true);
  });

  it('should fill a filtered matrix', () => {
    const A = zeros(3, 3);
    const B = A.filter(({ row: i, col: j }) => i > 0 && i < 2 && j > 0 && j < 2);
    B.fill(1);
    expect([...B.iter()]).toEqual([{ value: 1, row: 1, col: 1 }]);
  });

  it('should add filtered matrixes', () => {
    const filter = ({ row: i, col: j }) => i > 0 && i < 2 && j > 0 && j < 2;
    const A = zeros(3, 3).filter(filter).fill(1);
    const B = zeros(3, 3).filter(filter).fill(2);
    const C = A.plus(B);
    expect([...C.iter()]).toEqual([{ value: 3, row: 1, col: 1 }]);
  });

  it('should first slice and then filter', () => {
    const A = mat(4, 4).fill(0);
    A.slice(1, 1, 2, 2).fill(1);
    const B = A.filter(({ row, col }) => row > 0 && row < 3 && col > 0 && col < 3);
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 1, 1]);
  });

  it('should first filter and then slice', () => {
    const A = mat(4, 4).fill(0);
    const B = A.filter(({ row }) => row === 0);
    B.slice(1, 1, 2, 2).fill(1);
    expect([...B.iter()].map(({ value }) => value)).toEqual([0, 0, 0, 0]);
  });

  it('should add a row to the start of a matrix', () => {
    const A = zeros(2, 2);
    A.addRow(0);
    A.set(0, 0, 1);
    expect(A.shape()).toEqual([3, 2]);
    expect(A.get(0, 0)).toBe(1);
  });

  it('should add a row to the end of a matrix', () => {
    const A = zeros(2, 2);
    A.addRow(2);
    A.set(2, 0, 1);
    expect(A.shape()).toEqual([3, 2]);
    expect(A.get(2, 0)).toBe(1);
  });

  it('should add a colum to the start of a matrix', () => {
    const A = zeros(2, 2);
    A.addColumn(0);
    A.set(0, 0, 1);
    expect(A.shape()).toEqual([2, 3]);
    expect(A.get(0, 0)).toBe(1);
  });

  it('should add a column to the end of a matrix', () => {
    const A = zeros(2, 2);
    A.addColumn(2);
    A.set(0, 2, 1);
    expect(A.shape()).toEqual([2, 3]);
    expect(A.get(0, 2)).toBe(1);
  });

  it('should wrap a matrix with rows and cols', () => {
    const A = zeros(2, 2);
    const B = A.wrap(1);
    B.set(0, 0, 1);
    expect(B.shape()).toEqual([4, 4]);
    expect(B.get(0, 0)).toBe(1);
  });

  it('should shrink a matrix by 1', () => {
    const A = zeros(3, 3);
    const B = A.shrink(1);
    expect(B.shape()).toEqual([1, 1]);
    expect(A.get(0, 0)).toBe(0);
  });

  it('should shift a matrix by 1 into x direction', () => {
    const A = zeros(2, 2).wrap(1);
    A.filter(({ row, col }) => row === 0 || row === 3 || col === 0 || col === 3).fill(1);
    const B = A.shrink(1).shift_c(1).clone();
    expect([...B.iter()].map(({ value }) => value)).toEqual([0, 1, 0, 1]);
  });

  it('should shift a matrix by -1 into x direction', () => {
    const A = zeros(2, 2).wrap(1);
    A.filter(({ row, col }) => row === 0 || row === 3 || col === 0 || col === 3).fill(1);
    const B = A.shrink(1).shift_c(-1).clone();
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 0, 1, 0]);
  });

  it('should shift a matrix by 1 into y direction', () => {
    const A = zeros(2, 2).wrap(1);
    A.filter(({ row, col }) => row === 0 || row === 3 || col === 0 || col === 3).fill(1);
    const B = A.shrink(1).shift_r(1).clone();
    expect([...B.iter()].map(({ value }) => value)).toEqual([0, 0, 1, 1]);
  });

  it('should shift a matrix by -1 into y direction', () => {
    const A = zeros(2, 2).wrap(1);
    A.filter(({ row, col }) => row === 0 || row === 3 || col === 0 || col === 3).fill(1);
    const B = A.shrink(1).shift_r(-1).clone();
    expect([...B.iter()].map(({ value }) => value)).toEqual([1, 1, 0, 0]);
  });

  it('should produce slice of col', () => {
    const A = mat([[1, 2], [3, 4]]);
    const col = A.col(0);
    expect([...col.iter()].map(({ value }) => value)).toEqual([1, 3]);
  });

  it('should produce slice of row', () => {
    const A = mat([[1, 2], [3, 4]]);
    const row = A.row(1);
    expect([...row.iter()].map(({ value }) => value)).toEqual([3, 4]);
  });

  it('should compute the max element in matrix', () => {
    const A = mat([[1, 2], [3, 4]]);
    expect(A.max()).toBe(4);
  });

  it('should compute the min element in matrix', () => {
    const A = mat([[1, 2], [3, 4]]);
    expect(A.min()).toBe(1);
  });
});
