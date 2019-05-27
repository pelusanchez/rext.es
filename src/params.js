var Params = Params || {};
Params.params = {
  hdr: 0,
  exposure: 0,
	temperature: 0,
  tint: 0,
	brightness: 0, // [0-100]
	saturation: 0, // [0-100]
	contrast: 0, // [0-100]
	sharpen: 0,
	masking: 0.5,
	sharpen_radius: 1,
	radiance: 0,
	highlights: 0,
	shadows: 0,
	whites: 0,
	blacks: 0,
	dehaze: 0,
  bAndW: 0,
	atmosferic_light: 0.7,
  lightFill: 0,
  lightColor: 0,
  lightSat: 1,
  darkFill: 0,
  darkColor: 0,
  darkSat: 1
};

Params.default = (function(par) {
  var _default = {};
  Object.keys(par).forEach(key => {
    _default[key] = par[key];
  })
  return _default;
})(Params.params);

Params.get = function(name) {
	return Params.params[name];
}

Params.reset = function(name) {
	Object.keys(Params.params).forEach(key => {
	  Params.params[key] = Params.default[key];
	});

}

Params.set = function(name, val) {
	Params.params[name] = parseFloat(val);
}

Params.getDefault = function(name) {
	return Params.default[name];
}