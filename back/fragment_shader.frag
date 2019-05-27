precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[25];
uniform float u_kernelWeight;
uniform vec4 u_colorVec;
//uniform float u_lightmatch[256];
uniform sampler2D u_palette; // Using matrices to reduce the number of uniforms
uniform float u_saturation;
uniform float u_vibrance;


uniform float u_dehaze;
uniform float u_atmosferic_light;
uniform float u_masking;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;


// Get light match
float getLightMatch(int val) {
	if (val > 128) {
		for (int i = 128; i < 256; i++) {
			if(i == val) {
				return float(i) / 256.0; //u_lightmatch[cc][0][1];
			}
		}	
	} else {
		for (int i = 0; i <= 128; i++) {
			if(i == val) {
				return u_lightmatch[int(ceil(float(i) / 16.0))][int(ceil(mod(float(i), 16.0) / 4.0))][int(mod(float(i), 4.0))];
			}
		}	
	}
	
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
	if(r > 1.0) { r = 1.0; }
	if(g > 1.0) { g = 1.0; }
	if(b > 1.0) { b = 1.0; }
	if(r < 0.0) { r = 0.0; }
	if(g < 0.0) { g = 0.0; }
	if(b < 0.0) { b = 0.0; }
	return vec3(r, g, b);
}


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

	return 1.0 - dark;
}

vec4 image_process(vec4 PIXEL_COLOR) {
	if(PIXEL_COLOR.r > 1.0) { PIXEL_COLOR.r = 1.0; }
	if(PIXEL_COLOR.g > 1.0) { PIXEL_COLOR.g = 1.0; }
	if(PIXEL_COLOR.b > 1.0) { PIXEL_COLOR.b = 1.0; }
	if(PIXEL_COLOR.r < 0.0) { PIXEL_COLOR.r = 0.0; }
	if(PIXEL_COLOR.g < 0.0) { PIXEL_COLOR.g = 0.0; }
	if(PIXEL_COLOR.b < 0.0) { PIXEL_COLOR.b = 0.0; }
	vec3 hsv_pixel = rgb2hsv(PIXEL_COLOR);

	hsv_pixel.z = getLightMatch(int(hsv_pixel.z * 255.0));
	/*if (u_brightness != 0.0) {
  	hsv_pixel.z += u_brightness;
  }
  
  if (u_contrast != 0.0) {
  	hsv_pixel.z = (u_contrast + 1.0) * (hsv_pixel.z - 0.5) + 0.5;
	}
*/

	if (u_vibrance != 1.0) {
		hsv_pixel.y = pow(hsv_pixel.y, u_vibrance);
	}

	if (u_saturation != 0.0) {
		hsv_pixel.y += u_saturation;
	}

	

	if (hsv_pixel.y > 1.0) { hsv_pixel.y = 1.0; }
	if (hsv_pixel.y < 0.0) { hsv_pixel.y = 0.0; }

	vec3 rgb_pix = hsv2rgb(hsv_pixel);
	if (u_dehaze != 0.0) {
		float transmision = getTransmission();
		//if (u_dehaze > 0.0) {
			rgb_pix.r = rgb_pix.r * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.r - u_atmosferic_light) / max(transmision, 0.1) + u_atmosferic_light); // Dehaze algo
			rgb_pix.g = rgb_pix.g * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.g - u_atmosferic_light) / max(transmision, 0.1) + u_atmosferic_light); // Dehaze algo
			rgb_pix.b = rgb_pix.b * (1.0 - u_dehaze) + u_dehaze * ((rgb_pix.b - u_atmosferic_light) / max(transmision, 0.1) + u_atmosferic_light); // Dehaze algo
		//}
	}


	return vec4(rgb_pix, 1.0);

	
}




void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  vec4 center = texture2D(u_image, v_texCoord);
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

	
  vec4 masking = mix(center, vec4((colorSum / u_kernelWeight).rgb, 1), u_masking); // Masking original image and 
  gl_FragColor = image_process(masking);
}