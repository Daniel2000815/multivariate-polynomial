import assert from "assert";
import {Polynomial} from "../Polynomial";
// import {benchtest} from "benchtest";
// it = benchtest.it(it);
// describe = benchtest.describe(describe);

const isGroebnerBasisTests = [
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
    basis: [
      "t^4",
      "t^3*y^4",
      "t^2*y^8",
      "t*y^12",
      "t*z + y^4",
      "x^3*y^2",
      "y^16",
    ],
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

const isReducedGroebnerBasisTests = [
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
    basis: [
      "t^4",
      "t^3*y^4",
      "t^2*y^8",
      "t*y^12",
      "t*z + y^4",
      "x^3*y^2",
      "y^16",
    ],
    res: true,
  },
  {
    ideal: ["x^3*y^2", "y^4+z*t", "t^4"],
    basis: [
      "t^4",
      "t^3*y^4",
      "t^2*y^8",
      "t*y^12",
      "x",
      "t*z + y^4",
      "x^3*y^2",
      "y^16",
    ],
    res: false,
  },
  {
    ideal: ["x*y^3-1", "t*y+1"],
    basis: ["x*y^3 - 1", "t + x*y^2"],
    res: true,
  },
  {
    ideal: ["x", "y", "x*y^2"],
    basis: ["x", "y", "x*y^2"],
    res: false,
  },
];

const groebnerComputeTests = [
  { ideal: ["x+y-1", "y-z", "z - x*y"] },
  { ideal: ["x+y-1", "y-z", "z-x*y"] },
  { ideal: ["x*y-1", "y^2+1"] },
  { ideal: ["x*y^2+1", "x^2*z-1"] },
  { ideal: ["x*y^2+1", "x^2*z-1"] },
  { ideal: ["x*z", "y*z^3", "- t + 1"] },
  { ideal: ["z", "t*z^2", "x*z"] },
  { ideal: ["y*z", "t*y+1", "x*t-2"] },
];

const groebnerReducedComputeTests = [
  { gens: ["x+y-1", "y-z", "z - x*y"], basis: ["x + z - 1", "y - z", "z^2"] },
  { gens: ["x*y-1", "y^2+1"] , basis: ["x + y", "y^2 + 1"]},
  { gens: ["x*z", "y*z^3", "- t + 1"], basis: ["x*z", "y*z^3", "- t + 1"] },
  { gens: ["x^2", "x*z", "x-y", "t^2*x*y", "x", "y^2*z"], basis: ["x", "y"] },
  { gens: ["5*t^2 - s", "s*t", "t^2"], basis: ["s + x - 5*z", "t^2 - z", "t*x - 5*t*z + y", "t*y + x*z - 5*z^2", "x^2*z - 10*x*z^2 - y^2 + 25*z^3"]}
];

const implicitTests = [
  {
    name: "Elliptic Paraboloid",
    xPar: "5*t^2 + 2*s^2 - 10",
    yPar: "t",
    zPar: "s",
    res: "x - 5*y^2 - 2*z^2 + 10",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2"
  },
  {
    name: "Test 1",
    xPar: "5*t^2 - s",
    yPar: "s*t",
    zPar: "t^2",
    res: "x^2*z - 10*x*z^2 -y^2 + 25*z^3",
    resDRL: "x^2*z - 10*x*z^2 -y^2 + 25*z^3"
  },
  {
    name: "Test 2",
    xPar: "10*t",
    yPar: "t-s^2",
    zPar: "s*t",
    res: "x^3 - 2*x^2*y - 8*z^2",
  }
  // {
  //   name: "Hiperbolic Paraboloid",
  //   xPar: "t",
  //   yPar: "s",
  //   zPar: "t^2 - s^2",
  //   res: "y^2 + z^2 - 1",
  // },
];

describe("Groebner basis check", function () {
  for (var i = 0; i < isGroebnerBasisTests.length; i++) {
    (function (i) {
      var t = isGroebnerBasisTests[i];
      const F = t.ideal.map((val) => new Polynomial(val));
      const G = t.basis.map((val) => new Polynomial(val));

      it(`G={${t.basis}} ${t.res ? "IS" : "ISN'T"} basis of I= < ${
        t.ideal
      } >`, function () {
        assert.equal(Polynomial.isGroebnerBasis(F, G), t.res);
      });
    })(i);
  }
});

describe("Groebner basis reduced check", function () {
  for (var i = 0; i < isReducedGroebnerBasisTests.length; i++) {
    (function (i) {
      var t = isReducedGroebnerBasisTests[i];
      const F = t.ideal.map((val) => new Polynomial(val));
      const G = t.basis.map((val) => new Polynomial(val));

      it(`G={${t.basis}} ${t.res ? "IS" : "ISN'T"} reduced basis of I= < ${
        t.ideal
      } >`, function () {
        assert.equal(Polynomial.isReducedGroebnerBasis(F, G), t.res);
      });
    })(i);
  }
});

describe("Groebner basis computation", function () {
  this.timeout(10000);

  for (var i = 0; i < groebnerComputeTests.length; i++) {
    (function (i) {
      var t = groebnerComputeTests[i];
      const F = t.ideal.map((val) => new Polynomial(val));

      it(`I = < ${t.ideal} >`, function () {
        assert.equal(
          Polynomial.isGroebnerBasis(F, Polynomial.buchbergerReduced(F)),
          true
        );
      });
    })(i);
  }
});

describe("Reduced Groebner basis computation", function () {
  this.timeout(10000);

  for (var i = 0; i < groebnerReducedComputeTests.length; i++) {
    (function (i) {
      var t = groebnerReducedComputeTests[i];
      const F = t.gens.map((val) => new Polynomial(val, ["s","t","x","y","z"]));

      it(`I = < ${t.gens} >, B = [${t.basis}]`, function () {
        let good = true;
        Polynomial.buchbergerReduced(F).forEach((p, idx) => {if(!p.equals(new Polynomial(t.gens[idx], ["s","t","x","y","z"]))){
          good = false;
        }})
        assert(
          !good
        );
      });
    })(i);
  }
});
describe("Reduced Groebner basis computation", function () {
    this.timeout(10000);
  
    for (var i = 0; i < isReducedGroebnerBasisTests.length; i++) {
      (function (i) {
        var t = isReducedGroebnerBasisTests[i];
        const F = t.ideal.map((val) => new Polynomial(val));
  
        it(`I= < ${
          t.ideal
        } >`, function () {
          assert.equal(Polynomial.isReducedGroebnerBasis(F, Polynomial.buchbergerReduced(F)), true);
        });
      })(i);
    }
});


describe("Implicitation", function () {
  for (var i = 0; i < implicitTests.length; i++) {
    (function (i) {
      var t = implicitTests[i];
      const vars = ["s","t"];

      let res = Polynomial.implicitateR3(new Polynomial(t.xPar, vars), new Polynomial(t.yPar, vars), new Polynomial(t.zPar, vars));
      it(`${t.name}: x=${t.xPar}, y=${t.yPar}, z=${t.zPar}`, function () {
        assert(res.equals(new Polynomial(t.res, ["x","y","z"])));
      });
    })(i);
  }

  
});

  
// describe("Implicitation DEGREVLEX", function () {
//   Polynomial.setOrder("degrevlex");
//   for (var i = 0; i < implicitTests.length; i++) {
//     (function (i) {
//       var t = implicitTests[i];
//       const vars = ["s","t"];

//       let res = Polynomial.implicitateR3(new Polynomial(t.xPar, vars), new Polynomial(t.yPar, vars), new Polynomial(t.zPar, vars));
//       it(`${t.name}: x=${t.xPar}, y=${t.yPar}, z=${t.zPar}`, function () {
//         assert.equal(new Polynomial(t.res, ["x","y","z"]).toString(), res.toString());
//       });
//     })(i);
//   }

//   Polynomial.setOrder("lex");

  
// });
  
 
  
