import assert from "assert";
import { Polynomial } from "../Polynomial";
import { Ideal } from "../Ideal";

const implicitTests = [
  {
    name: "Elliptic Paraboloid",
    xPar: "t^2 + s^2",
    yPar: "t",
    zPar: "s",
    res: "x - y^2 - z^2",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2",
  },
  {
    name: "Plane 1",
    xPar: "s*t+s+t+1",
    yPar: "-s*t",
    zPar: "-s-t",
    res: "x+y+z-1",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2",
  },
  {
    name: "Plane 2",
    xPar: "s+t",
    yPar: "s",
    zPar: "t",
    res: "x-y-z",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2",
  },
  {
    name: "Hyperbolic Paraboloid",
    xPar: "t",
    yPar: "s",
    zPar: "t^2 - s^2",
    res: "x^2 - y^2 - z",
  },
  {
    name: "Ellipsoid",
    xPar: "s",
    yPar: "t",
    zPar: "s^2 + t^2",
    res: "x^2 + y^2 - z",
  },
];

const ratImplicitTests = [
  // {
  //   name: "Unit sphere",
  //   xPar: ["2*s", "s^2 + t^2 + 1"],
  //   yPar: ["2*t", "s^2 + t^2 + 1"],
  //   zPar: ["s^2 + t^2 - 1", "s^2 + t^2 + 1"],
  //   res: "x^2 + y^2 + z^2 - 1",
  //   params: []
  // },
  // {
  //   name: "Sphere of radius r",
  //   xPar: ["s^2 - t^2 - r^2 + 2*s*t + 2*s*r", "s^2 + t^2 + r^2"],
  //   yPar: ["t^2-s^2-r^2+2*s*t+t*r", "s^2 + t^2 + r^2"],
  //   zPar: ["r^2-s^2-t^2+2*r*s+2*r*t", "s^2 + t^2 + r^2"],
  //   res: "x^2 + y^2 + z^2 - r",
  //   params: ["r"]
  // },
  // {
  //   name: "Circular hyperboloid",
  //   xPar: ["s+t", "2"],
  //   yPar: ["s-t", "2"],
  //   zPar: ["s*t", "1"],
  //   res: "x^2 - y^2 - z",
  //   params: []
  // },
  {
    name: "Sage 1",
    xPar: ["t-s", "t"],
    yPar: ["s", "t"],
    zPar: ["s^3+t^2", "t^2"],
    res: "x+y-1",
    params: [],
  },
  {
    name: "Sage 2",
    xPar: ["s", "t"],
    yPar: ["s", "t^2"],
    zPar: ["s+t", "s"],
    res: "x*z - x - 1",
    params: [],
  },
  {
    name: "Sage 3",
    xPar: ["s", "s*t"],
    yPar: ["t^2 - s", "t^2"],
    zPar: ["t", "s"],
    res: "x + y*z - z",
    params: [],
  },
  {
    name: "Sage 4",
    xPar: ["t-s^2", "s*t"],
    yPar: ["s^2", "3"],
    zPar: ["s", "1"],
    res: "y - 1/3*z^2",
    params: [],
  },
];

describe("Implicitation", function () {
  for (var i = 0; i < implicitTests.length; i++) {
    (function (i) {
      var t = implicitTests[i];
      const vars = ["s", "t"];

      it(`${t.name}`, function () {
        // console.log("EXPECTED:", new Polynomial(t.res, ["x","y","z"]).toString());
        let res = Ideal.implicitateR3(
          new Polynomial(t.xPar, vars),
          new Polynomial(t.yPar, vars),
          new Polynomial(t.zPar, vars),
          Polynomial.one(vars),
          Polynomial.one(vars),
          Polynomial.one(vars)
        );
        // console.log("RES:", res.toString());
        assert(res.equals(new Polynomial(t.res, ["x", "y", "z"])));
      });
    })(i);
  }
});

describe("Rational Implicitation", function () {
  // console.log(new Polynomial("3*s").divide/(t^2)"))

  for (var i = 0; i < ratImplicitTests.length; i++) {
    (function (i) {
      var t = ratImplicitTests[i];

      it(`${t.name}`, function () {
        let vars = ["s", "t"].concat(t.params);
        let res = Ideal.implicitateR3(
          new Polynomial(t.xPar[0], vars),
          new Polynomial(t.yPar[0], vars),
          new Polynomial(t.zPar[0], vars),
          new Polynomial(t.xPar[1], vars),
          new Polynomial(t.yPar[1], vars),
          new Polynomial(t.zPar[1], vars),
          t.params
        );

        assert(
          res.equals(new Polynomial(t.res, ["x", "y", "z"].concat(t.params)))
        );
      });
    })(i);
  }
});
