export class Fraction {
    private integer: number = 1;
    private fraction: number = 1;
  
    constructor(a: number|Fraction, b: number = 1) {
      if (a instanceof Fraction) {
        this.integer = a.integer;
        this.fraction = a.fraction;
      } else if ( b === undefined) {
        this.integer = Math.floor(a);
        let residue = a - this.integer;
        this.fraction = Math.floor(residue.toString().length * residue)
      } else if (b !== undefined) {
        this.integer = a;
        this.fraction = b;
      }
    }
  
    plus(value: Fraction|number): Fraction {
      let that: Fraction = new Fraction(1,1);
      if (value instanceof Number) {
        that = new Fraction(value,1);
      } else {
        that = <Fraction>value;
      }

      let num = this.integer * that.fraction + that.integer * this.fraction;
      let den = this.fraction * that.fraction;

      if(den < 0){
        num = -num;
        den = -den;
      }

      return new Fraction(num, den);
    }
  
    toNumber() : number{
      return this.integer / this.fraction
    }

    neg(){
        return new Fraction(-this.integer, this.fraction)
    }
    multiply(value: Fraction|number): Fraction {

      let num = 1;
      let den = 0;

      

      if(typeof(value) === "number"){
        num = this.integer * value;
        den = this.fraction;
      }
      else{
        num = this.integer * value.integer;
        den = this.fraction * value.fraction
      }

      if(den < 0){
        num = -num;
        den = -den;
      }

      return new Fraction(num, den) ;
    }
  
    divide(value: Fraction|number): Fraction {
      return typeof(value) === "number" ? new Fraction(this.integer, this.fraction*value) : new Fraction(this.integer * value.fraction, this.fraction*value.integer);
       
    }
  
    inv(){
      if(this.integer === 0)
        throw new Error ("CANT INVERT FRACTION 0")
    
      return this.integer<0 ? new Fraction(-this.fraction, -this.integer) : new Fraction(this.fraction, this.integer)
    }
    minus(value: Fraction|number): Fraction {

      return this.plus(new Fraction(value).multiply(-1));
    }
  
    isZero(){
        return this.integer===0
    }

    isOne(){
      return this.integer===this.fraction
    }

    equals(f: Fraction){
        return this.integer*f.fraction === this.fraction*f.integer
    }

    toString() {
      return this.fraction===1 ? `${this.integer}` : `${this.integer}/${this.fraction}`;
    }

    static zero(){
        return new Fraction(0,1)
    }

    static one(){
        return new Fraction(1,1)
    }
  }
  
  
  export default Fraction;