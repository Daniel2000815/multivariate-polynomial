import assert from "assert";
import { Polynomial } from "../Polynomial";

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
  { ideal: ["x", "y", "z", "x*z"] },
  { ideal: ["y^2*z", "t"] },
  { ideal: ["x^2*y^2*z", "t*y", "x*z"] },
  { ideal: ["x^4*y*z^2", "t*z^3", "y*z^5", "t*y"] },
  { ideal: ["x*y^2*z^3", "t*x^2*z", "x*z"] },
  { ideal: ["x*y^2+2", "4*x - z^3", "x*z"] },
  { ideal: ["x^10-y^2", "x*y*z^6", "t*z^3", "x*y", "x+y-1"] },
  { ideal: ["x+y-1", "y-z", "z - x*y"] },
  { ideal: ["x+y-1", "y-z", "z-x*y"] },
  { ideal: ["x*y-1", "y^2+1"] },
  { ideal: ["x*y^2+1", "x^2*z-1"] },
  { ideal: ["x*y^2+1", "x^2*z-1"] },
  { ideal: ["x*z", "y*z^3", "- t + 1"] },
  { ideal: ["z", "t*z^2", "x*z"] },
  { ideal: ["y*z", "t*y+1", "x*t-2"] },
  { ideal: ["y^2*z", "t", "x*y^2+1", "x^2*z-1", "y*z", "t*y+1", "x*t-2"] },
  {
    ideal: [
      "x^10-y^2",
      "x*y*z^6",
      "t*z^3",
      "x*y",
      "x+y-1",
      "z^3 - t^2*x*z",
      "3*x-y",
      "t",
    ],
  },
  {
    ideal: [
      "x+y-1",
      "y-z",
      "z - x*y",
      "x*y^2+1",
      "x^2*z-1",
      "z",
      "t*z^2",
      "x*z",
    ],
  },
  {
    ideal: ["x*y^2+2", "4*x - z^3", "x*z", "x*y^2+1", "x^2*z-1", "y^2*z", "t"],
  },
  {
    ideal: [
      "x^10-y^2",
      "x*y*z^6",
      "t*z^3",
      "x*y",
      "x+y-1",
      "y*z",
      "t*y+1",
      "x*t-2",
      "y^2*z",
      "t*x",
      "z",
      "t*z^2",
      "x*z",
    ],
  },

  { ideal: ["x^2-y*z*t", "x*y+z*t^2", "x*z-t^2*y", "t*x-z*y^2", "y*z^2-x^2"] },
  { ideal: ["x*y-z", "x^2-y^2", "y^3-z^3", "x^4-t^4"] },
  { ideal: ["x*y*z", "x^2*y^2*z^2", "x^3*y^3*z^3", "t^4-x^4*y^4*z^4"] },
  { ideal: ["x^2-y^2*z", "x^3-y^3*z^2", "x^4-y^4*z^3", "x^5-y^5*z^4"] },
  { ideal: ["x^2*y-z^3", "x^3*y^2-z^4", "x^4*y^3-z^5", "x^5*y^4-z^6"] },
  { ideal: ["x*y^2-z^3", "x^2*y^3-z^4", "x^3*y^4-z^5", "x^4*y^5-z^6"] },
  { ideal: ["x^2*y^2-z^3", "x^3*y^3-z^4", "x^4*y^4-z^5", "x^5*y^5-z^6"] },
  {
    ideal: [
      "x^2*y^2*z-t",
      "x^3*y^3*z^2-t^2",
      "x^4*y^4*z^3-t^3",
      "x^5*y^5*z^4-t^4",
    ],
  },
  {
    ideal: [
      "x^2*y*z-t^3",
      "x^3*y^2*z^2-t^4",
      "x^4*y^3*z^3-t^5",
      "x^5*y^4*z^4-t^6",
    ],
  },
  {
    ideal: [
      "x*y^2*z-t^3",
      "x^2*y^3*z^2-t^4",
      "x^3*y^4*z^3-t^5",
      "x^4*y^5*z^4-t^6",
    ],
  },
  {
    ideal: [
      "x^2*y^2*z^2-t^3",
      "x^3*y^3*z^3-t^4",
      "x^4*y^4*z^4-t^5",
      "x^5*y^5*z^5-t^6",
    ],
  },
  {
    ideal: ["x*y*z-t", "x^2*y^2*z^2-t^2", "x^3*y^3*z^3-t^3", "x^4*y^4*z^4-t^4"],
  },
  {
    ideal: [
      "x^2*y*z-t^3",
      "x^3*y^2*z^2-t^4",
      "x^4*y^3*z^3-t^5",
      "x^5*y^4*z^4-t^6",
    ],
  },
  {
    ideal: [
      "x*y^2*z-t^3",
      "x^2*y^3*z^2-t^4",
      "x^3*y^4*z^3-t^5",
      "x^4*y^5*z^4-t^6",
    ],
  },
  {
    ideal: [
      "x^2*y^2*z^2-t^3",
      "x^3*y^3*z^3-t^4",
      "x^4*y^4*z^4-t^5",
      "x^5*y^5*z^5-t^6",
    ],
  },
  { ideal: ["x*y-z^3", "x^2-y^3", "y^4-z^5", "x^5-t^6"] },
  { ideal: ["x*y^2-z^3", "x^2*y-y^3", "y^4*z-z^5", "x^5*y^5-t^6"] },
  { ideal: ["x^2*y-z^3", "x^2*y^2-z^4", "x^4*y^3-z^5", "x^5*y^4-t^6"] },
  { ideal: ["x^2*y^2-z^3", "x^2*y^3-z^4", "x^4*y^4-z^5", "x^5*y^5-t^6"] },
  {
    ideal: ["x*y*z-z^3", "x^2*y^2*z-z^4", "x^3*y^3*z^2-z^5", "x^4*y^4*z^3-t^6"],
  },
  {
    ideal: [
      "x*y*z^2-z^3",
      "x^2*y^2*z^2-z^4",
      "x^3*y^3*z^3-z^5",
      "x^4*y^4*z^4-t^6",
    ],
  },
  { ideal: ["t", "x*y*z", "x^2*y^2*z^2", "x^3*y^3*z^3"] },
  { ideal: ["t^3", "x^2*y*z", "x^3*y^2*z^2", "x^4*y^3*z^3"] },
  { ideal: ["t^3", "x*y^2*z", "x^2*y^3*z^2", "x^3*y^4*z^3"] },
  { ideal: ["t^3", "x^2*y^2*z^2", "x^3*y^3*z^3", "x^4*y^4*z^4"] },
  { ideal: ["t^6", "x*y^2-z^3", "x^2*y-y^3", "y^4*z-z^5"] },
  { ideal: ["t^6", "x^2*y-z^3", "x^2*y^2-z^4", "x^4*y^3-z^5"] },
  { ideal: ["t^6", "x^2*y^2-z^3", "x^2*y^3-z^4", "x^4*y^4-z^5"] },
  { ideal: ["t^6", "x*y*z-z^3", "x^2*y^2*z-z^4", "x^3*y^3*z^2-z^5"] },
  { ideal: ["t^6", "x*y*z^2-z^3", "x^2*y^2*z^2-z^4", "x^3*y^3*z^3-z^5"] },
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

  for (var i = 0; i < groebnerComputeTests.length; i++) {
    (function (i) {
      var t = groebnerComputeTests[i];
      const F = t.ideal.map((val: string) => new Polynomial(val));
      it(`I= < ${t.ideal} >`, function () {
        // console.log("===BASE===")
        // Polynomial.buchbergerReduced(F).forEach((p:Polynomial)=>console.log(p.toString()))
        // console.log("==============")
        // Polynomial.isReducedGroebnerBasis(F, Polynomial.buchbergerReduced(F))
        // assert(true);
        assert.equal(
          Polynomial.isReducedGroebnerBasis(F, Polynomial.buchbergerReduced(F)),
          true
        );
      });
    })(i);
  }
});
