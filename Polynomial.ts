import nerdamer from "nerdamer-ts";
import nerdamerjs, { diff, gcd } from "nerdamer";
import Monomial from "./Monomial";

require("nerdamer/algebra");

export class Ideal {
  private generators : Polynomial[];

  constructor(generators: Polynomial[]){
    this.generators = Polynomial.buchberger(generators);
  }

  static zero(){
    return new Polynomial([Monomial.zero()]);
  }

  static one(){
    return new Polynomial([Monomial.one()]);
  }

  multiply(p: Polynomial){
    const newGens = this.generators.map(f=>f.multiply(p));
    return new Ideal(newGens);
  }

  intersect(J: Ideal){
    const F = this.generators;
    const G = J.generators;


    const p1 = new Polynomial("t");
    const p2 = new Polynomial("1-t");
    const H = new Ideal(this.multiply(p1).generators.concat(J.multiply(p2).generators));

    let res : Polynomial[] = [];
    H.generators.forEach(gen => {
      if(!gen.hasVariable("t")){
        res.push(gen);
      }
    })

    return res;
  }

  static implicit(fx: Polynomial, fy: Polynomial, fz: Polynomial){
    let elimVars : string[] = [];
    [fx,fy,fz].forEach(f=> elimVars = elimVars.concat(f.usedVars()));
    elimVars = [...new Set(elimVars)];

    const x = new Polynomial("x");
    const y = new Polynomial("y");
    const z = new Polynomial("z");

    const I = new Ideal([x.minus(fx), y.minus(fy), z.minus(fz)]);
    let J : Polynomial[] = [];
    
    I.generators.forEach(gen => {
      if(!gen.hasVariables(elimVars)){
        J.push(gen);
      }
    })

    const intersection = J.find(pol => elimVars.every(v => !pol.usedVars().includes(v)));
    console.log("INTER: " + intersection?.toString());
    return intersection !== undefined ? intersection : new Polynomial("0");
  }
}

export default class Polynomial {
  private monomials: Monomial[] = [Monomial.zero()];
  private vars: string[];

  constructor(arg: string | Monomial[], vars: string[] = ["t", "x", "y", "z"]) {
    this.vars = vars;

    if (typeof arg === "string") {
      var pol = "";
      this.monomials = [new Monomial(1, Float64Array.from(this.vars.map(v=>0)), this.vars)];
      
      try {
        if (arg.length == 0) pol = "0";
        else pol = nerdamer(arg).expand().toString();
      } catch (e) {
        throw new Error(`ERROR PARSING POLYNOMIAL ${arg}`);
      }

      this.computeCoefficients(pol, true);
    } else {
      if(arg.every(m => 
          m.getExp().length === this.vars.length &&
          m.getVars().every((v,idx) => v===this.vars[idx])
        )){
          this.monomials = arg.length>1 ? arg.filter(m => m.getCoef()!==0) : arg;
        }
        else{
          throw new Error("INITIALIZING POLYNOMIAL WITH MONOMIALS IN DIFFERENT RINGS");
        }
    }

    // Aplicamos LEX
    this.applyLex();
  }

  applyLex() {
    this.monomials = this.monomials.sort(function (a, b) {
      return Polynomial.expGreater(a.getExp(), b.getExp()) ? -1 : 1;
    });
  }

  computeCoefficients(pol: string, firstIt = false) {
    if (firstIt) {
      this.monomials = [];
    }
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

  clone(): Polynomial {
    let p = new Polynomial("0");
    p.monomials = this.monomials;

    return p;
  }

  /**
   *
   * @returns list of monomials making the array ordered by *lex*
   */
  getMonomials() {
    return this.monomials;
  }

  hasVariable(v: string){
    const p = new Polynomial(v);
    
    const idx = p.exp().findIndex(val=>val>0);

    return this.monomials.some(m=>
      m.getExp()[idx] > 0
    );
  }

  hasVariables(v: string[]){
    return v.every(vi => this.hasVariable(vi));
  }

  getVars() : string[] {
    return this.vars;
  }

  usedVars() : string[] {
    let res : string[] = [];
    this.exp().forEach((e,idx) => {if(e>0) res.push(this.vars[idx])});

    return res;
  }
  // === PUBLIC INSTANCE METHODS ===
  /**
   *
   * @param q polynomial to multiply with
   * @returns product with the polynomial `q`
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
   *
   * @param q polynomial to sum with
   * @returns sum with the polynomial `q`
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
   *
   * @param q polynomial to substract
   * @returns this polynomial minus `q`
   */
  minus(q: Polynomial) {
    return this.plus(q.multiply(-1));
  }

  /**
   *
   * @param q Polynomial to compare with considering order
   * @returns Polynomials are equivalent and with the same order
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
   * @returns Leader coefficient
   */
  lc() {
    return this.monomials[0].getCoef();
  }

  /**
   *
   * @returns Leader monomial
   */
  lm() {
    return new Monomial(1, this.monomials[0].getExp(), this.vars);
  }

  /**
   *
   * @returns Leader term
   */
  lt() {
    return this.monomials[0];
  }

  /**
   *
   * @returns Second leader coefficient
   */
  slc() : number{
    return this.monomials.length > 1 ? this.monomials[1].getCoef() : 0;
  }

  /**
   *
   * @returns Second leader monomial
   */
  slm() : Monomial{
    return this.monomials.length > 1 ? new Monomial(1, this.monomials[1].getExp(), this.vars) : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
  }

  /**
   *
   * @returns Second leader term
   */
  slt() {
    return this.monomials.length > 1  ? this.monomials[1] : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
  }

  /**
   * Exponent of this polynomial
   * @param vars Variables in the ring. Default is t,x,y,z
   * @return exponent of `p` using *lex*
   */
  exp(): Float64Array {
    return this.monomials[0].getExp();
  }

  /**
   *
   * @returns Support of the polynomial
   */
  supp(): Float64Array[] {
    return this.monomials.map((m: Monomial) => m.getExp());
  }

  /**
   *
   * @returns Polynomial is zero
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
        const gamma = Polynomial.#expMinus(exp_p, exp_fi);

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
   * @returns string representation of the polynomial using *lex*
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


  // /**
  //  * Builds a monomial with the given exponent and lc=1
  //  * @param exp
  //  * @returns monomial with exponent equal to `exp` and lc=1. If error returns 0
  //  */
  // static monomial(exp: number[]) {
  //   if (exp.length !== this.vars.length) {
  //     console.error("ERROR: EXPONENT NOT VALID");
  //     return new Polynomial("0");
  //   }

  //   let pol = "";

  //   Polynomial.#vars.forEach(function (value, idx) {
  //     pol += `(${value})^(${exp[idx]})`;
  //   });

  //   return new Polynomial(pol);
  // }

  /**
   * 
   * @brief f Checks if `f` and `g` use the same variables
   */
  sameVars(p: Polynomial){
    if(this.vars.length !== p.getVars().length)
      return false;

    return this.vars.every((v,idx) => v === p.getVars()[idx]);
  }

  /**
   *
   * @returns a>b using lex. If error, returns false
   */
  static expGreater(a: Float64Array, b: Float64Array) {
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

  /**
   * 
   * @returns `a`-`b`
   */
  static #expMinus(a: Float64Array, b: Float64Array) {
    if (a.length !== b.length) return Float64Array.from([]);

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

      if (!r.isZero()) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   * @param F
   * @returns array of exponents of each polynomial in `F`
   */
  static exp(F: Polynomial[]) {
    return F.map((f: Polynomial) => f.exp());
  }

  /**
   *
   * @param F Generator of the ideal I = <F>
   * @param G Supposed Groebner basis
   * @return `G` is a reduced Groebner basis of <`F`>
   */
  static isReducedGroebnerBasis(F: Polynomial[], G: Polynomial[]) {
    let res = true;
    if (!this.isGroebnerBasis(F, G)) res = false;

    for (let i = 0; i < G.length && res; i++) {
      const g = G[i];
      const newG = G.filter((p) => !p.equals(g));
      const suppG = g.supp();
      const expNewG = Polynomial.exp(newG);

      if (g.lc() !== 1) res = false;

      for (let j = 0; j < suppG.length && res; j++) {
        for (let k = 0; k < expNewG.length && res; k++) {
          if (!this.#expMinus(suppG[j], expNewG[k]).some((item) => item < 0))
            res = false;
        }
      }
    }

    return res;
  }

  /**
   *
   * @param alfa in N^n
   * @param beta in N^n
   * @returns lcm(alfa,beta) = ( max(alfa_1,beta_1), ··· , max(alfa_n, beta_n) )
   */
  static lcm(f: Polynomial, g: Polynomial) : Monomial {
    if (!f.sameVars(g)) {
      throw new Error("CAN NOT COMPUTE LCM OF TWO POLYNOMIALS WOTH DIFFERENT VARIABLES");
    }

    let res: number[] = [];

    for (let i = 0; i < f.exp().length; i++) {
      res.push(Math.max(f.exp()[i], g.exp()[i]));
    }

    return new Monomial(1, Float64Array.from(res), f.vars);
  }

  /**
   *
   * @param alfa in N^n
   * @param beta in N^n
   * @returns gcd(α,β) = ( min(α_1,β_1), ··· , min(α_n, β_n) )
   */
    static gcd(f: Polynomial, g: Polynomial) : Monomial {
      return f.lm().gcd(g.lm());
    }

  /**
   *
   * @returns S-Polynomial of f and g. Asummes that `f` and `g` use the same variables
   */
  static sPol(f: Polynomial, g: Polynomial) {
    const alpha = f.exp();
    const beta = g.exp();
    const gamma = this.lcm(f, g).getExp();

    return new Monomial(1, this.#expMinus(gamma, alpha), f.getVars())
      .toPolynomial()
      .multiply(f)
      .minus(
        new Monomial(1, this.#expMinus(gamma, beta), f.getVars()).toPolynomial().multiply(g)
      );
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
        const r = this.sPol(fgPairs[i][0], fgPairs[i][1]).divide(
          newG
        ).remainder;

        if (!r.isZero()) {
          G.push(r);
          added = true;
        }
      }
    } while (added && currIt < maxIter);

    if (!this.isGroebnerBasis(F, G)) {
      console.error(`ERROR COMPUTING GROEBNER BASIS OF ${F}`);
      return [new Polynomial("0")];
    }

    return G;
  }

    /**
   *
   * @param F Generator of the ideal I = <F>
   * @param maxIter maximum iterations
   * @returns Groebner reduced base of I
   */
    static buchbergerReduced(F: Polynomial[], maxIter: number = 1000) {
      let currIt = 0;
      let G = F;
      let added;
      let opAhorradas = 0;

      do {
        currIt++;
        added = false;
  
        let newG = Array.from(G);
        const fgPairs = this.#arrayCombinations(newG);
  
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
            console.log(`CRT1: ${!this.criterion1(f, g)}\tCRT2: ${!this.criterion2(f,g,newG)}\tCRT3: ${!this.criterion3(f, g, newG)}`)
            opAhorradas++;
          }
        }
      } while (added && currIt < maxIter);
  
      if(!this.isReducedGroebnerBasis(F,G))
        console.error(`ERROR COMPUTING REDUCED GROEBNER BASE OF ${F}`);
  
        console.log("ITERACION AHORRADA: ", opAhorradas);
      return G;
    }
  
    static criterion1(f: Polynomial, g: Polynomial): boolean {
      let res = true;
      const lcmFG = this.lcm(f, g);
  
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
  
    static criterion2(gi: Polynomial, gj: Polynomial, G: Polynomial[]): boolean {
      // return false;
  
      const a = this.lcm(gi, gj);
      const startIndex = Math.max(G.indexOf(gi), G.indexOf(gj)) + 1;
      let res = false;
  
      for(let i=startIndex; i<G.length && !res; i++){
        if(this.#expIsMultiple(a.getExp(), G[i].exp())){
          res = true;
        }
      }
  
      return res;
    }

    /**
     * 
     */
    static criterion3(f: Polynomial, g: Polynomial, G: Polynomial[]) : boolean {
      let res = false;
      const startIndex = Math.max(G.indexOf(f), G.indexOf(g)) + 1;

      for(let i=startIndex; i<G.length && !res; i++){
        const h = G[i];

        const sPolfh = Polynomial.sPol(f, h);
        const sPolgh = Polynomial.sPol(g, h);

        if(!h.lm().divides(Polynomial.lcm(f,g))){
          continue;
        }
        if(sPolfh.reduces(G) || sPolgh.reduces(G)){
          res = true;
        }
        else{
          const lmF = f.lm();
          const lmG = g.lm();
          const lmH = h.lm();
          const gdcFG = Polynomial.gcd(f,g);

          const cond1 = lmH.divides(lmF.divide(gdcFG)) && !g.slm().multiply(h.lm()).equals(h.slm().multiply(g.lm()));
          const cond2 = lmH.divides(lmG.divide(gdcFG)) && !f.slm().multiply(h.lm()).equals(h.slm().multiply(f.lm()));

          res = cond1 || cond2;
        }
        
      }

      return res;
    }

  /**
   * Checks if a is an integer multiple of b
   */
  static #expIsMultiple(a: Float64Array, b: Float64Array) {
    if (a.length !== b.length) return false;

    // let res = true;
    // let mult = Math.round(a[0] / b[0]);

    // a.forEach((val, idx) => {
    //   if (b[idx] * mult !== val) {
    //     res = false;
    //     return;
    //   }
    // });

    // return res;

    return a.every((val, idx) => val <= b[idx]);
  }

  // === PRIVATE INSTANCE METHODS ===
  strContainsChar(str: string, chars: string[]) {
    for (let i = 0; i < str.length; i++) {
      if (chars.includes(str[i])) return true;
    }

    return false;
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
