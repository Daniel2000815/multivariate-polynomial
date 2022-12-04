# multivariate-polynomial

A javascript library to work with polynomials in Q and multiple variables.

## Usage/Examples

```javascript
import Polynomial from "./Polynomial";

let f = new Polynomial("2*x + 1");
let g = new Polynomial("y*z - x");
let h = new Polynomial("1");

f.lc();     // 2
f.lm();     // x
f.lt();     // 2x
f.supp();   // [ [ 0, 1, 0, 0 ], [ 0, 0, 0, 0 ] ]

f = f.multiply(g).minus(h); // -2x^2 + 2x*y*z - x + y*z - 1 

const division = f.divide([g,h]);   // qs: [2x  + 1 , -1], r: 0
Polynomial.exp(division.quotients); // [ [ 0, 1, 0, 0 ], [ 0, 0, 0, 0 ] ]
Polynomial.buchberger([f,g])        // [-2x^2  + 2x*y*z  - x + y*z - 1, -x + y*z, -1/2]

```

## API Reference

### Instance methods

```js
p = new Polynomial("x");
p.method();
```

| Method        | Parameters                                                                                                                                                                                         | Return                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clone`       | -                                                                                                                                                                                                  | `Polynomial`: copy of $p$                                                                                                                            |
| `divide`      | `fs: Polynomial[]`: polynomials to divide with using _lex_ <br/>`maxIter: number = 1000`: limit of iterations allowed <br/>`verbose: boolean = false`: should also return a list of steps followed | `{ quotients: Polynomial[], remainder: Polynomial, steps?: {string: any}} }`: quotients of each polynomial in `fs`, remainder and steps if `verbose` |
| `equals`      | `q: Polynomial`: polynomial to compare with                                                                                                                                                        | `boolean`: $p == q$                                                                                                                                  |
| `exp`         | `vars: string[] = Polynomial.vars`: variables in the polynomial                                                                                                                                    | `number[]`: $\exp(p)$ using _lex_                                                                                                                    |
| `getCoefMap`  | -                                                                                                                                                                                                  | `Map<string,string>`: map pairing each monomial to its coefficient                                                                                   |
| `getVarOrder` | -                                                                                                                                                                                                  | `string[]`: monomials of $p$ ordered by _lex_                                                                                                        |
| `isZero`      |                                                                                                                                                                                                    | `boolean`: $p == 0$                                                                                                                                  |
| `lc`          | -                                                                                                                                                                                                  | `string`: leader coefficient of $p$                                                                                                                  |
| `lm`          | -                                                                                                                                                                                                  | `string`: leader monomial of $p$                                                                                                                     |
| `lt`          | -                                                                                                                                                                                                  | `string`: leader term of $p$                                                                                                                         |
| `minus`       | `q: Polynomial`: polynomial to substract                                                                                                                                                           | `Polynomial`: $p-q$                                                                                                                                  |
| `multiply`    | `q: Polynomial`: polynomial to multiply with                                                                                                                                                       | `Polynomial`: $p*q$                                                                                                                                  |
| `plus`        | `q: Polynomial`: polynomial to sum with                                                                                                                                                            | `Polynomial`: $p+q$                                                                                                                                  |
| `supp`        | -                                                                                                                                                                                                  | `number[][]`: support of $p$                                                                                                                         |
| `toString`    | -                                                                                                                                                                                                  | `string`: representation of $p$ using _lex_                                                                                                          |

### Static methods

```js
Polynomial.method();
```

| Name                     | Parameters                                                                                            | Return                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `buchberger`             | `F: Polynomial[]`: generator of the ideal<br/>`maxIter : number = 10000`: limit of iterations allowed | `Polynomial[]`: Groebner basis of $< F >$ computed using Buchberger algorithm. If error, returns `[0]`                                      |
| `setVars`                | `vars: string[]`: vars considered for polynomials                                                     | `void`                                                                                                                                      |
| `exp`                    | `F: Polynomial[]`                                                                                     | `number[][]`: array of exponents of each polynomial in $F$                                                                                  |
| `expGreater`             | `a,b: number[]`: exponents to compare                                                                 | `boolean`: $a >_{\text{lex}} b$. If lengths doesn't macth, returns `false`                                                                  |
| `getVars`                | -                                                                                                     | `string[]`: vars considered for polynomials                                                                                                 |
| `isGroebnerBasis`        | `F: Polynomial[]`: generator of the ideal<br/> `G: Polynomial[]`: supposed Groebner basis             | `boolean`: $G$ is a Groebner basis of $< F>$                                                                                                |
| `isReducedGroebnerBasis` | `F: Polynomial[]`: generator of the ideal<br/> `G: Polynomial[]`: supposed reduced Groebner basis     | `boolean`: $G$ is a reduced Groebner basis of $< F>$                                                                                        |
| `lcm`                    | `alpha, beta: number[]`: exponents                                                                    | `Polynomial`: $\text{lcm}(\alpha,\beta) = \left( \max(\alpha_1, \beta_1), \dots, \max(\alpha_n, \beta_n)\right)$. If error, resturns `[-1]` |
| `monomial`               | `exp: number[]`                                                                                       | `Polynomial`: monomial $p$ with $\exp(p) = \text{exp}$ and $\text{lc}(p)=1$. If the exponent length is not the same as `vars` returns $p=0$ |
| `sPol`                   | `f,g: Polynomial`                                                                                     | `Polynomial`: S-polynomial of $f$ and $g$                                                                                                   |

## Running Tests

You can run tests with the following command.

```bash
  npm test
```

To use your own tests, add them to the file `test/test.ts`.
