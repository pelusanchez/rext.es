//(function(top) {
	function res_treatment(arr) {
		var l = arr.length;
		for (var i = 0; i < l; i++) {
			arr[i] = Math.round(arr[i] * 1000) / 1000;
		}
		return arr;
	};

	top.getCuadraticFunction = function(a, b, c, d, aa = 0, bb = 0.33, cc = 0.66, dd = 1) {
		var aaS = Math.pow(aa, 2);
		var bbS = Math.pow(bb, 2);
		var ccS = Math.pow(cc, 2);
		var ddS = Math.pow(dd, 2);
		var aaT = aaS * aa;
		var bbT = bbS * bb;
		var ccT = ccS * cc;
		var ddT = ddS * dd;
		var res = res_treatment(preSolve4(
			[aaT, bbT, ccT, ddT],
			[aaS, bbS, ccS, ddS],
			[aa, bb, cc, dd],
			[a, b, c, d]));
		//console.log(res);
		return function(x) {
			var _r = res[3];
			var xx = x;
			_r += res[2] * xx;
			xx *= x;
			_r += res[1] * xx;
			xx *= x;
			_r += res[0] * xx;
			return _r;
		}
		
	};

	function preSolve4(w, x, y, s) {
		var Aa = y[2] - y[3];
		var Ad = w[2] - w[3];
		var Ab = x[2] - x[3];
		var Ah = s[2] - s[3];
		var Ac = x[2] * y[3] - y[2] * x[3];
		var Af = w[2] * y[3] - y[2] * w[3];
		var Ag = w[2] * x[3] - x[2] * w[3];
		var Ai = s[2] * y[3] - y[2] * s[3];
		var Aj = s[2] * x[3] - x[2] * s[3];
		var Ak = w[2] * s[3] - s[2] * w[3];
		var Al = x[2] * s[3] - s[2] * x[3];
		var Am = y[2] * s[3] - s[2] * y[3];

		W = x[1] * Aa - y[1] * Ab + Ac;
		X = w[1] * Aa - y[1] * Ad + Af;
		Y = w[1] * Ab - x[1] * Ad + Ag;
		Z = w[1] * Ac - x[1] * Af + y[1] * Ag;
		_S  = w[0] * W - x[0] * X + y[0] * Y - Z;

		S = x[1] * Aa - y[1] * Ab + Ac;
		X = s[1] * Aa - y[1] * Ah + Ai;
		Y = s[1] * Ab - x[1] * Ah + Aj;
		Z = s[1] * Ac - x[1] * Ai + y[1] * Aj;
		_W = s[0] * S - x[0] * X + y[0] * Y - Z;

		W = s[1] * Aa - y[1] * Ah + Ai;
		S = w[1] * Aa - y[1] * Ad + Af;
		Y = w[1] * Ah - s[1] * Ad + Ak;
		Z = w[1] * Ai - s[1] * Af + y[1] * Ak;
		_X = w[0] * W - s[0] * S + y[0] * Y - Z;

		W = x[1] * Ah - s[1] * Ab + Al;
		X = w[1] * Ah - s[1] * Ad + Ak;
		S = w[1] * Ab - x[1] * Ad + Ag;
		Z = w[1] * Al - x[1] * Ak + s[1] * Ag;
		_Y = w[0] * W - x[0] * X + s[0] * S - Z;

		W = x[1] * Am - y[1] * Al + s[1] * Ac;
		X = w[1] * Am - y[1] * Ak + s[1] * Af;
		Y = w[1] * Al - x[1] * Ak + s[1] * Ag;
		S = w[1] * Ac - x[1] * Af + y[1] * Ag;
		_Z = w[0] * W - x[0] * X + y[0] * Y - s[0] * S;
		return [_W / _S, _X / _S, _Y / _S, _Z / _S];
	}

	function solve4(w, x, y, z, s) {
		var Aa = y[2] * z[3] - z[2] * y[3];
		var Ab = x[2] * z[3] - z[2] * x[3];
		var Ac = x[2] * y[3] - y[2] * x[3];
		var Ad = w[2] * z[3] - z[2] * w[3];
		var Af = w[2] * y[3] - y[2] * w[3];
		var Ag = w[2] * x[3] - x[2] * w[3];
		var Ah = s[2] * z[3] - z[2] * s[3];
		var Ai = s[2] * y[3] - y[2] * s[3];
		var Aj = s[2] * x[3] - x[2] * s[3];
		var Ak = w[2] * s[3] - s[2] * w[3];
		var Al = x[2] * s[3] - s[2] * x[3];
		var Am = y[2] * s[3] - s[2] * y[3];

		W = x[1] * Aa - y[1] * Ab + z[1] * Ac;
		X = w[1] * Aa - y[1] * Ad + z[1] * Af;
		Y = w[1] * Ab - x[1] * Ad + z[1] * Ag;
		Z = w[1] * Ac - x[1] * Af + y[1] * Ag;
		_S  = w[0] * W - x[0] * X + y[0] * Y - z[0] * Z;

		S = x[1] * Aa - y[1] * Ab + z[1] * Ac;
		X = s[1] * Aa - y[1] * Ah + z[1] * Ai;
		Y = s[1] * Ab - x[1] * Ah + z[1] * Aj;
		Z = s[1] * Ac - x[1] * Ai + y[1] * Aj;
		_W = s[0] * S - x[0] * X + y[0] * Y - z[0] * Z;

		W = s[1] * Aa - y[1] * Ah + z[1] * Ai;
		S = w[1] * Aa - y[1] * Ad + z[1] * Af;
		Y = w[1] * Ah - s[1] * Ad + z[1] * Ak;
		Z = w[1] * Ai - s[1] * Af + y[1] * Ak;
		_X = w[0] * W - s[0] * S + y[0] * Y - z[0] * Z;

		W = x[1] * Ah - s[1] * Ab + z[1] * Al;
		X = w[1] * Ah - s[1] * Ad + z[1] * Ak;
		S = w[1] * Ab - x[1] * Ad + z[1] * Ag;
		Z = w[1] * Al - x[1] * Ak + s[1] * Ag;
		_Y = w[0] * W - x[0] * X + s[0] * S - z[0] * Z;

		W = x[1] * Am - y[1] * Al + s[1] * Ac;
		X = w[1] * Am - y[1] * Ak + s[1] * Af;
		Y = w[1] * Al - x[1] * Ak + s[1] * Ag;
		S = w[1] * Ac - x[1] * Af + y[1] * Ag;
		_Z = w[0] * W - x[0] * X + y[0] * Y - s[0] * S;
		return [_W / _S, _X / _S, _Y / _S, _Z / _S];
	}
//})(window);