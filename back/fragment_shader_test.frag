/**
 * David Iglesias. All rights reserved
 */
precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[25];
uniform float u_kernelWeight;

//uniform float u_lightmatch[256];
uniform sampler2D u_lut; // Using a imagr to reduce the number of uniforms

uniform float u_saturation;
uniform float u_vibrance;
uniform float u_brightness;
uniform float u_exposure;
uniform float u_contrast;

uniform float u_dehaze;
uniform float u_atmosferic_light;
uniform float u_masking;
uniform vec3 u_temptint;
uniform float u_bAndW;

uniform float u_hdr;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;


// Get light match
float getLightMatch(int val) {
	float _r = texture2D(u_lut, vec2(float(val) / 256.0, 0.0)).a;
	return clamp(_r, 0.0, 1.0);
	
}

// rgb2hsv 
vec3 rgb2hsv(vec4 pixel) {

	
	float c_max = max(pixel.r, max(pixel.g, pixel.b));	// Obtain the maximun value of RGB channel
	float c_min = min(pixel.r, min(pixel.g, pixel.b));	// Obtain the minimun value of RGB channel

	float delta = c_max - c_min;							//Obtain the difference between maximun and minimun value

	float s = ((c_max == 0.0) ? 0.0 : delta / c_max);
	float v = c_max;
	float _hue;
	if(delta == 0.0){
		_hue = 0.0;
	}else if(c_max == pixel.r){
		_hue = (pixel.g - pixel.b) / delta;
	}else if(c_max == pixel.g){
		_hue = (pixel.b - pixel.r) / delta + 2.0;
	}else if(c_max == pixel.b){
		_hue = (pixel.r - pixel.g) / delta + 4.0;
	}

	float h = _hue * 60.0;
	if(h < 0.0){ h +=360.0;}
	if(h > 360.0){ h -=360.0;}
	return vec3(h, s, v);
}

// hsv2rgb (is the fastest way?)

vec3 hsv2rgb(vec3 pixel_hsv){
	float a, d, c;
	float r, g, b;

	a = pixel_hsv.z * pixel_hsv.y;
	d = a * (1.0 - abs( mod(pixel_hsv.x / 60.0, 2.0) - 1.0));
	c = pixel_hsv.z - a;
	
	// Fastest way?
	if (pixel_hsv.x < 180.0) {
		if (pixel_hsv.x < 60.0) {
			r = a;
			g = d;
			b = 0.0;
		} else if (pixel_hsv.x < 120.0) {
			r = d;
			g = a;
			b = 0.0;
		} else {
			r = 0.0;
			g = a;
			b = d;
		}
	} else {
		if (pixel_hsv.x < 240.0) {
			r = 0.0;
			g = d;
			b = a;
		} else if(pixel_hsv.x < 300.0) {
			r = d;
			g = 0.0;
			b = a;
		} else {
			r = a;
			g = 0.0;
			b = d;
		}
	}
	r = r + c;
	g = g + c;
	b = b + c;
	r = clamp(r, 0.0, 1.0);
	g = clamp(g, 0.0, 1.0);
	b = clamp(b, 0.0, 1.0);

	return vec3(r, g, b);
}

/**
 *	getTransmission
 *  Compute transmission map
 */
float getTransmission() {
	float t = 1.0 / 25.0;
	vec4 center = texture2D(u_image, v_texCoord);

	vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
	float dark = 1.0;
	const int radius = 1;
	for (int ii = -radius; ii <= radius; ii++ ) {
		for(int jj = -radius; jj <= radius; jj++) {
			vec4 pix = texture2D(u_image, v_texCoord + onePixel * vec2( ii,  jj));
			float _min = min(pix.r, min(pix.g, pix.b));
			if (dark > _min) { dark = _min; }
		}
	}

	float darkPix = min(center.r, min(center.g, center.b));
	float diff = abs(darkPix - dark);
	float mask = pow(diff, 3.0);
	dark = dark * mask + (1.0 - mask) * darkPix;

	return 1.0 - dark;
}

float getLuma(vec3 rgb_pix) {
	return 0.2126 * rgb_pix.r + 0.7152 * rgb_pix.g + 0.0722 * rgb_pix.b;
}


float logN(float x) {
	return log(x + 1.0) / log(2.0);
}

float gradientLog(float real) {
	vec4 center = texture2D(u_image, v_texCoord);

	

	vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

	const int radius = 2;
	float _max = 0.0;
	float _min = 1.0;
	float mean = 0.0;
	// Compute gradient

	for (int i = -radius; i <= radius; i++) {
		for (int j = -radius; j <= radius; j++) {
			if (i == 0 && j == 0) { continue; }
			float lum = getLuma(texture2D(u_image, v_texCoord + onePixel * vec2( i,  j)).rgb);
			_max = max(lum, _max);
			_min = min(lum, _min);
		}
	}

	//mean /= pow(float(radius), 2.0) - 1.0;

	float centerPix = getLuma(center.rgb);
	float nextPix =  getLuma(texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)).rgb);
	nextPix +=  getLuma(texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)).rgb);
/*
	
	mean = mean * mask + (1.0 - mask) * centerPix; // mean with threshold
	mean = 4.0 * centerPix - mean;
	mean = clamp(mean, 0.0, 1.0);*/

	float diff = abs(centerPix - mean);
	float mask = pow(diff, 3.0);


	float der = (2.0 * centerPix - nextPix * 0.5 + 1.0 ) / 2.0;
	der -= 0.5;
	der = abs(der);


	float contrast = (_max - _min) / 2.0 + getLuma(center.rgb);
	contrast /= 2.0;
	// Compute the new value for real
	//3 * (x -0.5) + 0.5
	contrast = 1.0 - contrast;
	contrast *= 5.0;
	float mm = pow(1.0 - real, 3.0);
	return contrast * real * mm + real * (1.0 - mm); // 1.0 - contrast;


	if (mean < 0.5) {
		return real * 3.0;
	}

	return (real - 0.5) * 2.0; //real;
	
} 


float getV(vec3 pix) {
	return max(pix.r, max(pix.g, pix.b));
}

// Returns min and max value
vec2 localContrast() {
	vec4 center = texture2D(u_image, v_texCoord);
	vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
	float _min = 1.0;
	float _max = 0.0;
	for (int i = -2; i <= 2; i++) {
		for(int j = -2; j <= 2; j++) {
			_max = max(getV(texture2D(u_image, v_texCoord + onePixel * vec2( i,  j)).rgb), _max);
			_min = min(getV(texture2D(u_image, v_texCoord + onePixel * vec2( i,  j)).rgb), _min);
		}
	}
	return vec2(_min, _max);
}

float getHDR(float val) {
	vec4 center = texture2D(u_image, v_texCoord);

	

	vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

	// GET CONTRAST



/*
	float nei = getV(texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)).rgb)
					+ getV(texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)).rgb)
					+ getV(texture2D(u_image, v_texCoord + onePixel * vec2( -1,  0)).rgb)
					+ getV(texture2D(u_image, v_texCoord + onePixel * vec2( 0,  -1)).rgb);
	float midVal = 8.0 * getV(texture2D(u_image, v_texCoord).rgb) - nei;
	midVal /= 4.0;

	float mask = pow(abs(midVal - getV(center.rgb)), 3.0);
	midVal = val * mask + midVal * (1.0 - mask);

	float _r = 1.0 - pow(1.0 - pow(midVal, 0.4), 0.5); 
	_r = -0.449  * pow(_r, 3.0) + 0.672 * pow(_r, 2.0) + 0.777 * _r;
	return clamp(_r, 0.0, 1.0);*/
	vec2 _r = localContrast();
	float cc = _r.x - _r.y;
	// Contrast stretch 
	float midVal = 1.0 - pow(1.0 - pow(val, 0.3), 0.42);

	// Aumentar el contraste en los tonos medios
	//float midToneMask = 1.0 - pow( (midVal - 0.5)/0.3, 2.0) * 0.5;

	//float contrasted = 2.0 * (midVal - 0.5) + 0.5;
	//float mask = pow(abs(midVal - contrasted), 4.0);
	//midVal = midToneMask * contrasted + (1.0 - midToneMask) * midVal;


	return clamp(midVal, 0.0, 1.0);
}


vec4 image_process(vec4 PIXEL_COLOR) {
	vec3 hsv_pixel = rgb2hsv(PIXEL_COLOR);

	hsv_pixel.z = getLightMatch(int(hsv_pixel.z * 255.0));

	if (u_vibrance != 1.0) {
		hsv_pixel.y = pow(hsv_pixel.y, u_vibrance);
	}

	if (u_saturation != 0.0) {
		hsv_pixel.y += u_saturation;
	}

	
	hsv_pixel.y = clamp(hsv_pixel.y, 0.0, 1.0);
	
	hsv_pixel.z = pow(hsv_pixel.z, 1.0 - u_brightness * 0.6);

	// HDR
	if (hsv_pixel.z > 0.6) {
		hsv_pixel.z = mix(hsv_pixel.z, getHDR(hsv_pixel.z), -u_hdr); // HDR
	} else {
		hsv_pixel.z = mix(hsv_pixel.z, getHDR(hsv_pixel.z), u_hdr); // HDR
	}

	//hsv_pixel.y = 1.0;
	

	//hsv_pixel.z = u_hdr * gradientLog(hsv_pixel.z) + (1.0 - u_hdr) * hsv_pixel.z;
	//hsv_pixel.y = 1.0;
	//hsv_pixel.z = 1.0;

	// u_brightness


	vec3 rgb_pix = hsv2rgb(hsv_pixel);

	if (u_dehaze != 0.0) {
		float transmision = getTransmission();
		//if (u_dehaze > 0.0) {
			rgb_pix.r = rgb_pix.r * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.r - u_atmosferic_light) / max(transmision, 0.2) + u_atmosferic_light); // Dehaze algo
			rgb_pix.g = rgb_pix.g * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.g - u_atmosferic_light) / max(transmision, 0.2) + u_atmosferic_light); // Dehaze algo
			rgb_pix.b = rgb_pix.b * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.b - u_atmosferic_light) / max(transmision, 0.2) + u_atmosferic_light); // Dehaze algo
		//}
	}

	rgb_pix.r += u_exposure;
	rgb_pix.g += u_exposure;
	rgb_pix.b += u_exposure;

	float contrast = u_contrast + 1.0;
	rgb_pix.r = contrast * (rgb_pix.r - 0.5) + 0.5;
	rgb_pix.g = contrast * (rgb_pix.g - 0.5) + 0.5;
	rgb_pix.b = contrast * (rgb_pix.b - 0.5) + 0.5;

	

	rgb_pix.r *= u_temptint.r;
	rgb_pix.g *= u_temptint.g;

	rgb_pix.b *= u_temptint.b;

	if (rgb_pix.r > 1.0) { rgb_pix.r = 1.0; }
	if (rgb_pix.r < 0.0) { rgb_pix.r = 0.0; }

	if (rgb_pix.g > 1.0) { rgb_pix.g = 1.0; }
	if (rgb_pix.g < 0.0) { rgb_pix.g = 0.0; }

	if (rgb_pix.b > 1.0) { rgb_pix.b = 1.0; }
	if (rgb_pix.b < 0.0) { rgb_pix.b = 0.0; }

	if (u_bAndW != 0.0) {
		float mono = getLuma(rgb_pix);
		rgb_pix.r *= 1.0 - u_bAndW;
		rgb_pix.r += u_bAndW * mono ;

		rgb_pix.g *= 1.0 - u_bAndW;
		rgb_pix.g += u_bAndW * mono;

		rgb_pix.b *= 1.0 - u_bAndW;
		rgb_pix.b += u_bAndW * mono;
	}

	return vec4(rgb_pix, 1.0);

	
}




void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  vec4 center = texture2D(u_image, v_texCoord);

  // 
  // 5x5 kernel 
  vec4 colorSum =
  	texture2D(u_image, v_texCoord + onePixel * vec2(-2, -2)) * u_kernel[0] +
    texture2D(u_image, v_texCoord + onePixel * vec2( -1, -2)) * u_kernel[1] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 0, -2)) * u_kernel[2] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 1, -2)) * u_kernel[3] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 2, -2)) * u_kernel[4] +

    texture2D(u_image, v_texCoord + onePixel * vec2( -2, -1)) * u_kernel[5] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[6] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[7] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[8] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 2, -1)) * u_kernel[9] +

    texture2D(u_image, v_texCoord + onePixel * vec2( -2, 0)) * u_kernel[10] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[11] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[12] + // Center
    texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[13] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 2, 0)) * u_kernel[14] +

    texture2D(u_image, v_texCoord + onePixel * vec2(-2,  1)) * u_kernel[15] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[16] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[17] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[18] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 2,  1)) * u_kernel[19] +

    texture2D(u_image, v_texCoord + onePixel * vec2(-2,  2)) * u_kernel[20] +
    texture2D(u_image, v_texCoord + onePixel * vec2(-1,  2)) * u_kernel[21] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 0,  2)) * u_kernel[22] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 1,  2)) * u_kernel[23] +
    texture2D(u_image, v_texCoord + onePixel * vec2( 2,  2)) * u_kernel[24];




  vec4 masking = mix(center, vec4((colorSum / u_kernelWeight).rgb, 1), u_masking);


  vec4 image_proc = image_process(masking);

  // GRADIENT LOG
  //gl_FragColor = gradientLog();
  gl_FragColor = image_proc;
}
