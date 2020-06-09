import { mat, zeros } from '../lib/mat';

describe('matrix initialization', () => {
  it('should create matrix from array', () => {
    const A = mat([[1, 2], [3, 4]]);
    expect(
      A.get(0, 0) === 1 &&
      A.get(0, 1) === 2 &&
      A.get(1, 0) === 3 &&
      A.get(1, 1) === 4
    ).toBe(true);
  });

  it('should create matrix from matrix', () => {
    const A = mat([[1, 2], [3, 4]]);
    const B = mat(A);
    expect(
      [...A.iter()].some(({ value, row, col }) => value !== B.get(row, col))
    ).toBe(false);
  });

});