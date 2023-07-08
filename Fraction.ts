/**
 * Represents a monomial in the ring R<t,x,y,z> or any other variables specified
 */
export class Fraction {
    private numerator: BigInt;
    private denominator: BigInt;
  
    /**
     * 
     * @param n Numerator 
     * @param d Denominator
     */
    constructor(n: number | BigInt = 0, d: number | BigInt= 1) {

      // var e = nerdamer('sqrt(2)').evaluate();
      // console.log(e.text('fractions'));

      if(BigInt(d) === BigInt(0)){
        throw new Error("DENOMINATOR CAN'T BE 0");
      }
  
      this.numerator = BigInt(n);
      this.denominator = BigInt(d);
    }

    

    plus(f: Fraction){
        if(this.denominator === f.denominator){
        return new Fraction(this.numerator + f.numerator, this.denominator);
        }
    }
    toString(){
        return `${this.numerator}/${this.denominator}`
    }
 
  }