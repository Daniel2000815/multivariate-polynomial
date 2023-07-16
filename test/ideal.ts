import assert from "assert";
import {Polynomial} from "../Polynomial";
import { Ideal } from "../Ideal";

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
    name: "Plane",
    xPar: "s*t+s+t+1",
    yPar: "-s*t",
    zPar: "-s-t",
    res: "x+y+z-1",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2"
  },
  {
    name: "Plane",
    xPar: "s+t",
    yPar: "s",
    zPar: "t",
    res: "x-y-z",
    resDRL: "y^2 + 2/5*z^2 - 1/5*x - 2"
  },
  // {
  //   name: "Hiperbolic Paraboloid",
  //   xPar: "t",
  //   yPar: "s",
  //   zPar: "t^2 - s^2",
  //   res: "y^2 + z^2 - 1",
  // },
];



describe("Implicitation", function () {
  for (var i = 0; i < implicitTests.length; i++) {
    (function (i) {
      var t = implicitTests[i];
      const vars = ["s","t"];

      it(`${t.name}`, function () {
        // console.log("EXPECTED:", new Polynomial(t.res, ["x","y","z"]).toString());
        let res = Ideal.implicitateR3(new Polynomial(t.xPar, vars), new Polynomial(t.yPar, vars), new Polynomial(t.zPar, vars), Polynomial.one(vars), Polynomial.one(vars), Polynomial.one(vars));
        // console.log("RES:", res.toString());
        assert(res.equals(new Polynomial(t.res, ["x","y","z"])));
      });

    })(i);
  }

  
});
  
  
 
  
