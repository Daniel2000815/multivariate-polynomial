import assert from "assert";
import {Polynomial} from "../Polynomial";

const polsXY = [
    new Polynomial("2*x*y", ["x","y"]),
    new Polynomial("x^2", ["x","y"]),
    new Polynomial("y", ["x","y"]),
    new Polynomial("-2*x*y", ["x","y"]),
    new Polynomial("0", ["x","y"]),
    new Polynomial("5*x*y", ["x","y"]),
    new Polynomial("1", ["x","y"]),
    new Polynomial("-x + 1", ["x","y"]),
    new Polynomial("y + x", ["x","y"]),
];

const opSumTestsXY = [
    {i:0, j:1, res: "x^2 + 2*x*y"},
    {i:0, j:2, res: "2*x*y + y"},
    {i:0, j:3, res: "0"},
    {i:0, j:4, res: "2*x*y"},
    {i:1, j:3, res: "x^2 - 2*x*y"},
    {i:2, j:3, res: "-2*x*y + y"},
    {i:0, j:5, res: "7*x*y"},
    {i:0, j:6, res: "2*x*y + 1"},
]

const opProdTestsXY = [
    {i:0, j:0, res: "4*x^2*y^2"},
    {i:0, j:1, res: "2*x^3*y"},
    {i:0, j:4, res: "0"},
    {i:0, j:6, res: "2*x*y"},
    {i:1, j:2, res: "x^2*y"},
    {i:7, j:8, res: "-x^2 - x*y + x + y"},
]

const polsXYZ = [
    new Polynomial("x*z", ["x","y","z"]),
    new Polynomial("x*z^2", ["x","y","z"]),
    new Polynomial("z", ["x","y","z"]),
    new Polynomial("x^3*y", ["x","y","z"]),
    new Polynomial("y^2*x^2", ["x","y","z"]),
    new Polynomial("y", ["x","y","z"]),
]

const polsTX = [
    new Polynomial("x*t", ["t","x"]),
    new Polynomial("x^2*t", ["t","x"]),
    new Polynomial("x*t^2", ["t","x"]),
    new Polynomial("3*x*t", ["t","x"]),
    new Polynomial("x^2*t^4", ["t","x"])
]

const polsTXYZ = [
    new Polynomial("2*t*x*y*z", ["t","x","y","z"]),
    new Polynomial("4*t*y*z", ["t","x","y","z"]),
    new Polynomial("1*x*y*z", ["t","x","y","z"]),
    new Polynomial("t*x^2*y*z^4", ["t","x","y","z"]),
    new Polynomial("t*x*y", ["t","x","y","z"]),
]



describe("Security", function () {
    it("Operations with different variables return error", function () {
      assert.throws(() => polsTX[0].plus(polsXY[0]));
    });
  
    it("Operations with different number of variables return error", function () {
        assert.throws(() => polsXYZ[0].plus(polsTXYZ[0]));
      });
});
  
describe("Sum", function () {
for (var i = 0; i < opSumTestsXY.length; i++) {
    (function (i) {
    var t = opSumTestsXY[i];

    it(`${polsXY[t.i].toString()} + ${polsXY[t.j].toString()} = ${t.res}`, function () {

        assert(polsXY[t.i].plus(
            polsXY[t.j]).equals(new Polynomial(t.res, ["x","y"])
        ));

    });
    })(i);
}
});

describe("Product", function () {
    for (var i = 0; i < opProdTestsXY.length; i++) {
        (function (i) {
        var t = opProdTestsXY[i];
    
        it(`${polsXY[t.i].toString()} * ${polsXY[t.j].toString()} = ${t.res}`, function () {
    
            assert(polsXY[t.i].multiply(
                polsXY[t.j]).equals(new Polynomial(t.res, ["x","y"])
            ));
    
        });
        })(i);
    }
});