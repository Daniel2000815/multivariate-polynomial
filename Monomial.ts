import {Polynomial} from "./Polynomial";
import nerdamer from "nerdamer-ts";
import Fraction from "./Fraction";


/**
 * Represents a monomial in the ring R<t,x,y,z> or any other variables specified
 */
export class Monomial {
    private coef: Fraction;
    private exp: Float64Array;
    private vars : string[]; 
  
    /**
     * 
     * @param coef Leader coefficient 
     * @param exp Exponent
     * @param variables Variables of the ideal to which the monomial belongs
     */
    constructor(coef: number | Fraction = 0, exp: Float64Array = Float64Array.from([0,0,0,0]), vars: string[] = ["t","x","y","z"]) {

      // let fracStr = nerdamer(`${coef}`).evaluate().text('fractions');
      // let partes = fracStr.split("/");

     
      if(exp.length !== vars.length){
        throw new Error("EXPONENT NOT MATCHING VARIABLES");
      }

  
      this.coef = typeof(coef) === "number" ? new Fraction(coef,1) : coef;
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
    insertVariables(newVars : string[], pos: number = 0){

      newVars = [...new Set(newVars)];
      const varsToAdd = newVars.filter(v => !this.vars.includes(v));
      if(pos > this.vars.length)
        throw new Error("INVALID INSERT POSITION FOR VARIABLE")

      // this.vars = varsToAdd.concat(this.vars);

      let exp = []
      let vars = []

      for(let i=0; i<this.exp.length + varsToAdd.length; i++){
        if(i<pos){
          exp[i] = this.exp[i]
          vars[i] = this.vars[i]
        }
        else if(i>=pos && i<pos+varsToAdd.length){
          exp[i] = 0
          vars[i] = varsToAdd[i-pos]
        }
        else{
          exp[i] = this.exp[i - varsToAdd.length]
          vars[i] = this.vars[i - varsToAdd.length]
        }
      }
      this.exp = Float64Array.from(exp);
      this.vars = vars;
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
    setCoef(coef: Fraction | number) {
      if(typeof(coef) === "number")
        this.coef = new Fraction(coef,1)
      else
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
   * Sum of this monomial with `m`
   * @param m Monomial to add
   */
    plus(m: Monomial) {
    
        if (!m.equalExponent(this) || !m.sameVars(this))
          throw new Error(`TRYING TO SUM MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES`);
  
        return new Monomial(this.coef.plus(m.coef), this.exp, this.vars);
      
    }

    /**
   * Substraction of this monomial with `m`
   * @param m Monomial to substract
   */
    minus(m: Monomial) {
      return this.plus(m.multiply(-1));
    }
  
    /**
     * 
     * Product of this this monomial and `m`
     */
    multiply(m: Monomial | Fraction | number) {
      if(typeof(m) === "number"){
        return new Monomial(this.coef.multiply(m), this.exp, this.vars);
      }
      if ( m instanceof Fraction) {
        return new Monomial(this.coef.multiply(m), this.exp, this.vars);
      } else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO MULTIPLY MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v + m.exp[i]);
        const c = this.coef.multiply(m.coef);
  
        return new Monomial(c,e, this.vars);
      }
    }
  
    /**
     * 
     * Division of this this monomial and `m`
     */
    divide(m: Monomial | Fraction|number){
      if(typeof(m) === "number"){
        return new Monomial(this.coef.divide(m), this.exp, this.vars);
      }
      if (m instanceof Fraction) {
        if(m.isZero())
          throw new Error("TRYING TO DIVIDE MONOMIAL BY 0");
  
        return new Monomial(this.coef.divide(m), this.exp, this.vars);
      } 
      else {
        if (!m.sameVars(this))
          throw new Error("TRYING TO DIVIDE MONOMIALS WITH DIFFERENT EXPONENT OR VARIABLES");
  
        const e = this.exp.map((v, i) => v - m.exp[i]);
        const c = this.coef.divide(m.coef);
  
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
  
    static zero(vars= ["t","x","y","z"]) {
      return new Monomial(0, new Float64Array(vars.map(v=>0)), vars)
    }

    static one(vars= ["t","x","y","z"]) {
      return new Monomial(1, new Float64Array(vars.map(v=>0)), vars)
    }

    /**
     * 
     * Checks if the monomial is equivalent to 0
     */
    isZero() {
      return this.coef.isZero();
    }
  
    /**
     * 
     * Checks if the monomial is equivalent to 1
     */
    isOne() {
      return this.coef.isOne() && this.exp.every((e) => e === 0);
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
      return this.coef.equals(m.coef);
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
     * Checks if this monomial is less or equal `m` using *lex*
     */
    le(m: Monomial) {
      if(!this.sameVars(m))
        throw new Error("Monomials in different rings")

      for (let i = 0; i < this.exp.length; i++) {
        if (this.exp[i] < m.getExp()[i]) return true;
        else if (this.exp[i] > m.getExp()[i]) return false;
      }

      return true;
    }

    /**
     * 
     * Checks if this monomial is greater or equal `m` using *lex*
     */
    ge(m: Monomial) {
      if(!this.sameVars(m))
        throw new Error("Monomials in different rings")

      for (let i = 0; i < this.exp.length; i++) {
        if (this.exp[i] > m.getExp()[i]) return true;
        else if (this.exp[i] < m.getExp()[i]) return false;
      }

      return true;
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
  
      if (this.coef.neg().isOne() && this.exp.some(e=>e!==0)) mon = "-";
      else if (this.coef.isOne() && !this.exp.every(e=>e===0)) mon = "";
      else mon = this.coef.toString();
  
      // Separar - del coeficiente
      if (this.coef.toNumber() < 0) mon = [mon.slice(0, 1), " ", mon.slice(1)].join("");
  
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