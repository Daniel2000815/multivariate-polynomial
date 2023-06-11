import {Polynomial} from "./Polynomial";

/**
 * Represents a monomial in the ring R<t,x,y,z> or any other variables specified
 */
export class Monomial {
    private coef: number;
    private exp: Float64Array;
    private vars : string[]; 
  
    /**
     * 
     * @param coef Leader coefficient 
     * @param exp Exponent
     * @param variables Variables of the ideal to which the monomial belongs
     */
    constructor(coef: number = 0, exp: Float64Array = Float64Array.from([0,0,0,0]), vars: string[] = ["t","x","y","z"]) {
      if(exp.length !== vars.length){
        throw new Error("EXPONENT NOT MATCHING VARIABLES");
      }
  
      this.coef = coef;
      this.exp = exp;
      this.vars = vars;
    }
  
    /**
     * Push new variables to the ring and updates the exponent
     * @param newVars variables to add
     */
    pushVariables(newVars : string[]){
      newVars = [...new Set(newVars)];
      const varsToAdd = newVars.filter(v => !this.vars.includes(v));

      this.vars = this.vars.concat(varsToAdd);
      this.exp = Float64Array.from(Array.from(this.exp).concat(varsToAdd.map(v=>0)));
    }

    /**
     * Insert new variables before the existing ones to the ring and updates the exponent
     * @param newVars variables to add
     */
    insertVariables(newVars : string[]){
      newVars = [...new Set(newVars)];
      const varsToAdd = newVars.filter(v => !this.vars.includes(v));

      this.vars = varsToAdd.concat(this.vars);
      this.exp = Float64Array.from(varsToAdd.map(v=>0).concat(Array.from(this.exp)));
    }

    /**
     * Remove variables of the ring and updates the exponent
     * @param oldVars variables to remove
     */
    removeVariables(oldVars : string[]){
      oldVars = [...new Set(oldVars)];
      const varsToRemove = oldVars.filter(v => this.vars.includes(v));

      let newVars = this.vars.filter(v => !varsToRemove.includes(v));
      let newExp = this.exp.filter((e,idx) => !varsToRemove.includes(this.vars[idx]));
      this.vars = newVars;
      this.exp = newExp;
    }

    /**
     * @brief Monomial 0 in <t,x,y,z>
     */
    static zero(): Monomial {
      return new Monomial(0);
    }
  

    /**
     * @brief Monomial 1 in <t,x,y,z>
     */
    static one(): Monomial {
      return new Monomial(1);
    }
  
    /**
     * @brief Monomial t in <t,x,y,z>
     */
    static t() : Monomial {
      return new Monomial(1, Float64Array.from([1,0,0,0]));
    }
  
    /**
     * @brief Monomial x in <t,x,y,z>
     */
    static x() : Monomial {
      return new Monomial(1, Float64Array.from([0,1,0,0]));
    }
  
    /**
     * @brief Monomial y in <t,x,y,z>
     */
    static y() : Monomial {
      return new Monomial(1, Float64Array.from([0,0,1,0]));
    }
  
    /**
     * @brief Monomial z in <t,x,y,z>
     */
    static z() : Monomial {
      return new Monomial(1, Float64Array.from([0,0,0,1]));
    }
  

    /**
     * 
     * Variables of the ideal to which the monomial belongs
     */
    getVars(){
      return this.vars;
    }
  
    /**
     * 
     * Coefficient of the monomial
     */
    getCoef() {
      return this.coef;
    }
  
    /**
     * 
     * @param coef New coeficient of the monomial
     */
    setCoef(coef: number) {
      this.coef = coef;
    }
  
    /**
     * 
     * Exponent of the monomial
     */
    getExp() {
      return this.exp;
    }
  
    /**
     * 
     * @param exp New exponent for the monomial
     */
    setExp(exp: Float64Array) {
      this.exp = exp;
    }
  
    /**
     * 
     * Copy of this monomial 
     */
    clone() {
      return new Monomial(this.coef, this.exp, this.vars);
    }
  
    /**
     * 
     * Checks if this monomial and `m` are in the same ring
     */
    sameVars(m: Monomial){
      if(this.vars.length !== m.getVars().length)
        return false;
  
      return this.vars.every((v,idx) => v === m.getVars()[idx]);
    }
  
    /**
     * 
     * Greatest commo divider of this this monomial and `m`
     */
    gcd(m: Monomial){
      if (!this.sameVars(m)) {
        throw new Error("CAN NOT DETERMINE GCD OF MONOMIALS USING DIFFERENT VARIABLES");
      }
  
      const newExp = this.exp.map((e,i) => Math.min(e, m.exp[i]));
  
      return new Monomial(1, Float64Array.from(newExp), this.vars);
    }

    /**
     * 
     * Lowest common multiple of this this monomial and `m`
     */
    lcm(m: Monomial){
        if (!this.sameVars(m)) {
            throw new Error("CAN NOT DETERMINE LCM OF MONOMIALS USING DIFFERENT VARIABLES");
          }
      
          const newExp = this.exp.map((e,i) => Math.max(e, m.exp[i]));
      
          return new Monomial(1, Float64Array.from(newExp), this.vars);
    }
  
    /**
     * 
     * Sum of this this monomial and `m`
     */
    plus(m: Monomial | number) {
      if(typeof m === "number"){
        return new Monomial(this.coef + m, this.exp, this.vars);
      }
      else{
        if (!m.equalExponent(this) || !m.sameVars(this))
          throw new Error(`TRYING TO SUM MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES`);
  
        return new Monomial(this.coef + m.coef, this.exp, this.vars);
      }
    }
  
    /**
     * 
     * Product of this this monomial and `m`
     */
    multiply(m: Monomial | number) {
      if (typeof m === "number") {
        return new Monomial(this.coef * m, this.exp, this.vars);
      } else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO MULTIPLY MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v + m.exp[i]);
        const c = this.coef * m.coef;
  
        return new Monomial(c,e, this.vars);
      }
    }
  
    /**
     * 
     * Division of this this monomial and `m`
     */
    divide(m: Monomial | number){
      if (typeof m === "number") {
        if(m === 0)
          throw new Error("TRYING TO DIVIDE MONOMIAL BY 0");
  
        return new Monomial(this.coef / m, this.exp, this.vars);
      } 
      else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO DIVIDE MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v - m.exp[i]);
        const c = this.coef / m.coef;
  
        return new Monomial(c,e, this.vars);
      }
    }
  
    /**
     * 
     * Checks if this monomial divides `m`, this is, its exponent has every component smaller than `m` 
     */
    divides(m: Monomial){
      if (!m.sameVars(this))
        throw new Error("TRYING TO DIVIDE MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
      return this.exp.every((e,idx) => e <= m.exp[idx]);
    }
  
    /**
     * 
     * Checks if the monomial is equivalent to 0
     */
    isZero() {
      return this.coef === 0;
    }
  
    /**
     * 
     * Checks if the monomial is equivalent to 1
     */
    isOne() {
      return this.coef === 1 && this.exp.every((e) => e === 0);
    }
  
    /**
     * 
     * Checks if this monomial and `m` have the same exponent value
     */
    equalExponent(m: Monomial) {
      return (
        this.exp.length === m.exp.length &&
        this.exp.every((v, i) => v === m.exp[i])
      );
    }
  
    /**
     * 
     * Checks if this monomial and `m` have the same coefficient value
     */
    equalCoef(m: Monomial) {
      return this.coef === m.coef;
    }
  
    /**
     * 
     * Checks if this monomial and `m` are equivalent
     */
    equals(m: Monomial) {
      return this.equalExponent(m) && this.equalCoef(m);
    }
  
    /**
     * 
     * Converts to a polynomial conformed by this monomial
     */
    toPolynomial() {
      return new Polynomial([this], this.vars);
    }
  
    /**
     * 
     * String representation of this monomial
     */
    toString(showProductChar : boolean = false) {
      if (this.isZero()) return "0";
      if (this.isOne()) return "1";
      let mon: string = "";
  
      if (this.coef === -1 && this.exp.some(e=>e!==0)) mon = "-";
      else if (this.coef === 1 && !this.exp.every(e=>e===0)) mon = "";
      else mon = this.coef.toString();
  
      // Separar - del coeficiente
      if (this.coef < 0) mon = [mon.slice(0, 1), " ", mon.slice(1)].join("");
  
      this.vars.forEach((v, idx) => {
        const e = this.exp[idx];
        let added = 0;
        if (this.exp[idx] !== 0){
           mon += `${v}${e !== 0 && e!==1 ? `^${this.exp[idx]}` : ""}${added>0 && idx<this.vars.length-1 && showProductChar ? "*":""}`;
           added++;
        }
      });
  
      return mon;
    }
  }