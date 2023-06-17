import nerdamer from "nerdamer-ts";
import nerdamerjs from "nerdamer";
import { Monomial } from "./Monomial";
import { Ideal } from "./Ideal";
require("nerdamer/algebra");
/**
 * Represents a polynomial as a collection of monomials in a specified ring and using the *lex* monomial order
 */
export class Polynomial {
    // static order : "lex" | "degrevlex" = "lex";
    /**
     *
     * @param p string representation of the polynomial or monomial collection that form the polynomial
     * @param vars Generators of the ring in R to which the polynomial belongs
     */
    constructor(p, vars = ["t", "x", "y", "z"]) {
        /**
         * Monomials forming the polynomial ordered with *lex*
         */
        this.monomials = [Monomial.zero()];
        this.vars = vars;
        if (typeof p === "string") {
            var pol = "";
            try {
                if (p.length == 0)
                    pol = "0";
                else
                    pol = nerdamer(p).expand().toString();
            }
            catch (e) {
                throw new Error(`ERROR PARSING POLYNOMIAL ${p}`);
            }
            this.monomials = [];
            this.computeCoefficients(pol);
        }
        else {
            if (p.every(m => m.getExp().length === this.vars.length &&
                m.getVars().every((v, idx) => v === this.vars[idx]))) {
                this.monomials = p.length > 1 ? p.filter(m => m.getCoef() !== 0) : p;
            }
            else {
                p.forEach(m => console.log(m.getExp()));
                p.forEach(m => console.log(m.getVars()));
                throw new Error(`INITIALIZING POLYNOMIAL WITH MONOMIALS IN DIFFERENT RINGS: Ring vars: ${this.vars}; Pol. vars: ${p[0].getVars()}`);
            }
        }
        // Aplicamos LEX
        // Polynomial.order==="lex" ? this.applyLex() : this.applyDegRevLex();
        this.applyLex();
    }
    /**
     * Orders `monomials` using *lex*
     */
    applyLex() {
        this.monomials = this.monomials.sort(function (a, b) {
            return Polynomial.expGreater(a.getExp(), b.getExp()) ? -1 : 1;
        });
    }
    applyDegRevLex() {
        this.monomials = this.monomials.sort(function (a, b) {
            const expA = a.getExp();
            const expB = b.getExp();
            const degA = expA.reduce((x, y) => x + y);
            const degB = expB.reduce((x, y) => x + y);
            if (degA === degB)
                return -1;
            for (let i = expA.length - 1; i >= 0; i--) {
                if (expA[i] < expB[i])
                    return 1;
            }
            return -1;
        });
    }
    /**
     * Parses a string to a Polynomial
     * @param pol string representation of the polynomial
     */
    computeCoefficients(pol) {
        // if (firstIt) {
        //   this.monomials = [];
        // }
        if (!pol)
            return;
        const node = nerdamer.tree(pol);
        const nMinus = (pol.match(/-/g) || []).length;
        const nPlus = (pol.match(/\+/g) || []).length;
        // == VEMOS SI ES MONOMIO ==
        // Si tiene un + no lo es: x+y
        // Si tiene algun -, lo sera si solo tiene uno: -xy, -x-y
        const isMonomial = nPlus === 0 && nMinus <= 1;
        // === NO ES MONOMIO -> SEGUIMOS SEPARANDO
        if (!isMonomial) {
            if (node.left)
                this.computeCoefficients(this.nodeToString(node.left));
            if (node.right)
                node.value === "-"
                    ? this.computeCoefficients(`-${this.nodeToString(node.right)}`)
                    : this.computeCoefficients(this.nodeToString(node.right));
        }
        else {
            let coef = "";
            let variable = "";
            let writingCoef = true;
            // Recorremos string
            for (let i = 0; i < pol.length; i++) {
                // Si nos encontramos con una variable, dejamos de escribir en coef. Si no encontramos
                // ningun coeficiente, significa que es 1, y si el coeficiente es -, significa que es -1
                if (this.vars.includes(pol[i])) {
                    writingCoef = false;
                    if (coef.length === 0)
                        coef = "1";
                    else if (coef === "-")
                        coef = "-1";
                    // Si el coeficiente acaba con el * de multiplicaral monomio lo quitamos
                    if (coef[coef.length - 1] === "*")
                        coef = coef.slice(0, -1);
                }
                if (!["(", ")"].includes(pol[i])) {
                    if (writingCoef)
                        coef += pol[i];
                    else
                        variable += pol[i];
                }
            }
            // Si no se ecnontro ninguna variable, es 1
            if (variable === "")
                variable = "1";
            // TODO: VER SI SE PUEDE USAR OTRA COSA QUE NO SEA EVAL
            const c = coef === "-" ? -1 : eval(coef);
            const e = this.vars.map(function (v) {
                // console.log("CHEKANDO 2", nerdamerjs('deg(t+x^2+2*x+ x*y, x*y)').toString());
                return parseFloat(nerdamerjs(`deg(${variable}, ${v})`).toString());
            });
            this.monomials.push(new Monomial(c, Float64Array.from(e), this.vars));
            // this.coefMap.set(variable, coef === "-" ? "-1" : coef);
        }
    }
    /**
     *
     * @returns Copy of the polynomial
     */
    clone() {
        return new Polynomial(this.monomials, this.vars);
    }
    /**
     *
     * List of monomials making the array ordered by *lex*
     */
    getMonomials() {
        return this.monomials;
    }
    /**
     *
     * Checks if `v` is a variable of the ring of this polynomial
     */
    hasVariable(v) {
        return this.vars.includes(v);
    }
    /**
     *
     * Checks if all variables in `v` are variables of the ring of this polynomial
     */
    hasVariables(v) {
        return v.every(vi => this.hasVariable(vi));
    }
    /**
     *
     * Checks if all variables in `v` are used in this polynomial
     */
    useAllVariables(v) {
        return v.length === this.vars.length && v.every((val, idx) => this.monomials.some(m => m.getExp()[idx] > 0));
    }
    /**
     *
     * Checks if any variables in `v` are used in this polynomial
     */
    useAnyVariables(v) {
        return v.some((val, idx) => this.monomials.some(m => m.getExp()[idx] > 0));
    }
    /**
     *
     * List of variables of the ring of this polynomial
     */
    getVars() {
        return this.vars;
    }
    /**
       * Concatenates new variables to the ring and updates the exponent for every monomial
       * @param newVars variables to add
       */
    pushVariables(newVars) {
        newVars = [...new Set(newVars)];
        const varsToAdd = newVars.filter(v => !this.vars.includes(v));
        this.vars = this.vars.concat(varsToAdd);
        this.monomials.forEach(m => m.pushVariables(varsToAdd));
    }
    /**
     * Inserts new variables before the existing ones to the ring and updates the exponent for every monomial
     * @param newVars variables to add
     */
    insertVariables(newVars) {
        newVars = [...new Set(newVars)];
        const varsToAdd = newVars.filter(v => !this.vars.includes(v));
        this.vars = varsToAdd.concat(this.vars);
        this.monomials.forEach(m => m.insertVariables(varsToAdd));
    }
    /**
       * Remove variables of the ring and updates the exponent for every monomial
       * @param oldVars variables to remove
       */
    removeVariables(oldVars) {
        oldVars = [...new Set(oldVars)];
        const varsToRemove = oldVars.filter(v => this.vars.includes(v));
        this.vars = this.vars.filter(v => !varsToRemove.includes(v));
        ;
        this.monomials.forEach(m => m.removeVariables(varsToRemove));
    }
    /**
     *
     * List of the variables from the ring used by the polynomial
     */
    usedVars() {
        let res = [];
        this.exp().forEach((e, idx) => { if (e > 0)
            res.push(this.vars[idx]); });
        return res;
    }
    /**
     * Product of this polynomial with `q`
     * @param q Polynomial or number to multiply with
     */
    multiply(q) {
        let product = [];
        if (typeof q === "number") {
            product = this.monomials.map((m) => m.multiply(q));
            return new Polynomial(product, this.vars);
        }
        else {
            this.monomials.forEach((pm) => {
                q.monomials.forEach((qm) => {
                    const coef = pm.getCoef() * qm.getCoef();
                    const exp = pm.getExp().map(function (num, idx) {
                        return num + qm.getExp()[idx];
                    });
                    product.push(new Monomial(coef, exp, this.vars));
                });
            });
            // comprobamos exponentes repetidos y los sumamos
            product = product.reduce((acc, cur, idx) => {
                // Si ya existe el monomio lo sumamos
                const m = acc.find((mon) => cur.equalExponent(mon));
                if (m !== undefined) {
                    const i = acc.indexOf(m);
                    acc[i].setCoef(acc[i].getCoef() + cur.getCoef());
                }
                else
                    acc.push(cur);
                return acc;
            }, []);
        }
        return new Polynomial(product, this.vars);
    }
    /**
     * Sum of this polynomial with `q`
     * @param q Polynomial or number to sum with
     */
    plus(q) {
        let intersection = this.monomials.filter((x) => q.monomials.some((y) => y.equalExponent(x)));
        let difference = this.monomials
            .concat(q.monomials)
            .filter((x) => !intersection.some((y) => y.equalExponent(x)));
        let res = [];
        let qMonomialsUsed = [];
        for (let i = 0; i < this.monomials.length; i++) {
            const mp = this.monomials[i];
            let foundPair = false;
            for (let j = 0; j < q.monomials.length && !foundPair; j++) {
                const mq = q.monomials[j];
                if (mp.equalExponent(mq)) {
                    res.push(mp.plus(mq));
                    foundPair = true;
                    qMonomialsUsed.push(mq);
                }
            }
            if (!foundPair) {
                res.push(mp);
            }
        }
        const qMonomialsUnused = q.monomials.filter((x) => !qMonomialsUsed.some((y) => y.equalExponent(x)));
        res = res.concat(qMonomialsUnused);
        return new Polynomial(res, this.vars);
    }
    /**
     * Substraction of this polynomial with `q`
     * @param q Polynomial or number to substract
     */
    minus(q) {
        return this.plus(q.multiply(-1));
    }
    /**
     *
     * Checks if polynomials are equivalent
     */
    equals(q) {
        return (this.monomials.length === q.monomials.length &&
            (this.monomials.length === 1 && (this.monomials[0].getCoef() === 0 && q.monomials[0].getCoef() === 0) ||
                this.monomials.every((m, idx) => m.equals(q.monomials[idx]))));
    }
    /**
     *
     * Leader coefficient
     */
    lc() {
        return this.monomials[0].getCoef();
    }
    /**
     *
     * Leader monomial
     */
    lm() {
        return new Monomial(1, this.monomials[0].getExp(), this.vars);
    }
    /**
     *
     * Leader term
     */
    lt() {
        return this.monomials[0];
    }
    /**
     *
     * Second leader coefficient
     */
    slc() {
        return this.monomials.length > 1 ? this.monomials[1].getCoef() : 0;
    }
    /**
     *
     * Second leader monomial
     */
    slm() {
        return this.monomials.length > 1 ? new Monomial(1, this.monomials[1].getExp(), this.vars) : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
    }
    /**
     *
     * Second leader term
     */
    slt() {
        return this.monomials.length > 1 ? this.monomials[1] : new Monomial(1, Float64Array.from(this.monomials[0].getExp().map(v => 0)), this.vars);
    }
    /**
     * Exponent of this polynomial
     */
    exp() {
        return this.monomials[0].getExp();
    }
    /**
     *
     * Support of the polynomial
     */
    supp() {
        return this.monomials.map((m) => m.getExp());
    }
    /**
     *
     * Checks if polynomial is equivalent to zero
     */
    isZero() {
        const n = this.monomials.length;
        return n === 0 || (n === 1 && (this.monomials[0].getCoef() === 0 || Math.abs(this.monomials[0].getCoef()) < 1e-5));
    }
    /**
     * Checks if polynomial reduces to 0 in G
     * @param G
     */
    reduces(G) {
        return this.divide(G).remainder.isZero();
    }
    /**
     * Divide by a set of polynomials fs = [f_1, ..., f_n] using *lex*
     * @param fs polynomials to divide with
     * @param maxIter limit of iterations allowed
     * @param verbose should return process steps
     * @returns quotients for each polynomial in fs, remainder and steps if `verbose`
     */
    divide(fs, maxIter = 1000, verbose = false) {
        if (fs.some(fi => fi.isZero()))
            throw new Error(`TRYING TO DIVIDE BY 0`);
        let nSteps = 0;
        var steps = {};
        let step = [];
        let currIt = 0;
        const s = fs.length;
        let p = this.clone();
        let r = new Polynomial("0", this.vars);
        let coefs = Array(s).fill(new Polynomial("0", this.vars));
        while (!p.isZero() && currIt < maxIter) {
            nSteps++;
            currIt++;
            let i = 0;
            let divFound = 0;
            const exp_p = p.exp();
            while (i < s && divFound === 0) {
                const exp_fi = fs[i].exp();
                const gamma = Polynomial.expMinus(exp_p, exp_fi);
                step = [];
                if (gamma.every((item) => item >= 0)) {
                    const xGamma = new Monomial(1, gamma, this.vars);
                    const lcp = p.lc();
                    const lcfi = fs[i].lc();
                    const coef = new Polynomial([xGamma.multiply(lcp / lcfi)], this.vars);
                    let newQi = coefs[i].plus(coef);
                    let newP = p.minus(fs[i].multiply(coef));
                    step.push(`f = ${p}`);
                    step.push(`exp(f) - exp(f_${i})= ${exp_p} - ${exp_fi} => We can divide`);
                    step.push(`q_${i} = (${coefs[i]}) + (${coef}) = ${newQi}`);
                    step.push(`p = (${p}) - (${coef} * (${fs[i]}) ) = ${newP}`);
                    step.push(p.toString());
                    coefs[i] = newQi;
                    p = newP;
                    divFound = 1;
                }
                else {
                    i++;
                }
            }
            if (divFound === 0) {
                const LC = p.lc();
                const MON = new Monomial(1, exp_p, this.vars);
                const lt = new Polynomial([MON.multiply(LC)], this.vars);
                const newR = r.plus(lt);
                const newP = p.minus(lt);
                step.push("No division posible:");
                step.push(`lt(p) = (${LC})*(${MON}) = ${lt}`);
                step.push(`r = (${r}) + lt(p) = ${newR}`);
                step.push(`p = (${p}) - lt(p) = ${newP}`);
                r = newR;
                p = newP;
            }
            steps[`step${nSteps}`] = step;
        }
        step = [];
        let mult = new Polynomial("0", this.vars);
        step.push(`r = ${r}`);
        coefs.forEach((qi, i) => {
            step.push(`q_${i} = ${qi}`);
            mult = mult.plus(qi.multiply(fs[i]));
        });
        mult = mult.plus(r);
        mult = mult.minus(this);
        steps["result"] = step;
        if (!mult.isZero()) {
            console.log(mult.toString());
            console.error(`ERROR COMPUTING DIVISION OF ${this.toString()} IN [${fs}]`);
        }
        return {
            quotients: [...coefs],
            remainder: r,
            steps: steps,
        };
    }
    /**
     *
     * String representation of the polynomial using *lex*
     */
    toString(showProductChar = false) {
        let res = "";
        for (var i = 0; i < this.monomials.length; i++) {
            const mon = this.monomials[i];
            const monSt = mon.toString();
            res += `${i > 0 ? " " : ""}${!["+", "-"].includes(monSt[0]) && i > 0 ? "+ " : ""}${mon.toString(showProductChar)}`;
            if (i < this.monomials.length - 1 && this.monomials.length > 1)
                res += "";
        }
        return res;
    }
    /**
     *
     * Checks if this polynomial and `p` are in the same ring
     */
    sameVars(p) {
        if (this.vars.length !== p.getVars().length)
            return false;
        return this.vars.every((v, idx) => v === p.getVars()[idx]);
    }
    /**
     *
     * Chacks if a>b using lex.
     */
    static expGreater(a, b) {
        if (a.length !== b.length) {
            throw new Error("TRYING TO COMPARE EXPONENTS OF DIFFERENT SIZE");
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] > b[i])
                return true;
            else if (a[i] < b[i])
                return false;
        }
        return false;
    }
    // === PRIVATE STATIC METHODS===
    /**
     *
     * `a`-`b`
     */
    static expMinus(a, b) {
        if (a.length !== b.length)
            return Float64Array.from([]);
        return a.map((val, idx) => val - b[idx]);
    }
    /**
     *
     * All possible pairs of combinations of `array`
     */
    static arrayCombinations(array) {
        var result = array.flatMap((v, i) => array.slice(i + 1).map((w) => [v, w]));
        return result;
    }
    /**
     * Checks if `G` is a Groebner basis of <`F`>
     * @param F Generator of the ideal I = <F>
     * @param G Supposed Groebner basis
     */
    static isGroebnerBasis(F, G) {
        const fgPairs = this.arrayCombinations(F);
        for (let i = 0; i < fgPairs.length; i++) {
            const r = this.sPol(fgPairs[i][0], fgPairs[i][1]).divide(G).remainder;
            if (!r.isZero()) {
                return false;
            }
        }
        return true;
    }
    /**
     * Array of exponents of each polynomial in `F`
     */
    static exp(F) {
        return F.map((f) => f.exp());
    }
    /**
     * Checks if `G` is a reduced Groebner basis of <`F`>
     * @param F Generator of the ideal I = <F>
     * @param G Supposed Groebner basis
     */
    static isReducedGroebnerBasis(F, G) {
        let res = true;
        if (!this.isGroebnerBasis(F, G))
            res = false;
        for (let i = 0; i < G.length && res; i++) {
            const g = G[i];
            const suppG = g.supp();
            const newG = G.filter((p) => !p.equals(g));
            const expNewG = Polynomial.exp(newG);
            if (g.lc() !== 1)
                res = false;
            for (let j = 0; j < suppG.length && res; j++) {
                for (let k = 0; k < expNewG.length && res; k++) {
                    if (!this.expMinus(suppG[j], expNewG[k]).some((item) => item < 0))
                        res = false;
                }
            }
        }
        return res;
    }
    /**
     *
     * Lowest common multiple of this polynomial and `g`
     */
    lcm(g) {
        if (!this.sameVars(g)) {
            throw new Error("CAN NOT COMPUTE LCM OF TWO POLYNOMIALS WOTH DIFFERENT VARIABLES");
        }
        const newExp = this.exp().map((e, i) => Math.max(e, g.exp()[i]));
        return new Monomial(1, Float64Array.from(newExp), this.vars);
    }
    /**
     *
     * Greatest common divider of this polynomial and `g`
     */
    gcd(g) {
        return this.lm().gcd(g.lm());
    }
    /**
     *
     * @returns S-Polynomial of f and g. Asummes that `f` and `g` use the same variables
     */
    static sPol(f, g) {
        const alpha = f.exp();
        const beta = g.exp();
        const gamma = f.lcm(g).getExp();
        if (!f.sameVars(g))
            throw new Error("COMPUTING S-POL OF POLYNOMIALS IN DIFFERENT RINGS");
        return new Monomial(1, this.expMinus(gamma, alpha), f.getVars())
            .toPolynomial()
            .multiply(f)
            .minus(new Monomial(1, this.expMinus(gamma, beta), f.getVars()).toPolynomial().multiply(g));
    }
    /**
     * Computes a Groebner base of I using Buchberger's Algorithm
     * @param F Generator of the ideal I = <F>
     * @param maxIter maximum iterations
     */
    static buchberger(F, maxIter = 1000) {
        let currIt = 0;
        let G = F;
        let added;
        let opAhorradas = 0;
        do {
            currIt++;
            added = false;
            let newG = Array.from(G);
            const fgPairs = this.arrayCombinations(newG);
            for (let i = 0; i < fgPairs.length && !added; i++) {
                const f = fgPairs[i][0];
                const g = fgPairs[i][1];
                if (!this.criterion1(f, g) && !this.criterion3(f, g, newG)) {
                    const r = this.sPol(f, g).divide(newG).remainder;
                    if (!r.isZero()) {
                        G.push(r);
                        added = true;
                    }
                }
                else {
                    opAhorradas++;
                }
            }
        } while (added && currIt < maxIter);
        return G;
    }
    /**
   * Computes a reduced Groebner base of I using Buchberger's Algorithm and Criteria
   * @param F Generator of the ideal $I = <F>$
   * @param maxIter maximum iterations
   */
    static buchbergerReduced(F, maxIter = 1000) {
        return this.reduce(this.buchberger(F, maxIter));
    }
    /**
     * Reduces a Groebner base
     * @param G base to reduce
     */
    static reduce(G) {
        let res = [];
        G = G.map(g => g.multiply(1 / g.lc()));
        for (let i = 0; i < G.length; i++) {
            let g = G[i];
            let div = g.divide(G.filter(e => !e.equals(g)));
            if (!div.remainder.isZero()) {
                G[i] = div.remainder;
                res.push(div.remainder);
            }
        }
        return res;
    }
    // static setOrder(order: "lex" | "degrevlex"){
    //   this.order = order;
    // }
    static criterion1(f, g) {
        let res = true;
        const lcmFG = f.lcm(g);
        const expF = f.exp();
        const expG = g.exp();
        const s = expF.length;
        const lcmfLcmg = Array(s).fill(0);
        for (let i = 0; i < s; i++) {
            lcmfLcmg[i] = expF[i] + expG[i];
        }
        //console.log(expF + " + " + expG + " = " + lcmfLcmg);
        for (let i = 0; i < s && res; i++) {
            if (lcmfLcmg[i] !== lcmFG.getExp()[i]) {
                // console.log(lcmFG, " != ", lcmfLcmg);
                res = false;
            }
            else {
                // console.log(lcmFG, " = ", lcmfLcmg);
            }
        }
        // console.log("RES: " + res+ "\n==========");
        return res;
    }
    static criterion2(gi, gj, G) {
        // return false;
        const a = gi.lcm(gj);
        const startIndex = Math.max(G.indexOf(gi), G.indexOf(gj)) + 1;
        let res = false;
        for (let i = startIndex; i < G.length && !res; i++) {
            if (this.expIsMultiple(a.getExp(), G[i].exp())) {
                res = true;
            }
        }
        return res;
    }
    /**
     *
     */
    static criterion3(f, g, G) {
        let res = false;
        const startIndex = Math.max(G.indexOf(f), G.indexOf(g)) + 1;
        for (let i = startIndex; i < G.length && !res; i++) {
            const h = G[i];
            const sPolfh = Polynomial.sPol(f, h);
            const sPolgh = Polynomial.sPol(g, h);
            if (!h.lm().divides(f.lcm(g))) {
                continue;
            }
            if (sPolfh.reduces(G) || sPolgh.reduces(G)) {
                res = true;
            }
            else {
                const lmF = f.lm();
                const lmG = g.lm();
                const lmH = h.lm();
                const gdcFG = f.gcd(g);
                const cond1 = lmH.divides(lmF.divide(gdcFG)) && !g.slm().multiply(h.lm()).equals(h.slm().multiply(g.lm()));
                const cond2 = lmH.divides(lmG.divide(gdcFG)) && !f.slm().multiply(h.lm()).equals(h.slm().multiply(f.lm()));
                res = cond1 || cond2;
            }
        }
        return res;
    }
    /**
     * Checks if `a` is an integer multiple of `b`
     */
    static expIsMultiple(a, b) {
        if (a.length !== b.length)
            return false;
        return a.every((val, idx) => val <= b[idx]);
    }
    strContainsChar(str, chars) {
        for (let i = 0; i < str.length; i++) {
            if (chars.includes(str[i]))
                return true;
        }
        return false;
    }
    nodeToString(node) {
        var _a, _b;
        // console.log(node);
        if (node !== null && node !== undefined) {
            if (node.type === "VARIABLE_OR_LITERAL") {
                const isVariable = ["x", "y", "z"].includes(node.value);
                // console.log("ES LITERAL O VARIABLE: " + node.value);
                // console.log(node.value);
                return isVariable ? node.value : node.value;
            }
            if (node.type === "OPERATOR") {
                let left = this.nodeToString(node.left);
                let right = this.nodeToString(node.right);
                // console.log("ES OPERATOR: " + node.value);
                // console.log("OPERATOR LEFT: " + left);
                // console.log("OPERATOR RIGHT: " + right);
                // console.log(`DEVUELVO ${(right && left) ? `${left}${node.value}${right}` : `${node.value}${left}`}`);
                const leftParenthesis = ((_a = node.left) === null || _a === void 0 ? void 0 : _a.type) !== "VARIABLE_OR_LITERAL";
                const rightParenthesis = ((_b = node.right) === null || _b === void 0 ? void 0 : _b.type) !== "VARIABLE_OR_LITERAL";
                // console.log("OPERATOR: " + node.value);
                // console.log(node.value === "-");
                // console.log("TYPEL: " + node.left?.type);
                // console.log("TYPER: " + node.right?.type);
                // console.log(`PAR.LEFT: ${leftParenthesis}, RIGHT. PAR: ${rightParenthesis}`);
                const l = leftParenthesis ? `(${left})` : `${left}`;
                const r = rightParenthesis ? `(${right})` : `${right}`;
                // console.log('RIGHT ' + r);
                if (node.value === "-") {
                    // console.log("asi es:", left, right);
                }
                if (right && left)
                    return `${l}${node.value}${r}`;
                else {
                    // console.log("ASI ES", `${node.value}${l}`);
                    return `${node.value}${l}`;
                }
            }
            if (node.type === "FUNCTION") {
                // console.log("ES F: " + node.value);
                let left = this.nodeToString(node.left);
                let right = this.nodeToString(node.right);
                // console.log(`DEVUELVO ${left}${node.value}${right}`);
                return `${left}${node.value}${right}`;
            }
        }
        return "";
    }
    /**
     * Computes the implicit equation of a variety given the parametrizations of each variable in R3
     * @param fx Parametrization for x
     * @param fy Parametrization for y
     * @param fz Parametrization for z
     * @returns Generator of the smallest variety containing the image of (`fx`,`fy`,`fz`)
     */
    static implicitateR3(fx, fy, fz, parameters = []) {
        if (!fx.sameVars(fy) || !fx.sameVars(fz))
            throw new Error("PARAMETRIZATIONS IN DIFFERENT RINGS");
        const elimVars = fx.getVars().filter(v => !parameters.includes(v));
        console.log("VARS: " + elimVars);
        if (elimVars.some(v => ["x", "y", "z"].includes(v)))
            throw new Error("PARAMETRIZATIONS CAN'T USE X,Y,Z VARIABLES");
        const resVars = parameters.concat(["x", "y", "z"]);
        const impVars = elimVars.concat(resVars);
        console.log("TEST1");
        const x = new Polynomial("x", impVars);
        const y = new Polynomial("y", impVars);
        const z = new Polynomial("z", impVars);
        console.log("TEST2");
        fx.pushVariables(resVars);
        fy.pushVariables(resVars);
        fz.pushVariables(resVars);
        const I = new Ideal([x.minus(fx), y.minus(fy), z.minus(fz)].concat());
        let J = [];
        I.getGenerators().forEach(gen => {
            console.log("TEST: " + gen);
            if (!gen.useAnyVariables(elimVars)) {
                console.log("AÑADO " + gen);
                J.push(gen);
            }
        });
        console.log("PARAM: " + J);
        const intersection = J[0];
        if (intersection === undefined)
            return new Polynomial("0", resVars);
        console.log("removing");
        intersection.removeVariables(elimVars);
        console.log("end remov", intersection.toString());
        return intersection;
    }
}
