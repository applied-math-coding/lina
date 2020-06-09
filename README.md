# Linear Algebra Library

This Javascript library intends to provide common matrix operations.
It can be used directly on the matrix instances or by using a specific syntax
which resembles very much the actual mathematical notation.


What makes this package special compared to others, is the ability to
code your formulas very near to the actual mathematical syntax.

For instance:
In mathematics you write,
```
A = 3B + C
```
in lina you would write,
```
calc`${A}=3*${B}+${C}`
```

## Environment

Runs in modern Browsers and Node.js.
Includes all type declarations for being used in Typescript.

## Installing

npm install @applied.math.coding/lina
or
yarn add @applied.math.coding/lina


## Getting Started
After adding the lib to your code-base you can use it like this:
```
import { calc, Matrix, zeros, mat } from  '@applied.math.coding/lina';
const A = mat([[1, 2], [3, 4]]);
const B = zeros(2, 2);
const C: Matrix;
calc`${C} = 3 * ${A} + ${B} + 7`;
console.log(C.print());
```
As you see, a matrix-operator language is provided by the tagged template 'calc'.

## Features
### Creation:
These global methods are available in order to create matrix instances.

**mat(rows: number, cols: number)**  creates new matrix instance with given rows and cols

**mat(m: Matrix)** creates new instance from given matrix

**mat(a: number[][])** creates new instance from array

**zeros(rows: number, cols: number)** creates instance with all elements set to 0

**randu(rows: number, cols: number)** create instance with randum elements (uniformly distributed btw 0 and 1)

### Instance Methods:
The following methods are made available on each matrix-instance.

**rawData()**  access to underlying data store of matrix
(avoid to use this)

**shape()** returns the shape of the matrix

**clone()** produces a deep clone

**slice(row1, col1, row2, col2)** produces a slice of the given matrix which starts at left-upper corner (row1, col1) and ends at right-lower corner (row2, col2). Note: this returns a matrix instance which still operates on the original data (no copying takes place). Moreover, you can read and write to this slice as usually within 'calc'

**col(idx: number)** shortage to slice a column by its id

**row(idx: number)** shortage to slice a row by its id

  **filter(fn: (e: {row, col, value}) => boolean )** By supplying a predicate 'fn' the matrix can be filtered on any elements.  Note: as in 'slice', the returned instance still operates on original data (no copying takes place)

**get(row: number, col: number)** returns the value at given coordinate

**fill(v: number)** sets all values in matrix to given value

**shrink(v: number)** returns a sliced view of the matrix by shrinking rows and columns from all sides by given number

**shift_c(c: number)** shifts a sliced view of a matrix for c-indexes a long the columns direction and returns a new sliced view

**shift_r(r: number)** shifts a sliced view of a matrix for r-indexes a long the rows direction and returns a new sliced view

**wrap(v: number)** wraps a matrix by v rows and columns in all directions. This is like a padding

**addRow(atIdx: number, row: number[])** in place adds a row at given index

**addColumn(atIdx: number, row: number[])** in place adds a column at given index

**set(row: number, col: number, value: number)** sets the given value at given coordinate

**iter()** generates an iterator which can be used like
```
for(let {row, col, value} of m.iter()){
  console.log(`${row}, ${col}, ${value});
}
```
**print()** produces a print in console

**plus(m: Matrix)** adds given matrix  to the current. Computation takes place immutable on current instance and the result is returned

**minus(m: Matrix)** like 'plus'

**divide(m: Matrix)** element-wise divides current matrix by given

**times(m: Matrix)** matrix multiplication by given matrix from
right

**max(): number** element-wise maximum

**min(): number** element-wise minimum

**apply(fn: (value: number, row?: number, col?: number) => number)**  applies given lambda on the matrix. This value it returns is the one which is set on coordinate (row, col)

### calc:
The calc is a tagged template which can basically operator on all valid mathematical expressions which include these operators: ( ) = * / + - % and functions from Math.
Examples:
```
const C: Matrix;
C = calc`${A} * cos(${B}) + pow(${A}, 3)`
```
```
calc`${C} = ${A} * cos(${B}) + pow(${A}, 3)`
```
Many more can be found it tests.






## Usages
Lina was successfully used within https://applied-math-coding.github.io/basic-diffusion-transport/ where it deemed as PDE-solver.
Its code-base can be found here,  https://github.com/applied-math-coding/basic-diffusion-transport

## Future Plans

  At the time of writing not too much operations are supported. I try to overcome this as time permits and add for instance solvers.</br>
  Also, the implementation is not aimed at performance for the time being. In particular, during expression evaluation in 'calc' much copying of data takes place what can be avoided in theory.</br>
  Support for arbitrary precision in computation is planned by utilizing BigInts.</br>
  One obvious weakness with current implementation is error-handling during expression evaluation in 'calc'. When expression parsing fails you most likely get error-messages which are not very nicely pointing to the actual problem. So, this remains an important to-do for me.


## License



Copyright (C) <applied.math.coding@gmail.com>



Licensed under the Apache License, Version 2.0 (the "License");

you may not use this file except in compliance with the License.

You may obtain a copy of the License at



https://www.apache.org/licenses/LICENSE-2.0



Unless required by applicable law or agreed to in writing, software

distributed under the License is distributed on an "AS IS" BASIS,

WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and

limitations under the License.
