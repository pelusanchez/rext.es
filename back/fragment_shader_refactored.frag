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
uniform vec3 u_temptint[3]; // RGB temptint, RGB lightFill, RGB darkFill
uniform float u_bAndW;

uniform float u_hdr;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;


// Get light match
float getLightMatch(float val) {
	float _r = texture2D(u_lut, vec2(val, 0.0)).a;
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
	if (delta == 0.0) {
		_hue = 0.0;

	} else if (c_max == pixel.r) {
		_hue = (pixel.g - pixel.b) / delta;
	
	} else if (c_max == pixel.g) {
		_hue = (pixel.b - pixel.r) / delta + 2.0;
	
	} else if (c_max == pixel.b) {
		_hue = (pixel.r - pixel.g) / delta + 4.0;
	}

	float h = _hue * 60.0;
	h = mod(h, 360.0);
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
			r = pixel_hsv.z;
			g = d + c;
			b = c;
		} else if (pixel_hsv.x < 120.0) {
			r = d + c;
			g = pixel_hsv.z;
			b = c;
		} else {
			r = c;
			g = pixel_hsv.z;
			b = d + c;
		}
	} else {
		if (pixel_hsv.x < 240.0) {
			r = c;
			g = d + c;
			b = pixel_hsv.z;
		} else if(pixel_hsv.x < 300.0) {
			r = d + c;
			g = c;
			b = a + c;
		} else {
			r = a + c;
			g = c;
			b = d + c;
		}
	}

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
	dark = mix(darkPix, dark, mask);

	return 1.0 - dark;
}

float getLuma(vec3 rgb_pix) {
	return 0.2126 * rgb_pix.r + 0.7152 * rgb_pix.g + 0.0722 * rgb_pix.b;
}



float getV(vec3 pix) {
	return max(pix.r, max(pix.g, pix.b));
}

// Returns min and max value
vec2 localContrast() {
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

	// Contrast stretch 
	float midVal = 1.0 - pow(1.0 - pow(val, 0.3), 0.42);
	return clamp(midVal, 0.0, 1.0);
}


vec4 image_process(vec4 PIXEL_COLOR) {
	vec3 hsv_pixel = rgb2hsv(PIXEL_COLOR);

	hsv_pixel.z = getLightMatch(hsv_pixel.z);

	if (u_vibrance != 1.0) {
		hsv_pixel.y = pow(hsv_pixel.y, u_vibrance);
	}

	if (u_saturation != 0.0) {
		hsv_pixel.y += u_saturation;
	}

	
	hsv_pixel.y = clamp(hsv_pixel.y, 0.0, 1.0);
	
	hsv_pixel.z = pow(hsv_pixel.z, 1.0 - u_brightness * 0.6);

	// HDR
	hsv_pixel.z = mix(hsv_pixel.z, getHDR(hsv_pixel.z), u_hdr);

	vec3 rgb_pix = hsv2rgb(hsv_pixel);

	if (u_dehaze != 0.0) {
		float transmision = getTransmission();
		float mm = max(transmision, 0.2);
		rgb_pix.r = mix(rgb_pix.r, ((rgb_pix.r - u_atmosferic_light) / mm + u_atmosferic_light), u_dehaze); // Dehaze algo
		rgb_pix.g = mix(rgb_pix.g, ((rgb_pix.g - u_atmosferic_light) / mm + u_atmosferic_light), u_dehaze); // Dehaze algo
		rgb_pix.b = mix(rgb_pix.b, ((rgb_pix.b - u_atmosferic_light) / mm + u_atmosferic_light), u_dehaze); // Dehaze algo
	}

	rgb_pix.r += u_exposure;
	rgb_pix.g += u_exposure;
	rgb_pix.b += u_exposure;

	rgb_pix.r = clamp(rgb_pix.r, 0.0, 1.0);
	rgb_pix.g = clamp(rgb_pix.g, 0.0, 1.0);
	rgb_pix.b = clamp(rgb_pix.b, 0.0, 1.0);

	float contrast = u_contrast + 1.0;
	rgb_pix.r = contrast * (rgb_pix.r - 0.5) + 0.5;
	rgb_pix.g = contrast * (rgb_pix.g - 0.5) + 0.5;
	rgb_pix.b = contrast * (rgb_pix.b - 0.5) + 0.5;

	

	// Temptint operations (TINT AND TEMPERATURE)
	rgb_pix.r *= u_temptint[0].r;
	rgb_pix.g *= u_temptint[0].g;
	rgb_pix.b *= u_temptint[0].b;

	// Lightfill operations
	float mono = getLuma(rgb_pix);
	rgb_pix.r += mix(0.0, u_temptint[1].r, mono) + mix(0.0, u_temptint[2].r, 1.0 - mono);
  rgb_pix.g += mix(0.0, u_temptint[1].g, mono) + mix(0.0, u_temptint[2].g, 1.0 - mono); 
  rgb_pix.b += mix(0.0, u_temptint[1].b, mono) + mix(0.0, u_temptint[2].b, 1.0 - mono);
	
	

	// Black and White
	if (u_bAndW != 0.0) {
		
		rgb_pix.r = mix(rgb_pix.r, mono, u_bAndW);
		rgb_pix.g = mix(rgb_pix.g, mono, u_bAndW);
		rgb_pix.b = mix(rgb_pix.b, mono, u_bAndW);

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

  gl_FragColor = image_process(masking);
}
