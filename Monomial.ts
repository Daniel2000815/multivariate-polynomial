import Polynomial from "./Polynomial";

export default class Monomial {
    private coeff: number;
    private exp: Float64Array;
    private vars : string[]; 
  
    constructor(coeff: number = 0, exp: Float64Array = Float64Array.from([0,0,0,0]), vars: string[] = ["t","x","y","z"]) {
      if(exp.length !== vars.length){
        throw new Error("EXPONENT NOT MATCHING VARIABLES");
      }
  
      this.coeff = coeff;
      this.exp = exp;
      this.vars = vars;
    }
  
    static zero(): Monomial {
      return new Monomial(0);
    }
  
    static one(): Monomial {
      return new Monomial(1);
    }
  
    static t() : Monomial {
      return new Monomial(1, Float64Array.from([1,0,0,0]));
    }
  
    static x() : Monomial {
      return new Monomial(1, Float64Array.from([0,1,0,0]));
    }
  
    static y() : Monomial {
      return new Monomial(1, Float64Array.from([0,0,1,0]));
    }
  
    static z() : Monomial {
      return new Monomial(1, Float64Array.from([0,0,0,1]));
    }
  
    getVars(){
      return this.vars;
    }
  
    getCoef() {
      return this.coeff;
    }
  
    setCoef(coeff: number) {
      this.coeff = coeff;
    }
  
    getExp() {
      return this.exp;
    }
  
    setExp(exp: Float64Array) {
      this.exp = exp;
    }
  
    clone() {
      return new Monomial(this.coeff, this.exp, this.vars);
    }
  
    sameVars(m: Monomial){
      if(this.vars.length !== m.getVars().length)
        return false;
  
      return this.vars.every((v,idx) => v === m.getVars()[idx]);
    }
  
    gcd(m: Monomial){
      if (!this.sameVars(m)) {
        throw new Error("CAN NOT DETERMINE GCD OF MONOMIALS USING DIFFERENT VARIABLES");
      }
  
      let res: number[] = [];
  
      for (let i = 0; i < this.exp.length; i++) {
        res.push(Math.min(this.exp[i], m.exp[i]));
      }
  
      return new Monomial(1, Float64Array.from(res), this.vars);
    }

    lcm(m: Monomial){
        if (!this.sameVars(m)) {
            throw new Error("CAN NOT DETERMINE LCM OF MONOMIALS USING DIFFERENT VARIABLES");
          }
      
          let res: number[] = [];
      
          for (let i = 0; i < this.exp.length; i++) {
            res.push(Math.max(this.exp[i], m.exp[i]));
          }
      
          return new Monomial(1, Float64Array.from(res), this.vars);
    }
  
    plus(m: Monomial | number) {
      if(typeof m === "number"){
        return new Monomial(this.coeff + m, this.exp, this.vars);
      }
      else{
        if (!m.equalExponent(this) || !m.sameVars(this))
          throw new Error(`TRYING TO SUM MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES`);
  
        return new Monomial(this.coeff + m.coeff, this.exp, this.vars);
      }
    }
  
    multiply(m: Monomial | number) {
      if (typeof m === "number") {
        return new Monomial(this.coeff * m, this.exp, this.vars);
      } else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO MULTIPLY MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v + m.exp[i]);
        const c = this.coeff * m.coeff;
  
        return new Monomial(c,e, this.vars);
      }
    }
  
  
    divide(m: Monomial | number){
      if (typeof m === "number") {
        if(m === 0)
          throw new Error("TRYING TO DIVIDE MONOMIAL BY 0");
  
        return new Monomial(this.coeff / m, this.exp, this.vars);
      } 
      else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO DIVIDE MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v - m.exp[i]);
        const c = this.coeff / m.coeff;
  
        return new Monomial(c,e, this.vars);
      }
    }
  
    divides(m: Monomial){
      if (!m.sameVars(this))
        throw new Error("TRYING TO DIVIDE MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
      return this.exp.every((e,idx) => e <= m.exp[idx]);
    }
  
    isZero() {
      return this.coeff === 0;
    }
  
    isOne() {
      return this.coeff === 1 && this.exp.every((e) => e === 0);
    }
  
    equalExponent(m: Monomial) {
      return (
        this.exp.length === m.exp.length &&
        this.exp.every((v, i) => v === m.exp[i])
      );
    }
  
    equalCoeff(m: Monomial) {
      return this.coeff === m.coeff;
    }
  
    equals(m: Monomial) {
      return this.equalExponent(m) && this.equalCoeff(m);
    }
  
    toPolynomial() {
      return new Polynomial([this]);
    }
  
    toString() {
      if (this.isZero()) return "0";
      if (this.isOne()) return "1";
      let mon: string = "";
  
      if (this.coeff === -1) mon = "-";
      else if (this.coeff === 1) mon = "";
      else mon = this.coeff.toString();
  
      // Separar - del coeficiente
      if (this.coeff < 0) mon = [mon.slice(0, 1), " ", mon.slice(1)].join("");
  
      this.vars.forEach((v, idx) => {
        const e = this.exp[idx];
        if (this.exp[idx] !== 0) mon += `${v}${e > 1 ? `^${this.exp[idx]}` : ""}`;
      });
  
      return mon;
    }
  }