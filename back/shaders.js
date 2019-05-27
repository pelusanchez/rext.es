const __SHADERS__ = {
	VERTEX: `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_Yflip;
varying vec2 v_texCoord;


void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 dist = a_position / u_resolution;
   gl_Position = vec4( (dist * 2.0 - 1.0) * vec2(1, u_Yflip), 0, 1);
   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}`,

	FRAGMENT:
	`
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

float getHDR(float val) {

	// Contrast stretch 
	float midVal = 1.0 - pow(1.0 - pow(val, 0.3), 0.42);
	return clamp(midVal, 0.0, 1.0);
}


vec4 image_process(vec4 PIXEL_COLOR) {

	// BEGIN CONSTANT HUE
 	float _max = max(PIXEL_COLOR.r, max(PIXEL_COLOR.g, PIXEL_COLOR.b));
 	float _min = min(PIXEL_COLOR.r, min(PIXEL_COLOR.g, PIXEL_COLOR.b));

 	vec2 sv_pixel = vec2(1.0 - _min / _max, _max);

	sv_pixel.y = getLightMatch(sv_pixel.y);

	if (u_vibrance != 1.0) {
		sv_pixel.x = pow(sv_pixel.x, u_vibrance);
	}

	if (u_saturation != 0.0) {
		sv_pixel.x += u_saturation;
	}
	
	if (u_brightness != 0.0) {
		sv_pixel.y = pow(sv_pixel.y, 1.0 - u_brightness * 0.6);
	}

	// HDR
	if (u_hdr != 0.0) {
		sv_pixel.y = mix(sv_pixel.y, getHDR(sv_pixel.y), u_hdr);
	}

	sv_pixel.x = clamp(sv_pixel.x, 0.0, 1.0);
	sv_pixel.y = clamp(sv_pixel.y, 0.0, 1.0);

	// Transform sv to rgb
	vec3 rgb_pix = vec3(PIXEL_COLOR.r, PIXEL_COLOR.g, PIXEL_COLOR.b);

	if (sv_pixel.x > 0.0) {
		float k = - sv_pixel.x / (1.0 - _min / _max);

		// Update saturation
		rgb_pix.r = (_max - rgb_pix.r) * k + _max;
		rgb_pix.g = (_max - rgb_pix.g) * k + _max;
		rgb_pix.b = (_max - rgb_pix.b) * k + _max;

		// Update value
		rgb_pix.r *= sv_pixel.y / _max;
		rgb_pix.g *= sv_pixel.y / _max;
		rgb_pix.b *= sv_pixel.y / _max;
	} else {
		rgb_pix.r = rgb_pix.g = rgb_pix.b = sv_pixel.y;
	}


	// END CONSTANT HUE 
	

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
	rgb_pix.r += mix(u_temptint[2].r, u_temptint[1].r, mono);
  rgb_pix.g += mix(u_temptint[2].g, u_temptint[1].g, mono); 
  rgb_pix.b += mix(u_temptint[2].b, u_temptint[1].b, mono);
	
	

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

	`
}