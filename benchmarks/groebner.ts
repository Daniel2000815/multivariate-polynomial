import {Polynomial} from "../Polynomial";

const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();
const { HilbertAlgorithm } = require("../dist/lib/es5/hilbertAlgorithm");

suite
  .add("Groebner", function () {
    Polynomial.buchbergerReduced([
        new Polynomial("x^2*y - 2*y*z^3 + z^2 - x"),
        new Polynomial("y^2 - x*z")
    ])
  })
  .on("cycle", function (event: any) {
    console.log(String(event.target));
  })
  .run();