import assert from "assert";
import {Polynomial} from "../Polynomial";
import {Monomial} from "../Monomial";
import Fraction from "../Fraction";

// P.<t,x,y,z> = PolynomialRing(QQ,4, order='lex');
// I = Ideal([x^3*y^2,y^4+z*t,t^4]);
// g = I.groebner_fan();
// g.reduced_groebner_basiss();

const zero = new Polynomial("0");
const one = new Polynomial("1");
const f1 = new Polynomial("-x*y + z - 2");
const f2 = new Polynomial("y - 5 + x");
const f3 = new Polynomial("x^2*y + x*y^2 + y^2");
const f4 = new Polynomial("x*y-1");
const f5 = new Polynomial("y^2-1");
const f6 = new Polynomial("-1 - x+x*y^2+y^2");
const f7 = new Polynomial("x^2 + 2*y^2 - 3");
const f8 = new Polynomial("x^2 + x*y + y^2 - 3");
const f9 = new Polynomial("x^2*y + x*y^2 + y^2");
const f10 = new Polynomial("x*y - 1");
const f11 = new Polynomial("y^2-1");
const f12 = new Polynomial("x^(10) + y^2 -z^(30)*y - t");
const f13 = new Polynomial("x^(10) + y^2 -z^(30)*y - t -1");
const f14 = new Polynomial("y^2 -z^(30)*y - t + x^(10)  -1");

const polArraysEqual = (a: Polynomial[], b: Polynomial[]) => {
  if (a.length !== b.length) return false;

  a.every(function (element) {
    return b.includes(element);
  });
};

const eqTest = [
  { p1: "0", p2: "0", res: true },
  { p1: "2*x", p2: "x*2", res: true },
  { p1: "-t+x", p2: "-(-x+t)", res: true },
  { p1: "x-y", p2: "y-x", res: false },
  { p1: "x*y - y*x", p2: "0", res: true },
  { p1: "x^2*y - x*y^2", p2: "0", res: false },
  { p1: "z", p2: "-z", res: false },
  { p1: "-x+y", p2: "y-x", res: true },
];

const leTest = [
  { p1: "0", p2: "0", le: true, ge: true },
  { p1: "x^(10) + y^2 -z^(30)*y - t", p2: "0", le: false, ge: true },
  { p1: "x-y", p2: "z", ge: true, le: false },
  { p1: "t*x^3", p2: "t^2", ge: false, le: true },
  { p1: "y", p2: "y^2", ge: false, le: true },
  { p1: "0", p2: "-2", ge: true, le: true },
  
]

const initTests = [
  { p: "1/x", coeff: [1], exp:[[0,-1,0,0]]},
  { p: "2x",       coeff: [2],      exp: [[0, 1, 0, 0]] },
  { p: "2x-3x",    coeff: [-1],     exp: [[0, 1, 0, 0]] },
  { p: "x+y",      coeff: [1,1],    exp: [[0, 1, 0, 0], [0,0,1,0]] },
  { p: "5z-6z+z",  coeff: [0],      exp: [[0, 0, 0, 0]] },
  { p: "9x-7z+0y", coeff: [9,-7],   exp: [[0, 1, 0, 0],[0, 0, 0, 1]],},
  { p: "0",        coeff: [0],      exp: [[0, 0, 0, 0]] },
  { p: "9z-y*x",   coeff: [-1,9], exp: [[0,1,1,0],[0, 0, 0, 1]] },
  { p: "x^2*y + x*y^2 + y^2", coeff: [1,1,1], exp: [[0, 2, 1, 0],[0, 1, 2, 0],[0, 0, 2, 0]]},
  { p: "x*y^2 - x^2*y +7z",   coeff: [-1,1,7], exp: [[0, 2, 1, 0], [0, 1, 2, 0], [0, 0, 0, 1]]},
  { p: "7*x*y - 7*x^2*y",     coeff: [-7,7], exp: [[0, 2, 1, 0], [0, 1, 1, 0]] },
];

const stringTests = [
  { p: "x-1", res: "x - 1"},
  { p: "-x-1", res: "- x - 1"},
  { p: "y+1", res: "y + 1"},
  { p: "x*y -1 -2", res: "xy - 3"},
  { p: "2x", res: "2x" },
  { p: "5z-6z+z", res: "0" },
  { p: "x*y^2 - x^2*y +7z", res: "- x^2y + xy^2 + 7z" },
  { p: "-(-8*y*x*z)", res: "8xyz" },
  { p: "2*x*z^2 - 9*y*x", res: "- 9xy + 2xz^2" },
  { p: "x*z-y*x", res: "- xy + xz" },
  { p: "-x^3+7*y*z", res: "- x^3 + 7yz" },
  { p: "x-3y", res: "x - 3y" },
  { p: "1/x", res: "x^-1"},
  { p: "1/y^2", res: "y^-2"},
  { p: "x + 1/z^(-1)", res: "x + z"},
];

const opTests = [
  { p1: "2x",       op: "+", p2: "2y",    res: "2x+2y" },
  { p1: "0",        op: "+", p2: "5x",    res: "5*x" },
  { p1: "3y + z",   op: "+", p2: "3t",    res: "3*t + 3*y + z" },
  { p1: "y*z",      op: "+", p2: "0",     res: "y*z" },
  { p1: "5t*x",     op: "+", p2: "2",     res: "5*t*x + 2" },
  { p1: "9",        op: "+", p2: "5",     res: "14" },
  { p1: "x",        op: "-", p2: "x",     res: "0" },
  { p1 : "x*z + y*z + z^3 - z^2 - z", op: "-", p2: "x*z + z^2 - z", res: "y*z + z^3 - 2*z^2"},
  { p1: "9",        op: "-", p2: "x*y^2", res: "-x*y^2 + 9" },
  { p1: "x*z^3*3",    op: "-", p2: "t^5",   res: "-t^5 + 3*x*z^3" },
  { p1: "6t*y^2",   op: "-", p2: "y-y",   res: "6*t*y^2" },
  { p1: "z*5+y",     op: "-", p2: "3*x",   res: "-3*x + y + 5*z" },
  { p1: "x*y + z",  op: "-", p2: "y*x",   res: "z" },
  { p1: "x*y*z",    op: "*", p2: "0",     res: "0" },
  { p1: "3x^5",     op: "*", p2: "t^2*z^4",res: "3 * t^2 * x^5 * z^4" },
  { p1: "y^4*t^1",  op: "*", p2: "0",     res: "0" },
  { p1: "t^3*5",    op: "*", p2: "2",     res: "10*t^3" },
  { p1: "x",        op: "*", p2: "1",     res: "x" },
  { p1: "t*y",      op: "*", p2: "z*y*t", res: "t^2*y^2*z" },
];

const expGreaterTests = [
  { e1: [0, 0, 0], e2: [0, 0, 0], res: false },
  { e1: [1, 0, 0], e2: [0, 1, 0], res: true },
  { e1: [2, 1, 0], e2: [1, 2, 0], res: true },
  { e1: [0, 2, 0], e2: [0, 0, 0], res: true },
  { e1: [0, 0, 0, 5], e2: [0, 0, 0], res: null },
  { e1: [1, 4, 3], e2: [0, 0, 0], res: true },
  { e1: [2, 1], e2: [3, 0, 0], res: null },
  { e1: [1], e2: [0, 0, 0], res: null },
  { e1: [0, 0, 2], e2: [0, 2, 0], res: false },
  { e1: [4, 1, 0], e2: [0, 0, 9], res: true },
];

const expTests = [
  { p: "0", res: [0, 0, 0, 0] },
  { p: "2x - 7y", res: [0, 1, 0, 0] },
  { p: "x*y*z", res: [0, 1, 1, 1] },
  { p: "x^2*y + x*y^2 + y^2", res: [0, 2, 1, 0] },
  { p: "-(-8*y*x*z)", res: [0, 1, 1, 1] },
  { p: "9x-7z+0y", res: [0, 1, 0, 0] },
  { p: "t*y", res: [1, 0, 1, 0] },
  { p: "8*x*z*y*t^2 - t*x^5", res: [2, 1, 1, 1] },
  { p: "y^5 - t", res: [1, 0, 0, 0] },
  { p: "9x-t*y + t^2", res: [2, 0, 0, 0] },
  { p: "x*y + y^2*x - z*t", res: [1, 0, 0, 1] },
];
const leaderTests = [
  { p: "x*y^2 + x^2*y", lc: 1, lm: [0,2,1,0]},
  { p: "t*x^2-9", lc: 1, lm: [1,2,0,0] },
  { p: "x*y*z + z^9 - y", lc: 1, lm: [0,1,1,1]},
  { p: "z + y + t ", lc: 1, lm: [1,0,0,0] },
  { p: "y*t^2-y", lc: 1, lm: [2,0,1,0] },
  { p: "8x^2 - 9y^2", lc: 8, lm: [0,2,0,0]},
  { p: "t-t", lc: 0, lm: [0,0,0,0] },
  { p: "y^2 + 3x*y", lc: 3, lm: [0,1,1,0] },
];

const divisionTests = [
  {
    f: "x^2*y + x*y^2 + y^2",
    fs: ["x*y+1", "y^2-1"],
  },
  {
    f: "x^2*y + x*y^2 + y^2",
    fs: ["x*y-1", "y^2-1"],
  },
  { f: "x*x*y + y*z - z", fs: ["z^2", "y - z", "x + z - 1"] },
  { f: "x*y*y - z^2 ", fs: ["z^2", "y - z", "x + z - 1"] },
  { f: "x*x*y + y*z - z", fs: ["z^3", "y - z", "x + z - 1"] },
  { f: "x*y*y - z^2", fs: ["z^3", "y - z", "x + z - 1"] },
  // { f: "y*t^2-y", fs: ["x^7+t", "x+y+z^4", "t+z+y", "x^4*y^2"]},
  { f: "x*y*t - 5", fs: ["2*x", "2*y^3 + 8*z + t^2", "4*t^2"]},
  { f: "t*x^2 + y^5 - z^2 + t", fs: ["7*x^2", "t^2+y", "z^3 + x + z"]},
  { f: "7", fs: ["2*x", "4"]},
  { f: "0", fs: ["4*x", "5"]},
  { f: "6*x*t^2 + 5*x + 5*y*z^6", fs: ["3*x^4 + 5*y*t + z^2", "t^2 + x - 1", "3*x + 6*t^2", "x^2"]},
];

const variablesTest = [
  {
    p: "t*x^2*y + x*y^2 + y^2*z",
    insertVars: ["s","u"],
    pos: 0,
    supp:[
      [0,0,1, 2, 1, 0],
      [0,0,0, 1, 2, 0],
      [0,0,0, 0, 2, 1],
    ],
    vars: ["s","u","t","x","y","z"]
  },
  {
    p: "t*x^2*y + x*y^2 + y^2*z",
    insertVars: ["s","u"],
    pos: 1,
    supp:[
      [1,0,0, 2, 1, 0],
      [0,0,0, 1, 2, 0],
      [0,0,0, 0, 2, 1],
    ],
    vars: ["t","s","u","x","y","z"]
  },
  {
    p: "t*x^2*y + x*y^2 + y^2*z",
    insertVars: ["s","u"],
    pos: 3,
    supp:[
      [1, 2, 1, 0,0,0],
      [0, 1, 2, 0,0,0],
      [0, 0, 2, 0,0,1],
    ],
    vars: ["t","x","y","s","u","z"]
  },
  {
    p: "t*x^2*y + x*y^2 + y^2*z",
    insertVars: ["s","u"],
    pos: 4,
    supp:[
      [1, 2, 1, 0,0,0],
      [0, 1, 2, 0,0,0],
      [0, 0, 2, 1,0,0],
    ],
    vars: ["t","x","y","z","s","u"]
  },
  
  
]

const suppTests = [
  {
    p: "x^2*y + x*y^2 + y^2",
    res: [
      [0, 2, 1, 0],
      [0, 1, 2, 0],
      [0, 0, 2, 0],
    ],
  },
  { p: "0", res: [[0, 0, 0, 0]] },
  { p: "1", res: [[0, 0, 0, 0]] },
  {
    p: "y^2*x - x*y",
    res: [
      [0, 1, 2, 0],
      [0, 1, 1, 0],
    ],
  },
  { p: "t-t", res: [[0, 0, 0, 0]] },
  {
    p: "y*z*x + t",
    res: [
      [1, 0, 0, 0],
      [0, 1, 1, 1],
    ],
  },
  {
    p: "t^2*z^2 - 9",
    res: [
      [2, 0, 0, 2],
      [0, 0, 0, 0],
    ],
  },
  {
    p: "x^3*t^3 - z^9",
    res: [
      [3, 3, 0, 0],
      [0, 0, 0, 9],
    ],
  },
];


const zeroTests = [
  { p: "0", res: true },
  { p: "1*0", res: true },
  { p: "t+x-t", res: false },
  { p: "x^2*y - y*x^2", res: true },
  { p: "1-1", res: true },
  { p: "0*1", res: true },
];



describe("Security", function () {
  it("Initialized with empty string returns 0", function () {
    const p = new Polynomial("");
    assert(p.equals(new Polynomial("0")));
  });

  it("Division by 0 throws error", function() {
    assert.throws(()=>new Polynomial("2x").divide([new Polynomial("2*y"), new Polynomial("0")]));
  })
});

describe("Initialization", function () {
  for (var i = 0; i < initTests.length; i++) {
    (function (i) {
      var t = initTests[i];

      it(`p = ${t.p}`, function () {
        const p = new Polynomial(t.p);
        if (t.coeff.length !== p.getMonomials().length) assert(false);

        p.getMonomials().forEach((m: Monomial, idx: number) => {
          if(!m.equals(new Monomial(t.coeff[idx], Float64Array.from(t.exp[idx]), p.getVars()))){
            assert(false);
          }
        });

        assert(true);
      });
    })(i);
  }
});


describe("To string", function () {
  for (var i = 0; i < stringTests.length; i++) {
    (function (i) {
      var t = stringTests[i];

      it(`${t.p}`, function () {
        assert.equal(new Polynomial(t.p).toString(), t.res);
      });
    })(i);
  }
});

describe("Equality", function () {
  for (var i = 0; i < eqTest.length; i++) {
    (function (i) {
      var t = eqTest[i];

      it(`${t.p1} ${t.res ? "==" : "!="} ${t.p2}`, function () {
        assert.equal(new Polynomial(t.p1).equals(new Polynomial(t.p2)), t.res);
      });
    })(i);
  }
});

describe("Comparisons", function () {
  for (var i = 0; i < leTest.length; i++) {
    (function (i) {
      var t = leTest[i];

      let f = new Polynomial(t.p1);
      let g = new Polynomial(t.p2);

      it(`${f.toString()} ${t.le ? "<=" : "!<="} ${g.toString()}`, function () {
        assert.equal(f.le(g), t.le);  
      });

      it(`${f.toString()} ${t.le ? ">=" : "!>="} ${g.toString()}`, function () {
        assert.equal(f.ge(g), t.ge);  
      });
    })(i);
  }
});

describe("Operations", function () {
  for (var i = 0; i < opTests.length; i++) {
    (function (i) {
      var t = opTests[i];

      it(`(${t.p1}) ${t.op} (${t.p2}) == ${t.res} `, function () {
        switch (t.op) {
          case "+":
            assert(
              new Polynomial(t.p1)
                .plus(new Polynomial(t.p2))
                .equals(new Polynomial(t.res))
            );
            break;
          case "-":
            console.log(new Polynomial(t.p1)
            .minus(new Polynomial(t.p2)).toString())
            assert(
              new Polynomial(t.p1)
                .minus(new Polynomial(t.p2))
                .equals(new Polynomial(t.res))
            );
            break;
          case "*":
            assert(
              new Polynomial(t.p1)
                .multiply(new Polynomial(t.p2))
                .equals(new Polynomial(t.res))
            );
            break;
          default:
            assert(false);
        }
      });
    })(i);
  }
});


describe("Exp greater", function () {
  for (var i = 0; i < expGreaterTests.length; i++) {
    (function (i) {
      var t = expGreaterTests[i];

      
      it(`${t.e1} ${t.res ? ">" : "<="} ${t.e2}`, function () {
        if(t.res !== null)
          assert.equal(Polynomial.expGreater(Float64Array.from(t.e1), Float64Array.from(t.e2)), t.res);
        else
          assert.throws(() => Polynomial.expGreater(Float64Array.from(t.e1), Float64Array.from(t.e2)));
      });
    })(i);
  }
});



describe("Exp", function () {
  for (var i = 0; i < expTests.length; i++) {
    (function (i) {
      var t = expTests[i];

      it(`exp(${t.p}) = ${t.res}`, function () {
        assert.deepEqual(new Polynomial(t.p).exp(), Float64Array.from(t.res));
      });
    })(i);
  }
});


describe("Leader coefficient, monomial and term", function () {
  for (var i = 0; i < leaderTests.length; i++) {
    (function (i) {
      var t = leaderTests[i];

      it(`p=${t.p} => lc=${t.lc}, lm=${t.lm}`, function () {
        const p = new Polynomial(t.p);
        assert.equal(
          p.lc().equals(new Fraction(t.lc)) && p.lm().equals(new Monomial(1,Float64Array.from(t.lm))), true
        );
      });
    })(i);
  }
});


describe("Is zero", function () {
  for (var i = 0; i < zeroTests.length; i++) {
    (function (i) {
      var t = zeroTests[i];

      it(`${t.p} ${t.res ? " == " : " != "} 0`, function () {
        assert.equal(new Polynomial(t.p).isZero(), t.res);
      });
    })(i);
  }
});

describe("Insert variables", function () {
  for (var i = 0; i < variablesTest.length; i++) {
    (function (i) {
      var t = variablesTest[i];
      let p = new Polynomial(t.p);
      p.insertVariables(t.insertVars, t.pos);

      it(`${t.p} INSERT ${t.insertVars} AT POSITION ${t.pos} (VARIABLES)`, function () {
        assert(p.getVars().every((val,idx) => val === t.vars[idx]));
      });

      it(`${t.p} INSERT ${t.insertVars} AT POSITION ${t.pos} (SUPPORT)`, function () {
        console.log("AQ")
        console.log(p.supp())
        console.log(t.supp)
        assert.deepEqual(p.supp(), t.supp.map(r=> Float64Array.from(r)));
      });

    })(i);
  }
});


describe("Division", function () {
  for (var i = 0; i < divisionTests.length; i++) {
    (function (i) {
      var t = divisionTests[i];
      const f = new Polynomial(t.f);
      const fs = t.fs.map((val: string) => new Polynomial(val));

      it(`${t.f} / { ${t.fs} }`, function () {
        const res = f.divide(fs);
        let mult = new Polynomial("0");
        res.quotients.forEach((qi, i) => {
          mult = mult.plus(qi.multiply(fs[i]));
        });

        mult = mult.plus(res.remainder);
        mult = mult.minus(f);

        if (!mult.isZero()) {
          console.log("ERROR DIVIDING ", t.f, " BETWEEN ", t.fs, "MULT_ ", mult.toString());
          // console.log(res.steps);
        }
        assert(mult.isZero());
      });
    })(i);
  }
});


describe("Support", function () {
  for (var i = 0; i < suppTests.length; i++) {
    (function (i) {
      var t = suppTests[i];
      it(`supp(${t.p}) = ${t.res}`, function () {
        assert.deepEqual(new Polynomial(t.p).supp(), t.res.map(r=> Float64Array.from(r)));
      });
    })(i);
  }
});

