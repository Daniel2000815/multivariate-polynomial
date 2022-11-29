import assert from "assert";
import Polynomial from "../Polynomial";

// P.<t,x,y,z> = PolynomialRing(QQ,4, order='lex');
// I = Ideal([x^3*y^2,y^4+z*t,t^4]);
// g = I.groebner_fan();
// g.reduced_groebner_bases();

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

const initTests = [
  { p: "2x", map: new Map<string, string>([["x", "2"]]), order: ["x"] },
  { p: "2x-3x", map: new Map<string, string>([["x", "-1"]]), order: ["x"] },
  {
    p: "x+y",
    map: new Map<string, string>([
      ["x", "1"],
      ["y", "1"],
    ]),
    order: ["x", "y"],
  },
  { p: "5z-6z+z", map: new Map<string, string>([["1", "0"]]), order: ["1"] },
  {
    p: "9x-7z+0y",
    map: new Map<string, string>([
      ["x", "9"],
      ["z", "-7"],
    ]),
    order: ["x", "z"],
  },
  {
    p: "7*x*y - 7*x^2*y",
    map: new Map<string, string>([
      ["x*y", "7"],
      ["x^2*y", "-7"],
    ]),
    order: ["x^2*y", "x*y"],
  },
  { p: "0", map: new Map<string, string>([["1", "0"]]), order: ["1"] },
  {
    p: "9z-y*x",
    map: new Map<string, string>([
      ["x*y", "-1"],
      ["z", "9"],
    ]),
    order: ["x*y", "z"],
  },
  {
    p: "x^2*y + x*y^2 + y^2",
    map: new Map<string, string>([
      ["x*y^2", "1"],
      ["y^2", "1"],
      ["x^2*y", "1"],
    ]),
    order: ["x^2*y", "x*y^2", "y^2"],
  },
  {
    p: "x*y^2 - x^2*y +7z",
    map: new Map<string, string>([
      ["x*y^2", "1"],
      ["z", "7"],
      ["x^2*y", "-1"],
    ]),
    order: ["x^2*y", "x*y^2", "z"],
  },
];

const stringTests = [
  { p: "2x", res: "2x" },
  { p: "5z-6z+z", res: "0" },
  { p: "x*y^2 - x^2*y +7z", res: "-x^2*y + x*y^2 + 7z" },
  { p: "-(-8*y*x*z)", res: "8x*y*z" },
];

const opTests = [
  { p1: "2x", op: "+", p2: "2y", res: "2x+2y" },
  { p1: "x", op: "-", p2: "x", res: "0" },
  { p1: "x*y + z", op: "-", p2: "y*x", res: "z" },
  { p1: "x*y*z", op: "*", p2: "0", res: "0" },
  { p1: "t*y", op: "*", p2: "z*y*t", res: "t^2*y^2*z" },
];

const expGreaterTests = [
  { e1: [0, 0, 0], e2: [0, 0, 0], res: false },
  { e1: [1, 0, 0], e2: [0, 1, 0], res: true },
  { e1: [2, 1, 0], e2: [1, 2, 0], res: true },
  { e1: [0, 2, 0], e2: [0, 0, 0], res: true },
  { e1: [0, 0, 0, 5], e2: [0, 0, 0], res: false },
  { e1: [1, 4, 3], e2: [0, 0, 0], res: true },
  { e1: [2, 1], e2: [3, 0, 0], res: false },
  { e1: [1], e2: [0, 0, 0], res: false },
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
  { p: "x*y^2 + x^2*y", lc: "1", lm: "x^2*y", lt: "x^2*y" },
  { p: "t*x^2-9", lc: "1", lm: "t*x^2", lt: "t*x^2" },
  { p: "x*y*z + z^9 - y", lc: "1", lm: "x*y*z", lt: "x*y*z" },
  { p: "z + y + t ", lc: "1", lm: "t", lt: "t" },
  { p: "y*t^2-y", lc: "1", lm: "t^2*y", lt: "t^2*y" },
  { p: "8x^2 - 9y^2", lc: "8", lm: "x^2", lt: "8x^2" },
  { p: "t-t", lc: "0", lm: "1", lt: "0" },
  { p: "y^2 + 3x*y", lc: "3", lm: "x*y", lt: "3x*y" },
];

const divisionTests = [
  {
    f: "x^2*y + x*y^2 + y^2",
    fs: ["x*y+1", "y^2-1"]
  },
  {
    f: "x^2*y + x*y^2 + y^2",
    fs: ["x*y-1", "y^2-1"]
  },
  {f: "x*x*y + y*z - z", fs: ["z^2","y - z","x + z - 1"]},
  {f: "x*y*y - z^2 ", fs: ["z^2","y - z","x + z - 1"]},
  {f: "x*x*y + y*z - z", fs: ["z^3", "y - z", "x + z - 1"]},
  {f: "x*y*y - z^2", fs: ["z^3", "y - z", "x + z - 1"]},
  // {f: "", fs: [], qs: [], rem: ""},
  // {f: "", fs: [], qs: [], rem: ""},
  // {f: "", fs: [], qs: [], rem: ""},
  // {f: "", fs: [], qs: [], rem: ""},
];

const suppTests = [
  {p: "x^2*y + x*y^2 + y^2", res: [[0,2,1,0], [0,1,2,0], [0,0,2,0]]},
  {p: "0", res: [[0,0,0,0]]},
  {p: "1", res: [[0,0,0,0]]},
  {p: "y^2*x - x*y", res: [[0,1,2,0],[0,1,1,0]]},
  {p: "t-t", res: [[0,0,0,0]]},
  {p: "y*z*x + t", res: [ [1,0,0,0],[0,1,1,1]]},
  {p: "t^2*z^2 - 9", res: [[2,0,0,2], [0,0,0,0]]},
  {p: "x^3*t^3 - z^9", res: [[3,3,0,0], [0,0,0,9]]},
]

const isGroebnerBaseTests = [
  {
    ideal: ["x+y-1", "y-z", "z-x*y"],
    basis: ["z^2", "y-z", "x+z-1"],
    res: true,
  },
  {
    ideal: ["x+y-1", "y-z", "z-x*y"],
    basis: ["z^2", "y-z", "y+z-1"],
    res: false,
  },
  {
    ideal: ["x+y-1", "y-z", "z-x*y"],
    basis: ["z^3", "y-z", "x+z-1"],
    res: false,
  },
  {
    ideal: ["x", "x*y"],
    basis: ["x"],
    res: true,
  },
  {
    ideal: ["x*z", "y*z"],
    basis: ["x*z", "y*z", "2"],
    res: true,
  },
  {
    ideal: ["x*y^2 - 1", "x^2*y"],
    basis: ["1"],
    res: true,
  },
  {
    ideal: ["x*y^2 - 1", "x^2*y"],
    basis: ["x^2"],
    res: false,
  },
  {
    ideal: ["y^3*z+2", "x^2*y"],
    basis: ["x^2", "y^3*z + 2"],
    res: true,
  },
  {
    ideal: ["x^3*y^2", "y^4+z*t", "t^4"],
    basis: ["t^4", "t^3*y^4", "t^2*y^8", "t*y^12", "t*z + y^4", "x^3*y^2", "y^16"],
    res: true,
  },
  {
    ideal: ["x*y^3-1", "t*y+1"],
    basis: ["x*y^3 - 1", "t + x*y^2"],
    res: true,
  },
  {
    ideal: ["x*y^3-1", "t*y+1"],
    basis: ["t^2 - x*y", "t*y + 1", "t + x*y^2"],
    res: true,
  },
];

const isReducedGroebnerBaseTests = [
    {
        ideal: ["x*z", "y*z"],
        basis: ["x*z", "y*z", "2"],
        res: false,
      },
      {
        ideal: ["x*z", "y*z"],
        basis: ["x*z", "y*z"],
        res: true,
      },
      {
        ideal: ["x*y^2 - 1", "x^2*y"],
        basis: ["1"],
        res: true,
      },
      {
        ideal: ["x*y^2 - 1", "x^2*y"],
        basis: ["2"],
        res: false,
      },
      {
        ideal: ["x*y^2 - 1", "x^2*y"],
        basis: ["1", "2"],
        res: false,
      },
      {
        ideal: ["y^3*z+2", "x^2*y"],
        basis: ["x^2", "y^3*z + 2"],
        res: true,
      },
      {
        ideal: ["y^3*z+2", "x^2*y"],
        basis: ["x^2", "y^3*z + 2", "x"],
        res: false,
      },
      {
        ideal: ["y^3*z+2", "x^2*y"],
        basis: ["x^2", "3*y^3*z + 2"],
        res: false,
      },
      {
        ideal: ["y^3*z+2", "x^2*y"],
        basis: ["x^2", "y^3*z + 2", "x^2*y"],
        res: false,
      },
      {
        ideal: ["x^3*y^2", "y^4+z*t", "t^4"],
        basis: ["t^4", "t^3*y^4", "t^2*y^8", "t*y^12", "t*z + y^4", "x^3*y^2", "y^16"],
        res: true,
      },
      {
        ideal: ["x^3*y^2", "y^4+z*t", "t^4"],
        basis: ["t^4", "t^3*y^4", "t^2*y^8", "t*y^12", "x", "t*z + y^4", "x^3*y^2", "y^16"],
        res: false,
      },
      {
        ideal: ["x*y^3-1", "t*y+1"],
        basis: ["x*y^3 - 1", "t + x*y^2"],
        res: true,
      }
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
});

describe("Initialization", function () {
  for (var i = 0; i < initTests.length; i++) {
    (function (i) {
      var t = initTests[i];

      it(`p = ${t.p}`, function () {
        const p = new Polynomial(t.p);
        const pCoefMap = p.getCoefMap();

        if (t.map.size !== pCoefMap.size) assert(false);
        pCoefMap.forEach((val: string, key: string) => {
          if (t.map.has(key)) {
            if (val !== t.map.get(key)) {
              assert(false);
            }
          } else {
            assert(false);
          }
        });

        const pOrder = p.getVarOrder();
        if (t.order.length !== pOrder.length) assert(false);

        pOrder.forEach((val: string, index) => {
          if (t.order[index] !== val) assert(false);
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
        assert.equal(Polynomial.expGreater(t.e1, t.e2), t.res);
      });
    })(i);
  }
});

describe("Exp", function () {
  for (var i = 0; i < expTests.length; i++) {
    (function (i) {
      var t = expTests[i];

      it(`exp(${t.p}) = ${t.res}`, function () {
        assert.deepEqual(new Polynomial(t.p).exp(), t.res);
      });
    })(i);
  }
});

describe("Leader coefficient, monomial and term", function () {
  for (var i = 0; i < leaderTests.length; i++) {
    (function (i) {
      var t = leaderTests[i];

      it(`p=${t.p} => lc=${t.lc}, lm=${t.lm}, lt=${t.lt}`, function () {
        const p = new Polynomial(t.p);
        assert.equal(
          p.lc() === t.lc && p.lm() === t.lm && p.lt() === t.lt,
          true
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

describe("Division", function () {
  for (var i = 0; i < divisionTests.length; i++) {
    (function (i) {
      var t = divisionTests[i];
      const f = new Polynomial(t.f);
      const fs = t.fs.map((val: string) => new Polynomial(val));

      it(`${t.f} / { ${t.fs} }`, function () {
        const res = Polynomial.divide(f, fs, 10);
        let mult = new Polynomial("0");
        res.quotients.forEach((qi, i) => {
          mult = mult.plus(qi.multiply(fs[i]));
        });

        mult = mult.plus(res.remainder);
        mult = mult.minus(f);

        if(!mult.isZero()){
            console.log("ERROR DIVIDING ", t.f, " BETWEEN ", t.fs);
            console.log(res.steps);
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
        assert.deepEqual( new Polynomial(t.p).supp(), t.res );
      });
    })(i);
  }
});

describe("Groebner base check", function () {
  for (var i = 0; i < isGroebnerBaseTests.length; i++) {
    (function (i) {
      var t = isGroebnerBaseTests[i];
      const F = t.ideal.map((val: string) => new Polynomial(val));
      const G = t.basis.map((val: string) => new Polynomial(val));

      it(`G={${t.basis}} ${t.res ? "IS" : "ISN'T"} base of I= < ${
        t.ideal
      } >`, function () {
        assert.equal(Polynomial.isGroebnerBase(F, G), t.res);
      });
    })(i);
  }
});

describe("Groebner base reduced check", function () {
    for (var i = 0; i < isReducedGroebnerBaseTests.length; i++) {
      (function (i) {
        var t = isReducedGroebnerBaseTests[i];
        const F = t.ideal.map((val: string) => new Polynomial(val));
        const G = t.basis.map((val: string) => new Polynomial(val));
  
        it(`G={${t.basis}} ${t.res ? "IS" : "ISN'T"} reduced base of I= < ${
          t.ideal
        } >`, function () {
          assert.equal(Polynomial.isReducedGroebnerBase(F, G), t.res);
        });
      })(i);
    }
  });
