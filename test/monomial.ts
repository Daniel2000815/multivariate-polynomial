import assert from "assert";
import {Monomial} from "../Monomial";

const zero = new Monomial(0, Float64Array.from([0,0,0,0]), ["t","x","y","z"]);
const one = new Monomial(1, Float64Array.from([0,0,0,0]), ["t","x","y","z"]);

const testMonomials = [
    new Monomial(1, Float64Array.from([0,2,3,1]), ["t","x","y","z"]),
    new Monomial(1, Float64Array.from([0,2,3,1]), ["s","x","y","z"]),
    new Monomial(3, Float64Array.from([1,1,2,0]), ["t","x","y","z"]),
    new Monomial(0, Float64Array.from([3,2,1]), ["x","y","z"]),
    new Monomial(3, Float64Array.from([0,2,0]), ["x","y","z"]),
    new Monomial(2, Float64Array.from([1,2]), ["y","z"]),
    new Monomial(1, Float64Array.from([0,2]), ["y","z"]),
    zero,
    one,
    new Monomial(-1, Float64Array.from([1,1]), ["y","z"]),
    new Monomial(-3, Float64Array.from([3,2]), ["y","z"]),
];

const gcdLcmTests = [
  {i:0, j:0, gcd: "x^2y^3z", lcm: "x^2y^3z"},
  {i:0, j:1, gcd: null, lcm: null},
  {i:0, j:2, gcd: "xy^2", lcm: "tx^2y^3z"},
  {i:3, j:4, gcd: "y^2", lcm: "x^3y^2z"},
  {i:5, j:6, gcd: "z^2", lcm: "yz^2"},
  {i:9, j:10, gcd: "yz", lcm: "y^3z^2"},
  {i:6, j:9, gcd: "z", lcm: "yz^2"},
  {i:6, j:10, gcd: "z^2", lcm: "y^3z^2"},
]

const sameVarsTest = [
  {i: 0, j: 1, res: false},
  {i: 0, j: 2, res: true},
  {i: 0, j: 3, res: false},
  {i: 3, j: 4, res: true},
  {i: 4, j: 5, res: false},
];

const addVarsTest = [
  {old: ["x","y"], added: ["z"]},
  {old: ["x","y","z"], added: ["z"]},
  {old: ["x","y","z"], added: ["t"]},
  {old: ["t","y"], added: ["x"]},
  {old: ["x"], added: ["y","y","z"]},
]

const stringTest = [
  {i:0, res: "x^2y^3z"},
  {i:2, res: "3txy^2"},
  {i:3, res: "0"},
  {i:5, res: "2yz^2"},
  {i:7, res: "0"},
  {i:8, res: "1"},
]



describe("Security", function () {
  it("Initialized with no parameters returns 0", function () {
    const m = new Monomial();
    // console.log(new Monomial(2, new Float64Array([2,0,1,1]), ["t", "x", "y", "z"]).divides(Monomial.x()))
    assert(m.equals(zero));
  });

  // it("Initialized only with coef returns that coef", function () {
  //   const m = new Monomial(2);
  //   console.log("ASAS")
  //   assert(m.plus(-2).equals(zero));
  // });

  it("Initialized with wrong exponent length returns error", function () {
    const m = new Monomial(2);
    assert.throws(()=> new Monomial(2, Float64Array.from([1,2,3])));
  });

  it("Initialized with wrong variables length returns error", function () {
    const m = new Monomial(2);
    assert.throws(()=> new Monomial(2, Float64Array.from([1,2,3,4]), ["t","x"]));
  });

  it("Sum of monomials with different exponent returns error", function () {
    const m = new Monomial(2);
    assert.throws(()=> testMonomials[3].plus(testMonomials[4]));
  });

  it("Sum of monomials with different variables returns error", function () {
    const m = new Monomial(2);
    assert.throws(()=> testMonomials[0].plus(testMonomials[1]));
  });

  it("Product of monomials with different variables returns error", function () {
    const m = new Monomial(2);
    assert.throws(()=> testMonomials[0].multiply(testMonomials[1]));
  });
});

describe("Same vars", function () {
  for (var i = 0; i < sameVarsTest.length; i++) {
    (function (i) {
      var t = sameVarsTest[i];

      it(`${testMonomials[t.i].getVars()} ${t.res ? "=" : "!="} ${testMonomials[t.j].getVars()}`, function () {
        assert.equal(testMonomials[t.i].sameVars(testMonomials[t.j]), t.res);
      });
    })(i);
  }
});

describe("Add vars", function () {
  for (var i = 0; i < addVarsTest.length; i++) {
    (function (i) {
      var t = addVarsTest[i];

      const pushRes = [...new Set(t.old.concat(t.added))];
      
      let insertRes: string[] = [];
      [...new Set(t.added)].forEach(a => {if(!t.old.includes(a)){insertRes.push(a)}});
      insertRes = insertRes.concat(t.old);

      const varsToRemove = [... new Set(t.added)].filter(v => t.old.includes(v));

      const removeRes = t.old.filter(v => !varsToRemove.includes(v));

      it(`Old: ${t.old}, Vars: ${t.added} => PUSHED: ${pushRes}`, function () {
        let m =new Monomial(1, Float64Array.from(t.old.map(v=>0)), t.old);

        m.pushVariables(t.added);
        assert.deepEqual(m.getVars(), pushRes);
      });

      it(`Old: ${t.old}, Vars: ${t.added} => INSERTED: ${insertRes }`, function () {
        let m =new Monomial(1, Float64Array.from(t.old.map(v=>0)), t.old);

        m.insertVariables(t.added);
        assert.deepEqual(m.getVars(),insertRes);
      });

      it(`Old: ${t.old}, Vars: ${t.added} => REMOVED: ${removeRes }`, function () {
        let m =new Monomial(1, Float64Array.from(t.old.map(v=>0)), t.old);

        m.removeVariables(t.added);
        assert.deepEqual(m.getVars(),removeRes);
      });
    })(i);
  }
});

describe("To string", function () {
  for (var i = 0; i < stringTest.length; i++) {
    (function (i) {
      var t = stringTest[i];

      it(`${testMonomials[t.i].toString()} = ${t.res}`, function () {
        assert.equal(testMonomials[t.i].toString(), t.res);
      });
    })(i);
  }
});

describe("GCD", function () {
  for (var i = 0; i < gcdLcmTests.length; i++) {
    (function (i) {
      var t = gcdLcmTests[i];

      it(`gcd(${testMonomials[t.i].toString()}, ${testMonomials[t.j].toString()}) = ${t.gcd ? t.gcd : "-"}`, function () {
        if(t.gcd)
          assert.equal(testMonomials[t.i].gcd(testMonomials[t.j]).toString(), t.gcd);
        else
          assert.throws(() => testMonomials[t.i].gcd(testMonomials[t.j]));
      });
    })(i);
  }
});

describe("LCM", function () {
  for (var i = 0; i < gcdLcmTests.length; i++) {
    (function (i) {
      var t = gcdLcmTests[i];

      it(`lcm(${testMonomials[t.i].toString()}, ${testMonomials[t.j].toString()}) = ${t.lcm ? t.lcm : "-"}`, function () {
        if(t.gcd)
          assert.equal(testMonomials[t.i].lcm(testMonomials[t.j]).toString(), t.lcm);
        else
          assert.throws(() => testMonomials[t.i].lcm(testMonomials[t.j]));
      });
    })(i);
  }
});