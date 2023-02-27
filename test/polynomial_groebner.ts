import assert from "assert";
import {Polynomial} from "../Polynomial";

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

const implicitTests = [
  {
    name: "Elliptic Paraboloid",
    xPar: "5*t^2 + 2*s^2 - 10",
    yPar: "t",
    zPar: "s",
    res: "x - 5*y^2 - 2*z^2 + 10",
  },
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
      const F = t.ideal.map((val: string) => new Polynomial(val));
      const G = t.basis.map((val: string) => new Polynomial(val));

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
      const F = t.ideal.map((val: string) => new Polynomial(val));
      const G = t.basis.map((val: string) => new Polynomial(val));

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
      const F = t.ideal.map((val: string) => new Polynomial(val));

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
  
    for (var i = 0; i < isReducedGroebnerBasisTests.length; i++) {
      (function (i) {
        var t = isReducedGroebnerBasisTests[i];
        const F = t.ideal.map((val: string) => new Polynomial(val));
  
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
      it(`${t.name}`, function () {
        console.log("EXPECTED:", new Polynomial(t.res, ["x","y","z"]).toString());
        console.log("RES:", res.toString());
        assert(res.equals(new Polynomial(t.res, ["x","y","z"])));
      });
    })(i);
  }

  
});
  
  
 
  
