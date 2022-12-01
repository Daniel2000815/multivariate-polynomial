
# multivariate-polynomial

A javascript library to work with polynomials in Q and multiple variables.

## Installation

Install it with npm

```bash
  npm install multivariate-polynomial
```

or just use the source:
```js
  import Polynomial from './Polynomial.js';
```

## Usage/Examples

```javascript
TO DO
```


## API Reference

### Instance methods

```js
p = new Polynomial("x");
p.method();
```
| Method          | Parameters                                                      | Return                                                             |
|---------------|-----------------------------------------------------------------|--------------------------------------------------------------------|
| `equals`      | `q: Polynomial`: polynomial to compare with                     | `boolean`: $p == q$                                                |
| `exp`         | `vars: string[] = Polynomial.vars`: variables in the polynomial | `number[]`: $\exp(p)$ using *lex*                                  |
| `getCoefMap`  | -                                                               | `Map<string,string>`: map pairing each monomial to its coefficient |
| `getVarOrder` | -                                                               | `string[]`: monomials of $p$ ordered by *lex*                      |
| `isZero`      |                                                                 | `boolean`: $p == 0$                                                |
| `lc`          | -                                                               | `string`: leader coefficient of $p$                                |
| `lm`          | -                                                               | `string`: leader monomial of $p$                                   |
| `lt`          | -                                                               | `string`: leader term of $p$                                       |
| `minus`       | `q: Polynomial`: polynomial to substract                        | `Polynomial`: $p-q$                                                |
| `multiply`    | `q: Polynomial`: polynomial to multiply with                    | `Polynomial`: $p*q$                                                |
| `plus`        | `q: Polynomial`: polynomial to sum with                         | `Polynomial`: $p+q$                                                |
| `supp`        | -                                                               | `number[][]`: support of $p$                                       |
| `toString`    | -                                                               | `string`: representation of $p$ using *lex*                        |

### Static methods

```js
  Polynomial.method();
```
| Name         | Parameters                                         | Return                                                                                                                                       |
|--------------|----------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `setVars`    | `vars: string[]`: vars considered for polynomials  | `void`                                                                                                                                       |
| `expGreater` | `a,b: number[]`: exponents to compare              | `boolean`: $a >_{\text{lex}} b$. If lengths doesn't macth, returns `false`                                                                   |
| `getVars`    | -                                                  | `string[]`: vars considered for polynomials                                                                                                  |
| `monomial`   | `exp: number[]`                                    | `Polynomial`: monomial $p$ with $\exp(p) = \text{exp}$ and $\text{lc}(p)=1$. If the exponent length is not the same as `vars` returns $p=0$  |


## Running Tests

You can run tests with the following command.

```bash
  npm test
```

To use your own tests, add them to the file `test/test.ts`.

