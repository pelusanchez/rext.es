float gradientLog(float real) {
	vec4 center = texture2D(u_image, v_texCoord);

	

	vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;

	const int radius = 1;
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
	float diff = abs(centerPix - mean);
	float mask = pow(diff, 3.0);
	mean = mean * mask + (1.0 - mask) * centerPix; // mean with threshold
	mean = 4.0 * centerPix - mean;
	mean = clamp(mean, 0.0, 1.0);*/


	float der = (2.0 * centerPix - nextPix * 0.5 + 1.0 ) / 2.0;
	der -= 0.5;
	der = abs(der);


	float contrast = (_max - _min) / 2.0 + getLuma(center.rgb);
	contrast /= 2.0;
	// Compute the new value for real
	//3 * (x -0.5) + 0.5
	contrast = 1.0 - contrast;
	contrast *= 5.0;
	return contrast * (real - 0.5) + 0.5; // 1.0 - contrast;


	if (mean < 0.5) {
		return real * 3.0;
	}

	return (real - 0.5) * 2.0; //real;
	
} 
