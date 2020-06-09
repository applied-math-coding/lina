import { mat, calc } from "../lib";

const A = mat(2, 2);
calc`${A} = 1`;
A;