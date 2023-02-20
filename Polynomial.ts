import nerdamer from "nerdamer-ts";
import nerdamerjs from "nerdamer";
import {Monomial} from "./Monomial";
import {Ideal} from "./Ideal";

require("nerdamer/algebra");

/**
 * Represents a polynomial as a collection of monomials in a specified ring and using the *lex* monomial order
 */
export class Polynomial {
  /**
   * Monomials forming the polynomial ordered with *lex*
   */
  private monomials: Monomial[] = [Monomial.zero()];
  /**
   * Generators of the ring in R to which the polynomial belongs
   */
  private vars: string[];

  /**
   * 
   * @param p string representation of the polynomial or monomial collection that form the polynomial
   * @param vars Generators of the ring in R to which the polynomial belongs
   */
  constructor(p: string | Monomial[], vars: string[] = ["t", "x", "y", "z"]) {
    this.vars = vars;

    if (typeof p === "string") {
      var pol = "";
      
      
      try {
        if (p.length == 0) pol = "0";
        else pol = nerdamer(p).expand().toString();
      } catch (e) {
        throw new Error(`ERROR PARSING POLYNOMIAL ${p}`);
      }

      this.monomials = [];
      this.computeCoefficients(pol);
    } else {
      if(p.every(m => 
          m.getExp().length === this.vars.length &&
          m.getVars().every((v,idx) => v===this.vars[idx])
        )){
          this.monomials = p.length>1 ? p.filter(m => m.getCoef()!==0) : p;
        }
        else{
          throw new Error("INITIALIZING POLYNOMIAL WITH MONOMIALS IN DIFFERENT RINGS");
        }
    }

    // Aplicamos LEX
    this.applyLex();
  }

  /**
   * Orders `monomials` using *lex*
   */
  private applyLex() {
    this.monomials = this.monomials.sort(function (a, b) {
      return Polynomial.expGreater(a.getExp(), b.getExp()) ? -1 : 1;
    });
  }

  /**
   * Parses a string to a Polynomial
   * @param pol string representation of the polynomial
   */
  private computeCoefficients(pol: string) : void {
    // if (firstIt) {
    //   this.monomials = [];
    // }
    if (!pol) return;
    
    const node = nerdamer.tree(pol);
    const nMinus = (pol.match(/-/g) || []).length;
    const nPlus = (pol.match(/\+/g) || []).length;

    // == VEMOS SI ES MONOMIO ==
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

        if (this.vars.includes(pol[i])) {
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

      // TODO: VER SI SE PUEDE USAR OTRA COSA QUE NO SEA EVAL
      const c = coef === "-" ? -1 : eval(coef);
      
      const e = this.vars.map(function (v) {
        // console.log("CHEKANDO 2", nerdamerjs('deg(t+x^2+2*x+ x*y, x*y)').toString());
        return parseFloat(nerdamerjs(`deg(${variable}, ${v})`).toString());
      });

      this.monomials.push(new Monomial(c, Float64Array.from(e), this.vars));
      // this.coefMap.set(variable, coef === "-" ? "-1" : coef);
    }
  }

  /**
   * 
   * @returns Copy of the polynomial
   */
  clone(): Polynomial {
    let p = new Polynomial("0");
    p.monomials = this.monomials;

    return p;
  }

  /**
   *
   * List of monomials making the array ordered by *lex*
   */
  getMonomials() {
    return this.monomials;
  }

  /**
   * 
   * Checks if `v` is a variable of the ring of this polynomial
   */
  hasVariable(v: string){
    const p = new Polynomial(v);
    
    const idx = p.exp().findIndex(val=>val>0);

    return this.monomials.some(m=>
      m.getExp()[idx] > 0
    );
  }

  /**
   * 
   * Checks if all variables in `v` are variables of the ring of this polynomial
   */
  hasVariables(v: string[]){
    return v.every(vi => this.hasVariable(vi));
  }

  /**
   * 
   * List of variables of the ring of this polynomial
   */
  getVars() : string[] {
    return this.vars;
  }

  /**
   * 
   * List of the variables from the ring used by the polynomial
   */
  usedVars() : string[] {
    let res : string[] = [];
    this.exp().forEach((e,idx) => {if(e>0) res.push(this.vars[idx])});

    return res;
  }

  /**
   * Product of this polynomial with `q`
   * @param q Polynomial or number to multiply with
   */
  multiply(q: Polynomial | number) {
    let product: Monomial[] = [];

    if (typeof q === "number") {
      product = this.monomials.map((m) => m.multiply(q));
      return new Polynomial(product, this.vars);
    } else {
      this.monomials.forEach((pm: Monomial) => {
        q.monomials.forEach((qm: Monomial) => {
          const coef = pm.getCoef() * qm.getCoef();
          const exp = pm.getExp().map(function (num, idx) {
            return num + qm.getExp()[idx];
          });

          product.push(new Monomial(coef, exp, this.vars));
        });
      });

      // comprobamos exponentes repetidos y los sumamos

      product = product.reduce(
        (acc: Monomial[], cur: Monomial, idx: number) => {
          // Si ya existe el monomio lo sumamos
          const m = acc.find((mon) => cur.equalExponent(mon));
          if (m !== undefined) {
            const i = acc.indexOf(m);
            acc[i].setCoef(acc[i].getCoef() + cur.getCoef());
          } else acc.push(cur);

          return acc;
        },
        []
      );
    }

    return new Polynomial(product, this.vars);
  }

  /**
   * Sum of this polynomial with `q`
   * @param q Polynomial or number to sum with
   */
  plus(q: Polynomial) {
    let intersection = this.monomials.filter((x) =>
      q.monomials.some((y) => y.equalExponent(x))
    );
    let difference = this.monomials
      .concat(q.monomials)
      .filter((x) => !intersection.some((y) => y.equalExponent(x)));

    let res : Monomial[] = [];
    let qMonomialsUsed: Monomial[] = [];

    for (let i = 0; i < this.monomials.length; i++) {
      const mp = this.monomials[i];
      let foundPair = false;
      for (let j = 0; j < q.monomials.length && !foundPair; j++) {
        const mq = q.monomials[j];
        if (mp.equalExponent(mq)) {
          res.push(mp.plus(mq));
          foundPair = true;
          qMonomialsUsed.push(mq);
        }
      }

      if (!foundPair) {
        res.push(mp);
      }
    }

    const qMonomialsUnused = q.monomials.filter(
      (x) => !qMonomialsUsed.some((y) => y.equalExponent(x))
    );

    res = res.concat(qMonomialsUnused);

    return new Polynomial(res, this.vars);
  }

  /**
   * Substraction of this polynomial with `q`
   * @param q Polynomial or number to substract
   */
  minus(q: Polynomial) {
    return this.plus(q.multiply(-1));
  }

  /**
   *
   * Checks if polynomials are equivalent
   */
  equals(q: Polynomial) {
    return (
      this.monomials.length === q.monomials.length &&
      (
        this.monomials.length === 1 && (this.monomials[0].getCoef() === 0 && q.monomials[0].getCoef() ===0) ||
        this.monomials.every((m, idx) => m.equals(q.monomials[idx]))
      )
    );
  }

  /**
   *
   * Leader coefficient
   */
  lc() {
    return this.monomials[0].getCoef();
  }

  /**
   *
   * Leader monomial
   */
  lm() {
    return new Monomial(1, this.monomials[0].getExp(), this.vars);
  }

  /**
   *
   * Leader term
   */
  lt() {
    return this.monomials[0];
  }

  /**
   *
   * Second leader coefficient
   */
  slc() : number{
    return this.monomials.length > 1 ? this.monomials[1].getCoef() : 0;
  }

  /**
   *
   * Second leader monomial
   */
  slm() : Monomial{
    return this.monomials.length > 1 ? new Monomial(1, this.monomials[1].getExp(), this.vars) : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
  }

  /**
   *
   * Second leader term
   */
  slt() {
    return this.monomials.length > 1  ? this.monomials[1] : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
  }

  /**
   * Exponent of this polynomial
   */
  exp(): Float64Array {
    return this.monomials[0].getExp();
  }

  /**
   *
   * Support of the polynomial
   */
  supp(): Float64Array[] {
    return this.monomials.map((m: Monomial) => m.getExp());
  }

  /**
   *
   * Checks if polynomial is equivalent to zero
   */
  isZero(): boolean {
    const n = this.monomials.length;
    return n === 0 || (n === 1 && this.monomials[0].getCoef() === 0);
  }

  /**
   * Checks if polynomial reduces to 0 in G
   * @param G 
   */
  reduces(G: Polynomial[]){
    return this.divide(G).remainder.isZero();
  }

  /**
   * Divide by a set of polynomials fs = [f_1, ..., f_n] using *lex*
   * @param fs polynomials to divide with
   * @param maxIter limit of iterations allowed
   * @param verbose should return process steps
   * @returns quotients for each polynomial in fs, remainder and steps if `verbose`
   */
  divide(fs: Polynomial[], maxIter: number = 1000, verbose: boolean = false) {
    if(fs.some(fi => fi.isZero()))
      throw new Error(`TRYING TO DIVIDE BY 0`);

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
        const gamma = Polynomial.expMinus(exp_p, exp_fi);

        step = [];

        if (gamma.every((item) => item >= 0)) {
          const xGamma = new Monomial(1, gamma, this.vars);
          const lcp = p.lc();
          const lcfi = fs[i].lc();

          const coef = new Polynomial([xGamma.multiply(lcp / lcfi)]);

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
        const MON = new Monomial(1, exp_p, this.vars);
        const lt = new Polynomial([MON.multiply(LC)]);

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
   * String representation of the polynomial using *lex*
   */
  toString() {
    let res = "";

    for (var i = 0; i < this.monomials.length; i++) {
      const mon = this.monomials[i];
      const monSt = mon.toString();

      res += `${i > 0 ? " " : ""}${
        !["+", "-"].includes(monSt[0]) && i > 0 ? "+ " : ""
      }${mon.toString()}`;

      if (i < this.monomials.length - 1 && this.monomials.length > 1) res += "";
    }

    return res;
  }

  /**
   * 
   * Checks if this polynomial and `p` are in the same ring
   */
  sameVars(p: Polynomial){
    if(this.vars.length !== p.getVars().length)
      return false;

    return this.vars.every((v,idx) => v === p.getVars()[idx]);
  }

  /**
   *
   * Chacks if a>b using lex.
   */
  static expGreater(a: Float64Array, b: Float64Array) {
    if (a.length !== b.length) {
      throw new Error("TRYING TO COMPARE EXPONENTS OF DIFFERENT SIZE");
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return true;
      else if (a[i] < b[i]) return false;
    }

    return false;
  }

  // === PRIVATE STATIC METHODS===

  /**
   * 
   * `a`-`b`
   */
  private static expMinus(a: Float64Array, b: Float64Array) {
    if (a.length !== b.length) return Float64Array.from([]);

    return a.map((val, idx) => val - b[idx]);
  }

  /**
   * 
   * All possible pairs of combinations of `array`
   */
  private static arrayCombinations(array: Polynomial[]) {
    var result = array.flatMap((v, i) => array.slice(i + 1).map((w) => [v, w]));
    return result;
  }

  /**
   * Checks if `G` is a Groebner basis of <`F`>
   * @param F Generator of the ideal I = <F>
   * @param G Supposed Groebner basis
   */
  static isGroebnerBasis(F: Polynomial[], G: Polynomial[]) {
    const fgPairs = this.arrayCombinations(F);

    for (let i = 0; i < fgPairs.length; i++) {
      const r = this.sPol(fgPairs[i][0], fgPairs[i][1]).divide(G).remainder;

      if (!r.isZero()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Array of exponents of each polynomial in `F`
   */
  static exp(F: Polynomial[]) {
    return F.map((f: Polynomial) => f.exp());
  }

  /**
   * Checks if `G` is a reduced Groebner basis of <`F`>
   * @param F Generator of the ideal I = <F>
   * @param G Supposed Groebner basis
   */
  static isReducedGroebnerBasis(F: Polynomial[], G: Polynomial[]) {
    let res = true;
    if (!this.isGroebnerBasis(F, G)) res = false;

    for (let i = 0; i < G.length && res; i++) {
      const g = G[i];
      const suppG = g.supp();

      const newG = G.filter((p) => !p.equals(g));
      const expNewG = Polynomial.exp(newG);

      if (g.lc() !== 1) res = false;

      for (let j = 0; j < suppG.length && res; j++) {
        for (let k = 0; k < expNewG.length && res; k++) {
          if (!this.expMinus(suppG[j], expNewG[k]).some((item) => item < 0))
            res = false;
        }
      }
    }

    return res;
  }

  /**
   *
   * Lowest common multiple of this polynomial and `g`
   */
  lcm(g: Polynomial) : Monomial {
    if (!this.sameVars(g)) {
      throw new Error("CAN NOT COMPUTE LCM OF TWO POLYNOMIALS WOTH DIFFERENT VARIABLES");
    }

    let res: number[] = [];

    for (let i = 0; i < this.exp().length; i++) {
      res.push(Math.max(this.exp()[i], g.exp()[i]));
    }

    return new Monomial(1, Float64Array.from(res), this.vars);
  }

  /**
   *
   * Greatest common divider of this polynomial and `g`
   */
    gcd(g: Polynomial) : Monomial {
      return this.lm().gcd(g.lm());
    }

  /**
   *
   * @returns S-Polynomial of f and g. Asummes that `f` and `g` use the same variables
   */
  static sPol(f: Polynomial, g: Polynomial) {
    const alpha = f.exp();
    const beta = g.exp();
    const gamma = f.lcm(g).getExp();

    return new Monomial(1, this.expMinus(gamma, alpha), f.getVars())
      .toPolynomial()
      .multiply(f)
      .minus(
        new Monomial(1, this.expMinus(gamma, beta), f.getVars()).toPolynomial().multiply(g)
      );
  }

  /**
   * Computes a Groebner base of I using Buchberger's Algorithm
   * @param F Generator of the ideal I = <F>
   * @param maxIter maximum iterations
   */
    static buchberger(F: Polynomial[], maxIter: number = 1000) {
      let currIt = 0;
      let G = F;
      let added;
      let opAhorradas = 0;

      do {
        currIt++;
        added = false;
  
        let newG = Array.from(G);
        const fgPairs = this.arrayCombinations(newG);
  
        for (let i = 0; i < fgPairs.length && !added; i++) {
          const f = fgPairs[i][0];
          const g = fgPairs[i][1];
  
          if (!this.criterion1(f, g) && !this.criterion3(f, g, newG)) {
            const r = this.sPol(f,g).divide(
              newG
            ).remainder;
  
            if (!r.isZero()) {
              G.push(r);
              added = true;
            }
          }
          else{
            opAhorradas++;
          }
        }
      } while (added && currIt < maxIter);
  
      return G;
    }

    /**
   * Computes a reduced Groebner base of I using Buchberger's Algorithm and Criteria
   * @param F Generator of the ideal $I = <F>$
   * @param maxIter maximum iterations
   */
    static buchbergerReduced(F: Polynomial[], maxIter: number = 1000) {
      return this.reduce(this.buchberger(F, maxIter));
    }

    /**
     * Reduces a Groebner base
     * @param G base to reduce
     */
    static reduce(G: Polynomial[]) : Polynomial[]{
      let res : Polynomial[] = [];
      
      G = G.map(g => g.multiply(1/g.lc()));

      for(let i=0; i<G.length; i++){
        let g = G[i];
        let div = g.divide(G.filter(e => !e.equals(g)));

        if(!div.remainder.isZero()){
          G[i] = div.remainder;
          res.push(div.remainder);
        }

      }
      // G.forEach(g => {
      //   const div = g.divide(G.filter(e => !e.equals(g)));
      //   if(!div.remainder.isZero())
      //     res.push(div.remainder);
          
      // });      
      return res;
    }
  
    private static criterion1(f: Polynomial, g: Polynomial): boolean {
      let res = true;
      const lcmFG = f.lcm(g);
  
      const expF = f.exp();
      const expG = g.exp();

      const s = expF.length;
      const lcmfLcmg = Array(s).fill(0);
  
      for (let i = 0; i < s; i++) {
        lcmfLcmg[i] = expF[i] + expG[i];
      }

      //console.log(expF + " + " + expG + " = " + lcmfLcmg);
  
      for (let i = 0; i < s && res; i++) {
        if (lcmfLcmg[i] !== lcmFG.getExp()[i]){
          // console.log(lcmFG, " != ", lcmfLcmg);
          res = false;
        }
        else{
          // console.log(lcmFG, " = ", lcmfLcmg);
        }
      }
      
      

      // console.log("RES: " + res+ "\n==========");
      return res;
    }
  
    private static criterion2(gi: Polynomial, gj: Polynomial, G: Polynomial[]): boolean {
      // return false;
  
      const a = gi.lcm(gj);
      const startIndex = Math.max(G.indexOf(gi), G.indexOf(gj)) + 1;
      let res = false;
  
      for(let i=startIndex; i<G.length && !res; i++){
        if(this.expIsMultiple(a.getExp(), G[i].exp())){
          res = true;
        }
      }
  
      return res;
    }

    /**
     * 
     */
    private static criterion3(f: Polynomial, g: Polynomial, G: Polynomial[]) : boolean {
      let res = false;
      const startIndex = Math.max(G.indexOf(f), G.indexOf(g)) + 1;

      for(let i=startIndex; i<G.length && !res; i++){
        const h = G[i];

        const sPolfh = Polynomial.sPol(f, h);
        const sPolgh = Polynomial.sPol(g, h);

        if(!h.lm().divides(f.lcm(g))){
          continue;
        }
        if(sPolfh.reduces(G) || sPolgh.reduces(G)){
          res = true;
        }
        else{
          const lmF = f.lm();
          const lmG = g.lm();
          const lmH = h.lm();
          const gdcFG = f.gcd(g);

          const cond1 = lmH.divides(lmF.divide(gdcFG)) && !g.slm().multiply(h.lm()).equals(h.slm().multiply(g.lm()));
          const cond2 = lmH.divides(lmG.divide(gdcFG)) && !f.slm().multiply(h.lm()).equals(h.slm().multiply(f.lm()));

          res = cond1 || cond2;
        }
        
      }

      return res;
    }

  /**
   * Checks if `a` is an integer multiple of `b`
   */
  private static expIsMultiple(a: Float64Array, b: Float64Array) {
    if (a.length !== b.length) return false;

    return a.every((val, idx) => val <= b[idx]);
  }

  private strContainsChar(str: string, chars: string[]) {
    for (let i = 0; i < str.length; i++) {
      if (chars.includes(str[i])) return true;
    }

    return false;
  }

  private nodeToString(node: any): string {
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

  static implicitate(fx: Polynomial, fy: Polynomial, fz: Polynomial){
    let elimVars : string[] = [];
    [fx,fy,fz].forEach(f=> elimVars = elimVars.concat(f.usedVars()));
    elimVars = [...new Set(elimVars)];

    const x = new Polynomial("x");
    const y = new Polynomial("y");
    const z = new Polynomial("z");

    const I = new Ideal([x.minus(fx), y.minus(fy), z.minus(fz)]);
    let J : Polynomial[] = [];
    
    I.getGenerators().forEach(gen => {
      if(!gen.hasVariables(elimVars)){
        J.push(gen);
      }
    })

    const intersection = J.find(pol => elimVars.every(v => !pol.usedVars().includes(v)));
    console.log("INTER: " + intersection?.toString());
    return intersection !== undefined ? intersection : new Polynomial("0");
  }
}
