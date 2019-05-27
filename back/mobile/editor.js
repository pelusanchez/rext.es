(function(__window) {
  "use strict";
  var ShaderLoader = ShaderLoader || {};
  ShaderLoader.fromUrl = function(url) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetch(url);
        resolve(response.text());
      } catch(err) {
        reject(err);
      }
    })
  }
  __window.requestAnimationFrame = __window.requestAnimationFrame ||
                              __window.mozRequestAnimationFrame ||
                              __window.webkitRequestAnimationFrame || 
                              __window.msRequestAnimationFrame || 
                              function(fn) { setTimeout(fn, 20); };
  var params = {
    hdr: 0,
    exposure: 0,
  	temperature: 0,
    tint: 0,
  	brightness: 0, // [0-100]
  	saturation: 0, // [0-100]
  	contrast: 0, // [0-100]
  	vibrance: 0,
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

  var defaultParams = (function(par) {
    var defa = {};
    Object.keys(par).forEach(key => {
      defa[key] = par[key];
    })
    return defa;
  })(params);

  function clamp(a, b, c) {
    return (a < b) ? b : (a > c) ? c : a;
  }

  function hsv2rgb(pixel_hsv){
    var a, d, c;
    var r, g, b;

    a = pixel_hsv[2] * pixel_hsv[1];
    d = a * (1.0 - Math.abs( (pixel_hsv[0] / 60.0) % 2.0 - 1.0));
    c = pixel_hsv[2] - a;

    
    // Fastest way?
    if (pixel_hsv[0] < 180.0) {
      if (pixel_hsv[0] < 60.0) {
        r = pixel_hsv[2];
        g = d + c;
        b = c;
      } else if (pixel_hsv[0] < 120.0) {
        r = d + c;
        g = pixel_hsv[2];
        b = c;
      } else {
        r = c;
        g = pixel_hsv[2];
        b = d + c;
      }
    } else {
      if (pixel_hsv[0] < 240.0) {
        r = c;
        g = d + c;
        b = pixel_hsv[2];
      } else if(pixel_hsv[0] < 300.0) {
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

    return [r, g, b];
  }

  



  // WEBGL PART ======================================  

  var PROCESSING = false;

  var realImage = null;

  var temptint = [1, 1, 1]; // Temperature and Tint RGB channels (multipliers of R, G and B)

  var IMAGE_CONVOLUTION_KERNEL = [0,0,0,0,0, 0,0,0,0,0 ,0,0,1,0,0, 0,0,0,0,0 ,0,0,0,0,0];


  function getLuma(rgb_pix) {
    return 0.2126 * rgb_pix.r + 0.7152 * rgb_pix.g + 0.0722 * rgb_pix.b;
  }



  function __ERROR(m) {
    Popup.show({
      header: 'Se ha producido un error',
      body: m
    });
  }

  function isMobile() {
    return /mobile|android|iphone|ipad|ipod|kindle|symbian/i.test(navigator.userAgent||navigator.vendor||__window.opera);
  }

 /* BEGIN WEBGL PART */

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }


  function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
   
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    __ERROR("createProgram Error");
  }


  function createTexture(gl) {
    var texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
  }




  /* DATA CALLBACKS */
  var DATA_CALLBACK = DATA_CALLBACK || {};

  DATA_CALLBACK.kernel_update = function () {
  	// 3x3 kernel
  	var sharpness = - params.sharpen;
  	var radius = params.sharpen_radius;
  	
  	if (params.radiance != 0) {
  		sharpness -= 0.5 * params.radiance;
  		radius += 0.5 * params.radiance;
  	}

    if (params.hdr != 0) {
      sharpness -= 0.5 * params.hdr;
      radius += 0.5 * params.hdr;
    }

  	var A = sharpness * Math.exp(- Math.pow(1    / radius, 2)); 
  	var B = sharpness * Math.exp(- Math.pow(1.41 / radius, 2));
  	var C = sharpness * Math.exp(- Math.pow(2    / radius, 2));
  	var D = sharpness * Math.exp(- Math.pow(2.24 / radius, 2));
  	var E = sharpness * Math.exp(- Math.pow(2.83 / radius, 2));
  	var X = 1;
  	if (sharpness < 0) {
  		X += 4 * Math.abs(E) + 8 * Math.abs(D) + 4 * Math.abs(C) + 4 * Math.abs(B) + 4 * Math.abs(A);
  	}

  	IMAGE_CONVOLUTION_KERNEL = [E, D, C, D, E,
  															D, B, A, B, D,
  															C, A, X, A, C,
  															D, B, A, B, D,
  															E, D, C, D, E];
  }


  // Temp and Tint
  DATA_CALLBACK.updateTemptint = function () { // Temperature in kelvin
    var T = params.temperature;


    if (T < 0) {
      var __TEMP_DATA = [[0.6167426069865002, 0.017657981710823077],[0.5838624982041293, 0.06447754787874993],[0.5666570157784903, 0.1010769359975838],[0.5600215017846518, 0.13012054359808795],[0.5603460901328465, 0.15370282338343416],[0.5651414015638195, 0.1734071109259789],[0.5727157905223393, 0.19040417876076665],[0.5819305919306469, 0.20554787970182647],[0.5920253173976543, 0.219454396860673],[0.6024964973113273, 0.23256361077001078],[0.613014923688415, 0.2451851574423344],[0.6233694681448863, 0.2575325541865392],[0.633428991849502, 0.2697484189519574],[0.6431164873163056, 0.2819231700046263],[0.6523914777767198, 0.29410898225476145],[0.6612380004437802, 0.30633028466830314],[0.6696563786680246, 0.31859171532935343],[0.6776575761390952, 0.330884185957384],[0.6852593188363603, 0.34318952105568623],[0.6924834326806721, 0.3554840067292358],[0.6993540206164168, 0.36774109382812364],[0.705896221219359, 0.37993343721079975],[0.712135371070854, 0.3920344089104195],[0.7180964477199883, 0.4040191918024166],[0.7238037074478182, 0.41586553788423575],[0.7292804578150028, 0.42755425869079605],[0.7345489228275083, 0.43906950280216533],[0.7396301709912545, 0.4503988656030025],[0.7445440852278651, 0.4615333686006381],[0.7493093597375261, 0.47246733915721345],[0.7539435132044948, 0.4831982160881075],[0.7584629107855697, 0.4937263019887011],[0.7628827894765442, 0.5040544792219176],[0.7672172829757861, 0.5141879031216875],[0.7756812566990368, 0.5339005596070674],[0.7756812566990368, 0.5339005596070674],[0.7798336535847834, 0.5434985836882681],[0.7839465092903851, 0.552938802301879],[0.7880286368234596, 0.5622329533372938],[0.7920877696863722, 0.5713931712543325],[0.796130534601134, 0.5804317041849897],[0.8001624136045166, 0.5893606423074715],[0.8041876951180534, 0.5981916567442426],[0.8082094136732589, 0.6069357478075997],[0.8122292780585781, 0.6156030011340633],[0.8162475877574743, 0.624202350096731],[0.8202631376804659, 0.6327413428542148],[0.8242731113661302, 0.6412259124772712],[0.8282729630469863, 0.6496601487868902],[0.8322562892583072, 0.6580460708395705],[0.8362146910181553, 0.6663833994084263],[0.8401376280395388, 0.6746693293369075],[0.8440122669563406, 0.6828983022904387],[0.8478233261635671, 0.691061781205187],[0.8515529205921868, 0.6991480286361483],[0.8578515274860328, 0.7143328511178657],[0.8630349166004683, 0.7236145588845],[0.8630349166004683, 0.7236145588845],[0.8678866519883774, 0.7326305266929798],[0.8724265417351438, 0.7413920824039555],[0.8766746938112879, 0.7499106260961086],[0.8806514255414362, 0.7581975699581189],[0.8843771730729832, 0.7662642858505886],[0.8878724008449614, 0.7741220599147951],[0.8911575110568668, 0.7817820536219475],[0.8942527531374216, 0.7892552706795768],[0.8971781332133792, 0.7965525292390034],[0.9025975721615955, 0.8106613818669473],[0.9051296119968262, 0.8174934982533621],[0.9051296119968262, 0.8174934982533621],[0.9075675706910422, 0.8241906743465228],[0.9099288798932852, 0.8307625342003426],[0.912230184763394, 0.8372184337382709],[0.914487253441016, 0.8435674571884941],[0.9167148865142485, 0.8498184155292972],[0.9189268264883301, 0.8559798466723794],[0.9211356672547586, 0.862060017138353],[0.9233527635598611, 0.8680669250033681],[0.9278504028585166, 0.8798916280267886],[0.9301466448383797, 0.8857241176152066],[0.9324823592671754, 0.8915127453709542],[0.9348613471976668, 0.8972642431099969],[0.9348613471976668, 0.8972642431099969],[0.9372856273504615, 0.9029851088748369],[0.9397553455825536, 0.9086816143048344],[0.9422686843563701, 0.9143598121965675],[0.9448217722084058, 0.9200255441824128],[0.947408593218177, 0.925684448465339],[0.9500208964767429, 0.931341967556689],[0.9552772279767501, 0.9426736878435626],[0.9578927646784257, 0.9483578644262163],[0.9604766194871308, 0.954060621455171],[0.9630080085847714, 0.9597865363484674],[0.965463369977889, 0.9655400352277332],[0.965463369977889, 0.9655400352277332],[0.9678162729662736, 0.9713253997462401],[0.9700373276119754, 0.9771467737131783],[0.9720940942080452, 0.9830081695063213],[0.9739509927471266, 0.9889134742677088],[0.97556921239073, 0.9948664558790756],[0.9782396416593983, 1]];
      R = 1;
      var i = __TEMP_DATA[parseInt((T + 1) * 100) ];
      G = i[0];
      B = i[1];
    } else {
      R = 0.0438785 / (Math.pow(T + 0.150127, 1.23675)) + 0.543991;
      G = 0.0305003 / (Math.pow(T + 0.163976, 1.23965)) + 0.69136;
      B = 1;
    }

    if (params.tint == -1) {
      params.tint = -0.99;
    }

    G += params.tint;


    // Luma correction
    var curr_luma = getLuma({r: R, g: G, b: B});
    var mult_K = 1 / curr_luma;

    temptint = [R * mult_K, G * mult_K, B * mult_K];
    
  }

  var LIGHT_MATCH = (function() {
  	var _r = [];
  	for (var i = 0; i < 256; i++) {
  		_r[i] = i;
  	}
  	return _r;
  })();

  /**
   * Lightning generation:
   * Map brightness values depending on Brightness, Contrast... etc
   */
  DATA_CALLBACK.generateLightning = function () {
  	var f = getCuadraticFunction(
  			params.blacks,
  			params.shadows + 0.33,
  			params.highlights + 0.66,
  			params.whites + 1,
  			0,  0.33, 0.66, 1);


  	// Radiance part
  	if (params.radiance != 0) {
  		var f_radiance = getCuadraticFunction(
  			0,
  			0.33 - params.radiance * 0.11,
  			0.66 + params.radiance * 0.11,
  			1,
  			0, 0.33, 0.66, 1);
  	}

  	//var kontrast = (params.contrast + 1.0);
  	for (var i = 0; i < 256; i++) {
  		var pixel_value = i / 256;

  		// Brightness
  		//pixel_value += params.brightness;
  		if (pixel_value > 1) { pixel_value = 1; }
  		if (pixel_value < 0) { pixel_value = 0; }
  		// Contrast
  		//pixel_value = kontrast * (pixel_value - 0.5) + 0.5;

  		if (pixel_value > 1) { pixel_value = 1; }
  		if (pixel_value < 0) { pixel_value = 0; }
  		
  		if (f_radiance) {
  			pixel_value = f_radiance(pixel_value);
  		}
  		pixel_value = f(pixel_value);
  		if (pixel_value > 1) { pixel_value = 1; }
  		if (pixel_value < 0) { pixel_value = 0; }
  		LIGHT_MATCH[i] =  pixel_value * 255; //f(pixel_value);
  	}
  }

  /**
   * kernelNormalization
   * Compute the total weight of the kernel in order to normalize it
   */
  function kernelNormalization(kernel) {
    return kernel.reduce(function(a, b) { return a + b; });
  }

  /**
   * render
   * Prepare the environment to edit the image
   * image: Image element to edit (Image object)
   * context: webgl context. Default: __window.gl
   * SET_FULL_RES: no resize the image to edit. Default: false (resize the image)
   */


  function render(image, context, preventRenderImage) {

    var gl = context || __window.__gl;
    
    // Load GSLS programs

    var __VSS = createShader(gl, gl.VERTEX_SHADER, __SHADERS__.VERTEX);
    
  	var __FSS = createShader(gl, gl.FRAGMENT_SHADER, __SHADERS__.FRAGMENT);

    try {
    	var program = createProgram(gl,
      	__VSS, 
      	__FSS);
    } catch(err) {
    	__ERROR(err);
    }

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Set a rectangle the same size as the image.
    var WIDTH = image.width;
    var HEIGHT = image.height;
    gl.canvas.width = WIDTH;
    gl.canvas.height = HEIGHT;

    setRectangle(gl, 0, 0, WIDTH, HEIGHT);

    // Create the rectangle 
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);
  	


  	gl.activeTexture(gl.TEXTURE0);

    var originalImageTexture = createTexture(gl);
    // Upload the image into the texture.
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    } catch(err) {
      __ERROR(err);
    }

    var u_image = gl.getUniformLocation(program, "u_image");
  	


    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
    var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");
    var flipY = gl.getUniformLocation(program, "u_Yflip");
    var u_exposure = gl.getUniformLocation(program, "u_exposure");
    var u_brightness = gl.getUniformLocation(program, "u_brightness");
    var u_contrast = gl.getUniformLocation(program, "u_contrast");
    var u_vibrance = gl.getUniformLocation(program, "u_vibrance");
    var u_saturation = gl.getUniformLocation(program, "u_saturation");
    var u_masking = gl.getUniformLocation(program, "u_masking");
    var u_dehaze = gl.getUniformLocation(program, "u_dehaze");
    var u_atmosferic_light = gl.getUniformLocation(program, "u_atmosferic_light");
    var u_temptint = gl.getUniformLocation(program, "u_temptint[0]");
    var u_bAndW = gl.getUniformLocation(program, "u_bAndW");
    var u_hdr = gl.getUniformLocation(program, "u_hdr");

    var u_lut = gl.getUniformLocation(program, "u_lut");
    // Upload the LUT (contrast, brightness...)
    gl.activeTexture(gl.TEXTURE1);

    var LUTTexture = createTexture(gl);
    
    
    
    __window.updatePhoto = function() {
    	return update();
    }

    // Tell WebGL how to convert from clip space to pixels

    

    gl.viewport(0, 0, WIDTH, HEIGHT);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!preventRenderImage) { update(); }

    function update() {

      

  	  
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 256, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE,
        new Uint8Array(LIGHT_MATCH));

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the position attribute
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Turn on the teccord attribute
      gl.enableVertexAttribArray(texcoordLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

      gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

      // set the resolution
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

      // set the size of the image
      gl.uniform2f(textureSizeLocation, WIDTH, HEIGHT);

      // Set the contrast
      gl.uniform1f(u_brightness, params.brightness);
      //gl.uniform1f(u_contrast, params.contrast);
      gl.uniform1f(u_exposure, params.exposure);
      gl.uniform1f(u_contrast, params.contrast);
      gl.uniform1f(u_saturation, params.saturation);
      gl.uniform1f(u_vibrance, 1 - params.vibrance);
      gl.uniform1f(u_masking, params.masking);
      gl.uniform1f(u_dehaze, params.dehaze);
      gl.uniform1f(u_atmosferic_light, params.atmosferic_light);
      gl.uniform3fv(u_temptint,
        temptint
        .concat(hsv2rgb([params.lightColor * 360, params.lightSat, params.lightFill]))
        .concat(hsv2rgb([params.darkColor * 360, params.darkSat, params.darkFill]))); // vec3 x3
      gl.uniform1f(u_bAndW, params.bAndW);
      gl.uniform1f(u_hdr, params.hdr);

      // Show image
      gl.uniform1i(u_image, 0); // TEXTURE 0
  		gl.uniform1i(u_lut, 1); // TEXTURE 1

      // FLIP IMAGE
      gl.uniform1f(flipY, -1);

      
      // set the kernel and it's weight
      gl.uniform1fv(kernelLocation, IMAGE_CONVOLUTION_KERNEL);
      gl.uniform1f(kernelWeightLocation, kernelNormalization(IMAGE_CONVOLUTION_KERNEL));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }

  // END WEBGL PART==================================================

  function loadImageFromUrl(url) {
    var loaderHandler = UI.loadingHandler();
    // Save real image as a copy
  	realImage = new Image();
  	realImage.src = url;

    var RESOLUTION_LIMIT = 10000000;
    realImage.onload = function() {
      if (realImage.width * realImage.height > RESOLUTION_LIMIT) {
        var K = realImage.height / realImage.width;
        realImage.height = parseInt(Math.sqrt(K * RESOLUTION_LIMIT));
        realImage.width = parseInt(realImage.height / K);
      }
    }
    var img = new Image();
    // Some JPG files are not accepted by graphic card,
    // the following code are to convert it to png image
    img.onerror = () => {
      loaderHandler.end();
      __ERROR("Error al cargar la imagen.")
    }

    img.onload = function() {
      loaderHandler.set(30);
      try {
        var canvas = document.createElement("canvas");

        var _H = Math.sqrt(4000000 * img.height / img.width);
        var _W = img.width / img.height * _H;
        canvas.width = _W;
        canvas.height = _H;

        loaderHandler.set(40);

        var resizeImageCanvas = canvas.getContext("2d");
        resizeImageCanvas.imageSmoothingEnabled = 1;
        resizeImageCanvas.drawImage(img, 0, 0, canvas.width, canvas.height);
        loaderHandler.set(60);

        var _img = new Image();
        _img.src = canvas.toDataURL("image/png");
        loaderHandler.set(80);

        _img.onload = function() {
          loaderHandler.end();
          render(_img, __window.gl);
        }
        
      } catch(err) {
        __ERROR(err);
        loaderHandler.end();
      }
    }
    
    img.src = url;

    loaderHandler.set(20);
  }


  /* BOOT CODE */
  var __BOOT__ = function() {

  	imageElm = document.getElementById("image_main");
  	__window.__gl = imageElm.getContext("webgl") || imageElm.getContext("experimental-webgl");
  	if (!__window.__gl) {
  		alert("Error: No webgl detected");
  	}

  	document.getElementById("image_data").addEventListener("change", (e) => {
      e = e || __window.event
  		let imageReader = new FileReader();
  		loadImageFromUrl(URL.createObjectURL(e.target.files[0]))
  	})

  	loadImageFromUrl("/img.jpg");

  	var sliders = document.getElementsByClassName("slider");
  	var i = sliders.length;
  	while (i--) {
  		sliders[i].addEventListener("input", Actions.sliderCallback);
  	}
  };

  /* Locale class */

  var Locale = Locale || {};
  Locale.dict = {
    "es": {
      "exposure": "Exposición",
      "contrast": "Contraste",
      "brightness": "Brillo",
      "whites": "Blancos",
      "highlights": "Luces",
      "shadows": "Sombras",
      "blacks": "Negros",
      "temperature": "Temperatura",
      "tint": "Matiz",
      "saturation": "Saturación",
      "vibrance": "Vibrancia",
      "bAndW": "Blanco y negro",
      "sharpen": "Detalles",
      "sharpen_radius": "Radio de detalle",
      "masking": "Máscara",
      "radiance": "Radiancia",
      "dehaze": "Niebla",
      "atmosferic_light": "Luz atmosférica",
      "hdr": "Alto rango dinámico",
      "image_save_title": "¿Desea guardar la imagen?",
      "image_save_text": "Nombre de la imagen (Resolución máxima: 10Mpx) :"
    }
  };
  Locale.current = "es";
  Locale.get = function(value) {
    if (Locale.dict[Locale.current][value]) {
      return Locale.dict[Locale.current][value];
    }
    return value;
  }

  /* Actions Class */

  var Actions = Actions || {};

  // Reset params
  Actions.reset = function () {
    
    // Ask user if are sure
    if (!confirm("Desea reiniciar los ajustes?")) {
      return;
    }

    // Reset params
    Object.keys(params).forEach(key => {
      params[key] = defaultParams[key];
    });

    // Reset sliders
    var ranges = document.getElementsByClassName("range");
    var i = ranges.length;
    while (i--) {
      var currentData = ranges[i].getAttribute("data");
      ranges[i].value = params[currentData];
      if (ranges[i].getAttribute("data-callback")) {
        Actions.callCallbacks(ranges[i].getAttribute("data-callback"));
      }
    }
    // Callbacks!!

    // Update the photo
    updatePhoto();
  }

  // Download the photography

  Actions.downloadSecondStep = function() {

    var filename = document.getElementById("image-name").value;
    Popup.hide();
    if (!filename) {
      filename = 'image';
    }

    filename += '.jpg'; // Add extension
    var loaderHandler = UI.loadingHandler();

    var renderCanvas = document.getElementById("image_main");

    renderCanvas.width = realImage.width;
    renderCanvas.height = realImage.height;

    loaderHandler.set(10);
    render(realImage,  __window.__gl, true);
    loaderHandler.set(40);
    
    setTimeout(function() {
      loaderHandler.set(70);
      updatePhoto();
      renderCanvas.toBlob(function(blob) {
        loaderHandler.set(90);
        var url = URL.createObjectURL(blob);
        var dlLink = document.createElement("a");
        dlLink.href = url; //.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
        dlLink.download = filename;
        document.body.append(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        URL.revokeObjectURL(url);
        blob = null; // This would clean?
        setTimeout(function() {
          loaderHandler.end();
          render(realImage);
        }, 2000);
      }, "image/jpeg", 0.95);

    }, 2000);

  }
  Actions.download = function() {
    
    Popup.show({
      header: Locale.get("image_save_title"),
      bodyHTML: Locale.get("image_save_text") + `<br><input type="text" id="image-name" placeholder="Nombre de la imagen">`,
      onEnterCallback: Actions.downloadSecondStep,
      buttons: [
        { text: 'Aceptar', callback: Actions.downloadSecondStep },
      ]
    }).then(() => {
      document.getElementById("image-name").focus();
    })

  }

  Actions.callCallbacks = function(callbacks) {
    var callback = callbacks.split(",");
    callback.forEach(cb => {
      DATA_CALLBACK[cb]();
    })
  }

  Actions.setParam = function(args) {
    if (PROCESSING) { return; }
 

    if (args.save) {
      Actions.history.push({
        paramName: args.paramName,
        value: params[args.paramName], // Save last value
        callbacks: args.callbacks
      });
    }

    params[args.paramName] = args.value;
    if (args.callbacks) {
      Actions.callCallbacks(args.callbacks);
    }
    
    updatePhoto();
  }


  Actions.timeOutSliderInfo = null;

  Actions.sliderCallback = function(evt) {
    
    evt = evt || __window.event;

    Actions.setParam({
      paramName: this.getAttribute("data"),
      value: parseFloat(this.value),
      callbacks: this.getAttribute("data-callback"),
      save: true
    });

  }
  
  // 
  Actions.history = {
    hist: [],   // History
    currCur: 0, // Current cursor of history
    push: function(args) {
      // Save only once, when current cursor are greater than zero
      args.updateTime = +new Date();
      if (this.currCur > 0) {
        if (this.hist[this.currCur - 1].paramName == args.paramName && (+new Date() - this.hist[this.currCur - 1].updateTime) < 1000) {
          this.hist[this.currCur - 1] = args;
          return;
        }
      }

      // Maximun 50 movements
      if (this.hist.length > 50) {
        this.hist.splice(0, hist.length - 50);
      }

      args.save = false;
      this.currCur = this.hist.push(args);
    },
    undo: function() {
      if (this.currCur < 1) { // No more history avaliable
        return;
      }
      var currentAction = this.hist[--this.currCur];
      Actions.setParam(currentAction);
    },
    redo: function() {
      if (this.currCur >= this.hist.length) {
        return;
      }
      var currentAction = this.hist[++this.currCur];
      Actions.setParam(currentAction);
    }
  }
  /* END Action class */

  // Exports

  window.__BOOT__ = __BOOT__
  window.__ERROR = __ERROR
  window.Actions = Actions
  window.Locale = Locale
  window.defaultParams = defaultParams
})(window);