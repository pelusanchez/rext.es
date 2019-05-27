(function(top) {
	function res_treatment(arr) {
		var l = arr.length;
		for (var i = 0; i < l; i++) {
			arr[i] = Math.round(arr[i] * 1000) / 1000;
		}
		return arr;
	};

	top.getCuadraticFunction = function(a, b, c, d, aa = 0, bb = 0.33, cc = 0.66, dd = 1) {
		var aaS = aa * aa;
		var bbS = bb * bb;
		var ccS = cc * cc;
		var ddS = dd * dd;
		var aaT = aaS * aa;
		var bbT = bbS * bb;
		var ccT = ccS * cc;
		var ddT = ddS * dd;
		var res = res_treatment(solve4(
			[aaT, bbT, ccT, ddT],
			[aaS, bbS, ccS, ddS],
			[aa, bb, cc, dd],
			[1, 1, 1, 1],
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

	function solve4(w, x, y, z, s) {
		Mw = x[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (x[2] * z[3] - z[2] * x[3]) + z[1] * (x[2] * y[3] - y[2] * x[3]);
		Mx = w[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * y[3] - y[2] * w[3]);
		My = w[1] * (x[2] * z[3] - z[2] * x[3]) - x[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * x[3] - x[2] * w[3]);
		Mz = w[1] * (x[2] * y[3] - y[2] * x[3]) - x[1] * (w[2] * y[3] - y[2] * w[3]) + y[1] * (w[2] * x[3] - x[2] * w[3]);
		D  = w[0] * Mw - x[0] * Mx + y[0] * My - z[0] * Mz;

		Ms = x[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (x[2] * z[3] - z[2] * x[3]) + z[1] * (x[2] * y[3] - y[2] * x[3]);
		Mx = s[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (s[2] * z[3] - z[2] * s[3]) + z[1] * (s[2] * y[3] - y[2] * s[3]);
		My = s[1] * (x[2] * z[3] - z[2] * x[3]) - x[1] * (s[2] * z[3] - z[2] * s[3]) + z[1] * (s[2] * x[3] - x[2] * s[3]);
		Mz = s[1] * (x[2] * y[3] - y[2] * x[3]) - x[1] * (s[2] * y[3] - y[2] * s[3]) + y[1] * (s[2] * x[3] - x[2] * s[3]);
		Dw = s[0] * Ms - x[0] * Mx + y[0] * My - z[0] * Mz;

		Mw = s[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (s[2] * z[3] - z[2] * s[3]) + z[1] * (s[2] * y[3] - y[2] * s[3]);
		Ms = w[1] * (y[2] * z[3] - z[2] * y[3]) - y[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * y[3] - y[2] * w[3]);
		My = w[1] * (s[2] * z[3] - z[2] * s[3]) - s[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * s[3] - s[2] * w[3]);
		Mz = w[1] * (s[2] * y[3] - y[2] * s[3]) - s[1] * (w[2] * y[3] - y[2] * w[3]) + y[1] * (w[2] * s[3] - s[2] * w[3]);
		Dx = w[0] * Mw - s[0] * Ms + y[0] * My - z[0] * Mz;

		Mw = x[1] * (s[2] * z[3] - z[2] * s[3]) - s[1] * (x[2] * z[3] - z[2] * x[3]) + z[1] * (x[2] * s[3] - s[2] * x[3]);
		Mx = w[1] * (s[2] * z[3] - z[2] * s[3]) - s[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * s[3] - s[2] * w[3]);
		Ms = w[1] * (x[2] * z[3] - z[2] * x[3]) - x[1] * (w[2] * z[3] - z[2] * w[3]) + z[1] * (w[2] * x[3] - x[2] * w[3]);
		Mz = w[1] * (x[2] * s[3] - s[2] * x[3]) - x[1] * (w[2] * s[3] - s[2] * w[3]) + s[1] * (w[2] * x[3] - x[2] * w[3]);
		Dy = w[0] * Mw - x[0] * Mx + s[0] * Ms - z[0] * Mz;

		Mw = x[1] * (y[2] * s[3] - s[2] * y[3]) - y[1] * (x[2] * s[3] - s[2] * x[3]) + s[1] * (x[2] * y[3] - y[2] * x[3]);
		Mx = w[1] * (y[2] * s[3] - s[2] * y[3]) - y[1] * (w[2] * s[3] - s[2] * w[3]) + s[1] * (w[2] * y[3] - y[2] * w[3]);
		My = w[1] * (x[2] * s[3] - s[2] * x[3]) - x[1] * (w[2] * s[3] - s[2] * w[3]) + s[1] * (w[2] * x[3] - x[2] * w[3]);
		Ms = w[1] * (x[2] * y[3] - y[2] * x[3]) - x[1] * (w[2] * y[3] - y[2] * w[3]) + y[1] * (w[2] * x[3] - x[2] * w[3]);
		Dz = w[0] * Mw - x[0] * Mx + y[0] * My - s[0] * Ms;
		return [Dw / D, Dx / D, Dy / D, Dz / D];
	}
})(window);