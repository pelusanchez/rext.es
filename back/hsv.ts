function rgb2hsv(r, g, b){
	float max;
	float min;
	float _hue;

	
	max = Math.max(	r, g, b);	// Obtain the maximun value of RGB channel
	min = Math.min(	r, g, b);	// Obtain the minimun value of RGB channel

	float delta = max - min;							//Obtain the difference between maximun and minimun value

	//std::cout<<"Delta = "<<delta<<", Max = "<<max<<", Min = "<<min<<std::endl;
	s = ((max == 0)? 0 : delta / max);
	v = max;

	if(delta == 0){
		_hue = 0;
	}else if(max == r){
		_hue = (g - b) / delta;
	}else if(max == g){
		_hue = (b - r) / delta + 2;
	}else if(max == b){
		_hue = (r - g) / delta + 4;
	}

	h = _hue*60;
	if(h < 0){ h +=360;}
	if(h > 360){ h -=360;}
	return [h, s, v];
	
}



/**
 *	Function: hsv2rgb
 *		Args: hsv3 pixel data
 *		Returns: rgb3 pixel data
 *
 */

 
function hsv2rgb(h, s, v){
	float a, d, c;
	float r, g, b;

	a = v * s;
	d = a * (1- abs( mod(h/60, 2)-1));
	c = v-a;
	
	if(h < 60){
		r = a;
		g = d;
		b = 0;
	}else if(h < 120){
		r = d;
		g = a;
		b = 0;
	}else if(h < 180){
		r = 0;
		g = a;
		b = d;
	}else if(h < 240){
		r = 0;
		g = d;
		b = a;
	}else if(h < 300){
		r = d;
		g = 0;
		b = a;
	}else{
		r = a;
		g = 0;
		b = d;
	}
	r = r+c;
	g = g+c;
	b = b+c;
	if(r > 1) { r = 1; }
	if(g > 1) { g = 1; }
	if(b > 1) { b = 1; }
	return [r, g, b];
}
