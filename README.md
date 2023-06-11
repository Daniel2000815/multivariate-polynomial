# multivariate-polynomial

A javascript library to work with polynomials in $\mathbb{R}$ and multiple variables.

## Usage/Examples

```javascript
import Polynomial from "./Polynomial";

let f = new Polynomial("2*x + 1");
let g = new Polynomial("y*z - x");
let h = new Polynomial("1");

f.lc(); // 2
f.lm(); // x
f.lt(); // 2x
f.supp(); // [ [ 0, 1, 0, 0 ], [ 0, 0, 0, 0 ] ]

f = f.multiply(g).minus(h); // -2x^2 + 2x*y*z - x + y*z - 1

const division = f.divide([g, h]); // qs: [2x  + 1 , -1], r: 0
Polynomial.exp(division.quotients); // [ [ 0, 1, 0, 0 ], [ 0, 0, 0, 0 ] ]
Polynomial.buchberger([f, g]); // [-2x^2  + 2x*y*z  - x + y*z - 1, -x + y*z, -1/2]
```

## Documentation

See [./docs/index.html](./docs/index.html).

## Running Tests

You can run tests with the following commands.

```bash
  test-polynomial
  test-polynomial-vars
  test-polynomial-groebner
  test-monomial
```

To use your own tests, add them to the directory `test`.
