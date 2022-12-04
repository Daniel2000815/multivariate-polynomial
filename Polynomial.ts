import nerdamer from "nerdamer-ts";
import nerdamerjs from "nerdamer";

require("nerdamer/algebra");
export default class Polynomial {
  private coefMap: Map<string, string> = new Map();
  private varOrder: string[] = [];
  static #vars: string[] = ["t", "x", "y", "z"];

  constructor(p: string) {
    var pol = "";
    try {
      if (p.length == 0) pol = "0";
      else pol = nerdamer(p).expand().toString();
    } catch (e) {
      console.error(`ERROR PARSING POLYNOMIAL ${p}`);
    }

    // console.log("=== COMPUTING DE ", pol);

    this.computeCoefficients(pol, true);

    // console.log("POL CREADO ", this.toString());
  }

  clone() : Polynomial {
    let p = new Polynomial("0");
    p.coefMap = this.coefMap;
    p.varOrder = this.varOrder;

    return p;
  }

  /**
   * 
   * @returns map pairing each monomial to its coefficient
   */
  getCoefMap() {
    return this.coefMap;
  }

  /**
   * 
   * @returns variables of the polynomial ordered by *lex*
   */
  getVarOrder() {
    return this.varOrder;
  }

  // === PUBLIC INSTANCE METHODS ===
  /**
   * 
   * @param q polynomial to multiply with
   * @returns product with the polynomial `q`
   */
  multiply(q: Polynomial) {
    let product = "";

    this.coefMap.forEach((pVal: string, pKey: string) => {
      q.coefMap.forEach((qVal: string, qKey: string) => {
        product += `${
          product.length > 0 ? "+" : ""
        } (${pVal}*${pKey}) * (${qVal}*${qKey})`;
      });
    });

    product = nerdamer(product).expand().toString();
    return new Polynomial(product);
  }

  // === PUBLIC INSTANCE METHODS ===
  /**
   * 
   * @param q polynomial to sum with
   * @returns sum with the polynomial `q`
   */
  plus(q: Polynomial) {
    let sum = "0";
    // console.log(this.coefMap, q.coefMap);
    // console.log(Object.entries(this.coefMap));

    this.coefMap.forEach((value: string, key: string) => {
      sum += `${sum.length > 0 ? "+" : ""} (${value}*${key})`;
    });

    q.coefMap.forEach((value: string, key: string) => {
      sum += `+ (${value}*${key})`;
    });

    sum = nerdamer(sum).expand().toString();
    return new Polynomial(sum);
  }

  // === PUBLIC INSTANCE METHODS ===
  /**
   * 
   * @param q polynomial to substract
   * @returns this polynomial minus `q`
   */
  minus(q: Polynomial) {
    let sum = "0";

    this.coefMap.forEach((value: string, key: string) => {
      sum += `${sum.length > 0 ? "+" : ""} (${value}*${key})`;
      // console.log(sum);
    });

    q.coefMap.forEach((value: string, key: string) => {
      sum += `- (${value}*${key})`;
      // console.log(sum);
    });

    sum = nerdamer(sum).expand().toString();
    // console.log("RESTA", sum);
    return new Polynomial(sum);
  }

  /**
   *
   * @param q Polynomial to compare with
   * @returns Polynomials are equivalent
   */
  equals(q: Polynomial) {
    let res = true;

    this.coefMap.forEach((fVal: string, fKey: string) => {
      if (q.coefMap.has(fKey)) {
        q.coefMap.get(fKey);
        if (q.coefMap.get(fKey) !== fVal) {
          res = false;
          return;
        }
      } else {
        res = false;
        return;
      }
    });

    q.coefMap.forEach((qVal: string, qKey: string) => {
      if (this.coefMap.has(qKey)) {
        if (qVal !== this.coefMap.get(qKey)) {
          res = false;
          return;
        }
      } else {
        res = false;
        return;
      }
    });

    return res;
  }

  /**
   * 
   * @returns Leader coefficient
   */
  lc() {
    const coef = this.coefMap.get(this.varOrder[0]);

    return coef ? coef : "0";
  }

  /**
   * 
   * @returns Leader monomial
   */
  lm() {
    return this.varOrder[0];
  }

  /**
   * 
   * @returns Leader term
   */
  lt() {
    const coef1 = this.lc() !== "1";
    if (this.lc() === "0") return "0";

    return `${coef1 ? this.lc() : ""}${this.lm()}`;
  }

  /**
   * Exponent of this polynomial
   * @param vars Variables in the ring. Default is t,x,y,z
   * @return exponent of `p` using *lex*
   */
  exp(vars: string[] = Polynomial.#vars): number[] {
    let res: number[] = Array(vars.length).fill(0);

    this.coefMap.forEach((coef: string, mon: string) => {
      // console.log("uno", element);

      const degs = vars.map(function (v) {
        // console.log("CHEKANDO 2", nerdamerjs('deg(t+x^2+2*x+ x*y, x*y)').toString());
        return parseFloat(nerdamerjs(`deg(${mon}, ${v})`).toString());
      });
      // let degs = [
      //   Number(nerdamerjs(`deg(${element}, x)`)),
      //   Number(nerdamerjs(`deg(${element}, y)`)),
      //   Number(nerdamerjs(`deg(${element}, z)`)),
      // ];

      // console.log("CHEKANDO ", degs, " > ", res);
      if (Polynomial.expGreater(degs, res)) {
        // console.log(degs, " ASI ES ", res);
        res = degs;
      }
    });

    return res;
  }

  /**
   * 
   * @returns Support of the polynomial
   */
  supp() : number[][] {
    return this.varOrder.map((val: string) => new Polynomial(val).exp());
  }

  /**
   * 
   * @returns Polynomial is zero
   */
  isZero() : boolean {
    const n = this.coefMap.size;

    return n === 0 || (n === 1 && this.coefMap.values().next().value === "0");
  }

  /**
   * Divide by a set of polynomials fs = [f_1, ..., f_n] using *lex*
   * @param fs polynomials to divide with
   * @param maxIter limit of iterations allowed
   * @param verbose should return process steps
   * @returns quotients for each polynomial in fs, remainder and steps if `verbose`
   */
  divide(fs: Polynomial[], maxIter: number = 1000, verbose: boolean = false) {
    let nSteps = 0;
    var steps: { [k: string]: any } = {};
    let step: string[] = [];
    let currIt = 0;
    const s = fs.length;

    let p = this.clone();
    let r = new Polynomial("0");
    let coefs: Polynomial[] = Array(s).fill(new Polynomial("0"));

    while (!p.isZero() && currIt < maxIter) {
      nSteps++;
      currIt++;
      let i = 0;
      let divFound = 0;
      const exp_p = p.exp();

      while (i < s && divFound === 0) {
        const exp_fi = fs[i].exp();
        const gamma = Polynomial.#expMinus(exp_p, exp_fi);

        step = [];

        if (gamma.every((item) => item >= 0)) {
          const xGamma = Polynomial.monomial(gamma);
          const lcp = p.lc();
          const lcfi = fs[i].lc();

          const coef = xGamma.multiply(new Polynomial(`(${lcp}) / (${lcfi})`));

          let newQi = coefs[i].plus(coef);
          let newP = p.minus(fs[i].multiply(coef));

          step.push(`f = ${p}`);
          step.push(
            `exp(f) - exp(f_${i})= ${exp_p} - ${exp_fi} => We can divide`
          );
          step.push(`q_${i} = (${coefs[i]}) + (${coef}) = ${newQi}`);
          step.push(`p = (${p}) - (${coef} * (${fs[i]}) ) = ${newP}`);
          step.push(p.toString());
          coefs[i] = newQi;

          p = newP;
          divFound = 1;
        } else {
          i++;
        }
      }
      if (divFound === 0) {
        const LC = p.lc();
        const MON = Polynomial.monomial(exp_p);
        const lt = MON.multiply(new Polynomial(LC.toString()));

        const newR = r.plus(lt);
        const newP = p.minus(lt);

        step.push("No division posible:");
        step.push(`lt(p) = (${LC})*(${MON}) = ${lt}`);
        step.push(`r = (${r}) + lt(p) = ${newR}`);
        step.push(`p = (${p}) - lt(p) = ${newP}`);

        r = newR;
        p = newP;
      }

      steps[`step${nSteps}`] = step;
    }

    step = [];

    let mult = new Polynomial("0");
    step.push(`r = ${r}`);
    coefs.forEach((qi, i) => {
      step.push(`q_${i} = ${qi}`);
      mult = mult.plus(qi.multiply(fs[i]));
    });

    mult = mult.plus(r);
    mult = mult.minus(this);

    steps["result"] = step;

    if (!mult.isZero())
      console.error(`ERROR COMPUTING DIVISION OF ${this.toString()} IN ${fs}`);

    return {
      quotients: [...coefs],
      remainder: r,
      steps: steps,
    };
  }

  /**
   * 
   * @returns string representation of the polynomial using *lex*
   */
  toString() {
    let res = "";

    for (var i = 0; i < this.varOrder.length; i++) {
      const mon = this.varOrder[i];
      let coef = this.coefMap.get(mon);

      const hideCoef = coef === "1" || coef === "-1";
      const hideMon = mon === "1" && !hideCoef;
      let sign = "";

      if (coef?.charAt(0) === "-") {
        coef = coef.slice(1);
        sign = "-";
      } else if (i > 0) {
        sign = "+";
      }

      res += `${i > 0 ? " " : ""}${sign}${i > 0 ? " " : ""}${
        hideCoef ? "" : coef
      }${hideMon ? "" : mon}`;

      if (i < this.varOrder.length - 1 && this.varOrder.length > 1 && !hideCoef)
        res += " ";
    }

    return res;
  }

  // === PUBLIC STATIC METHODS ===
  /**
   * Sets the vars considered for the polynomials
   * @param vars 
   */
  static setVars(vars: string[]) {
    this.#vars = vars;
  }

  static getVars() {
    return this.#vars;
  }

  /**
   * Builds a monomial with the given exponent and lc=1
   * @param exp 
   * @returns monomial with exponent equal to `exp` and lc=1. If error returns 0
   */
  static monomial(exp: number[]) {
    if (exp.length !== Polynomial.#vars.length) {
      console.error("ERROR: EXPONENT NOT VALID");
      return new Polynomial("0");
    }

    let pol = "";

    Polynomial.#vars.forEach(function (value, idx) {
      pol += `(${value})^(${exp[idx]})`;
    });

    return new Polynomial(pol);
  }

  /**
   * 
   * @returns a>b using lex. If error, returns false
   */
  static expGreater(a: number[], b: number[]) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
    }

    return false;
  }

  // === PRIVATE STATIC METHODS===
  

  static #expMinus(a: number[], b: number[]) {
    if (a.length !== b.length) return [];

    return a.map((val, idx) => val - b[idx]);
  }

  static #arrayCombinations(array: Polynomial[]) {
    var result = array.flatMap((v, i) => array.slice(i + 1).map((w) => [v, w]));
    return result;
  }

  /**
   *
   * @param F Generator of the ideal I = <F>
   * @param G Supposed Groebner basis
   * @return `G` is a Groebner basis of <`F`>
   */
  static isGroebnerBasis(F: Polynomial[], G: Polynomial[]) {
    const fgPairs = this.#arrayCombinations(F);

    for (let i = 0; i < fgPairs.length; i++) {
      const r = this.sPol(fgPairs[i][0], fgPairs[i][1]).divide(G).remainder;

      if (!r.isZero()){
        return false
      };
    }

    return true;
  }

  /**
   * 
   * @param F 
   * @returns array of exponents of each polynomial in `F`
   */
  static exp(F: Polynomial[]){
    return F.map((f: Polynomial) => f.exp());
  }

  /**
   *
   * @param F Generator of the ideal I = <F>
   * @param G Supposed Groebner basis
   * @return `G` is a reduced Groebner basis of <`F`>
   */
  static isReducedGroebnerBasis(F: Polynomial[], G: Polynomial[]) {
    if (!this.isGroebnerBasis(F, G)) return false;

    for(let i=0; i<G.length; i++){
      const g = G[i];
      const newG = G.filter(p=>!p.equals(g));
      const suppG = g.supp();
      const expNewG = Polynomial.exp(newG);

      if(g.lc() !== "1")  
        return false;

      for(let j=0; j<suppG.length; j++){
        for(let k=0; k<expNewG.length; k++){
          if(!this.#expMinus(suppG[j],expNewG[k]).some((item) => item < 0))
            return false;
        }
      }
    }
    
    return true;
  }

  

  /**
   *
   * @param alfa in N^n
   * @param beta in N^n
   * @returns lcm(alfa,beta) = ( max(alfa_1,beta_1), ··· , max(alfa_n, beta_n) )
   */
  static lcm(alfa: number[], beta: number[]) {
    if (alfa.length !== beta.length) {
      return [-1];
    }

    let res: number[] = [];

    for (let i = 0; i < alfa.length; i++) {
      res.push(Math.max(alfa[i], beta[i]));
    }

    return res;
  }

  /**
   *
   * @returns S-Polynomial of f and g
   */
  static sPol(f: Polynomial, g: Polynomial) {
    const alpha = f.exp();
    const beta = g.exp();
    const gamma = this.lcm(alpha, beta);

    return this.monomial(this.#expMinus(gamma, alpha))
      .multiply(f)
      .minus(this.monomial(this.#expMinus(gamma, beta)).multiply(g));
  }

  /**
   *
   * @param F Generator of the ideal I = <F>
   * @param maxIter maximum iterations
   * @returns Groebner basis of I
   */
  static buchberger(F: Polynomial[], maxIter: number = 10000) {
    let currIt = 0;
    let G = F;
    let added;

    do {
      currIt++;
      let newG = Array.from(G);
      const fgPairs = this.#arrayCombinations(newG);

      added = false;

      for (let i = 0; i < fgPairs.length && !added; i++) {
        const r = this.sPol(fgPairs[i][0], fgPairs[i][1]).divide(newG).remainder;

        if (!r.isZero()) {
          G.push(r);
          added = true;
        }
      }
    } while (added && currIt < maxIter);

    if (!this.isGroebnerBasis(F, G)){
      console.error(`ERROR COMPUTING GROEBNER BASIS OF ${F}`);
      return [new Polynomial("0")];
    }

    return G;
  }

  

  /**
   * Cheacks if a is an integer multiple of b
   */
  static #expIsMultiple(a: number[], b: number[]) {
    if (a.length !== b.length) return false;

    let res = true;
    let mult = Math.round(a[0] / b[0]);

    a.forEach((val, idx) => {
      if (b[idx] * mult !== val) {
        res = false;
        return;
      }
    });

    return res;
  }

  // === PRIVATE INSTANCE METHODS ===
  strContainsChar(str: string, chars: string[]) {
    for (let i = 0; i < str.length; i++) {
      if (chars.includes(str[i])) return true;
    }

    return false;
  }

  computeCoefficients(pol: string, firstIt = false) {
    if (firstIt) {
      this.coefMap.clear();
    }
    if (!pol) return;
    const node = nerdamer.tree(pol);
    const nMinus = (pol.match(/-/g) || []).length;
    const nPlus = (pol.match(/\+/g) || []).length;

    // Si tiene un + no lo es: x+y
    // Si tiene algun -, lo sera si solo tiene uno: -xy, -x-y
    const isMonomial = nPlus === 0 && nMinus <= 1;

    // === NO ES MONOMIO -> SEGUIMOS SEPARANDO
    if (!isMonomial) {
      if (node.left) this.computeCoefficients(this.nodeToString(node.left));
      if (node.right)
        node.value === "-"
          ? this.computeCoefficients(`-${this.nodeToString(node.right)}`)
          : this.computeCoefficients(this.nodeToString(node.right));
    } else {
      let coef = "";
      let variable = "";
      let writingCoef = true;

      // Recorremos string
      for (let i = 0; i < pol.length; i++) {
        // Si nos encontramos con una variable, dejamos de escribir en coef. Si no encontramos
        // ningun coeficiente, significa que es 1, y si el coeficiente es -, significa que es -1

        if (Polynomial.#vars.includes(pol[i])) {
          writingCoef = false;

          if (coef.length === 0) coef = "1";
          else if (coef === "-") coef = "-1";

          // Si el coeficiente acaba con el * de multiplicaral monomio lo quitamos
          if (coef[coef.length - 1] === "*") coef = coef.slice(0, -1);
        }

        if (!["(", ")"].includes(pol[i])) {
          if (writingCoef) coef += pol[i];
          else variable += pol[i];
        }
      }

      // Si no se ecnontro ninguna variable, es 1
      if (variable === "") variable = "1";

      this.coefMap.set(variable, coef === "-" ? "-1" : coef);
    }

    // Aplicamos LEX
    let monomials = Array.from(this.coefMap.keys());
    monomials.sort(function (a, b) {
      return Polynomial.expGreater(
        new Polynomial(a).exp(Polynomial.#vars),
        new Polynomial(b).exp(Polynomial.#vars)
      )
        ? -1
        : 1;
    });

    this.varOrder = monomials;
  }

  nodeToString(node: any): string {
    // console.log(node);
    if (node !== null && node !== undefined) {
      if (node.type === "VARIABLE_OR_LITERAL") {
        const isVariable = ["x", "y", "z"].includes(node.value);
        // console.log("ES LITERAL O VARIABLE: " + node.value);
        // console.log(node.value);
        return isVariable ? node.value : node.value;
      }

      if (node.type === "OPERATOR") {
        let left = this.nodeToString(node.left);
        let right = this.nodeToString(node.right);

        // console.log("ES OPERATOR: " + node.value);
        // console.log("OPERATOR LEFT: " + left);
        // console.log("OPERATOR RIGHT: " + right);
        // console.log(`DEVUELVO ${(right && left) ? `${left}${node.value}${right}` : `${node.value}${left}`}`);

        const leftParenthesis = node.left?.type !== "VARIABLE_OR_LITERAL";
        const rightParenthesis = node.right?.type !== "VARIABLE_OR_LITERAL";

        // console.log("OPERATOR: " + node.value);
        // console.log(node.value === "-");
        // console.log("TYPEL: " + node.left?.type);
        // console.log("TYPER: " + node.right?.type);
        // console.log(`PAR.LEFT: ${leftParenthesis}, RIGHT. PAR: ${rightParenthesis}`);
        const l = leftParenthesis ? `(${left})` : `${left}`;
        const r = rightParenthesis ? `(${right})` : `${right}`;
        // console.log('RIGHT ' + r);
        if (node.value === "-") {
          // console.log("asi es:", left, right);
        }
        if (right && left) return `${l}${node.value}${r}`;
        else {
          // console.log("ASI ES", `${node.value}${l}`);
          return `${node.value}${l}`;
        }
      }

      if (node.type === "FUNCTION") {
        // console.log("ES F: " + node.value);
        let left = this.nodeToString(node.left);
        let right = this.nodeToString(node.right);

        // console.log(`DEVUELVO ${left}${node.value}${right}`);
        return `${left}${node.value}${right}`;
      }
    }

    return "";
  }
}
