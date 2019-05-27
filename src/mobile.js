var __NUM_OF_MENU_ITEMS__ = 5;
var __MENU_ITEMS_PADDING__ = Math.floor( (__NUM_OF_MENU_ITEMS__ - 1 )/ 2);

var CURRENT_IMAGE_TRANSFORMATIONS = {
	x: 0,
	y: 0,
	scale: 1,
	originX: null,
	originY: null,
	deltaX: 0,
	deltaY: 0
};

var current_adjust = {
	paramName: "exposure",
	max: 1,
	min: -1,
	callbacks: ""
};

function isMobile() {
	return /mobile|android|iphone|ipad|ipod|kindle|symbian/i.test(navigator.userAgent||navigator.vendor||window.opera);
}

window.onerror = function(errorMessage, errorUrl, errorLine) {
	__ERROR(errorMessage + " en la url: " + errorUrl + ", en la Línea:" + errorLine);
};

var touch_events = touch_events || {};

touch_events.adjusts = [];
touch_events.currentAdjust = null;

touch_events.startPoints = { x: null, y: null, time: 0 };
touch_events.endPoints = { x: null, y: null, time: 0 };
touch_events.touch = null;


touch_events.start = function(event) {
	if (!current_adjust) {
		return;
	}


	// In order to calculate delta and speed
	touch_events.startPoints.x = event.touches[0].pageX / document.body.offsetWidth;
	touch_events.startPoints.y = event.touches[0].pageY / document.body.offsetHeight;
	touch_events.startPoints.time = + new Date();

	//touch_events.currentAdjust = touch_events.adjusts[parseInt(touch_events.adjusts.length * event.touches[0].pageY / (document.body.offsetHeight - 80))];

}

var DIRECTION = {
	TOP: 0,
	RIGHT: 1,
	LEFT: 2,
	BOTTOM: 3
};

touch_events.move = function(event) {
	//if (event.target.className.indexOf("bloke") < 0) { return; }

	
	touch_events.endPoints.x = event.touches[0].pageX / document.body.offsetWidth;
	touch_events.endPoints.y = event.touches[0].pageY / document.body.offsetHeight;
	touch_events.endPoints.time = + new Date();

	var deltaT = touch_events.endPoints.time - touch_events.startPoints.time;
	deltaT /= 1000;
	var tx = touch_events.endPoints.x - touch_events.startPoints.x;
	var ty = touch_events.endPoints.y - touch_events.startPoints.y;
	var speedX = tx / deltaT;
	var speedY = ty / deltaT;

	// Get direction (TOP BOTTOM LEFT RIGHT)
	var direction = Math.atan2(speedY, speedX);
	var quadraticDirection = null;

	if (Math.abs(direction) > 2.35) {
		quadraticDirection = DIRECTION.LEFT;
	} else if(Math.abs(direction) < 0.78) {
		quadraticDirection = DIRECTION.RIGHT;
	} else {
		if (direction < 0) {
			quadraticDirection = DIRECTION.TOP;
		} else {
			quadraticDirection = DIRECTION.BOTTOM;
		}
		
	}

	var top = event.touches[0].pageY;
	var bottom = document.body.offsetHeight - top;
	if ( event.touches.length == 1 &&
		// Poder ajustar si la imagen no está escalada O si el target no es la propia imagen para poder variarlo cuando está escalado
	     (CURRENT_IMAGE_TRANSFORMATIONS.scale === 1 || event.target !== imageElm ) &&

	     bottom > 100 && top > 80) { // > 100 menu and submenu 

		if (current_adjust) {
			var pointVal = 1.25 * (event.touches[0].pageX / document.body.offsetWidth - 0.1);
			if (pointVal < 0) { pointVal = 0; }
			if (pointVal > 1) { pointVal = 1; }
			var _min = current_adjust.min;
			var _max = current_adjust.max;
			pointVal = (_max - _min) * (pointVal) +  _min;

			// Set params
			Actions.setParam({
		    paramName: current_adjust.paramName,
		    value: parseFloat(pointVal),
		    callbacks: current_adjust.callbacks,
		    save: true
		  });
		}
	} else {

		if (event.target == imageElm) {
			if (event.touches.length == 1) { // Move image
				console.log("Moviendo imagen")
				var _tx = tx * document.body.offsetWidth;
				var _ty = ty * document.body.offsetHeight;
				CURRENT_IMAGE_TRANSFORMATIONS.x = CURRENT_IMAGE_TRANSFORMATIONS.deltaX + _tx;
				CURRENT_IMAGE_TRANSFORMATIONS.y = CURRENT_IMAGE_TRANSFORMATIONS.deltaY + _ty;

				// No move more than necesary at right
				if (CURRENT_IMAGE_TRANSFORMATIONS.x > CURRENT_IMAGE_TRANSFORMATIONS.originX) {
					CURRENT_IMAGE_TRANSFORMATIONS.x = CURRENT_IMAGE_TRANSFORMATIONS.originX;
				}

/* TODO
				// No move more than necesary at left

				if (CURRENT_IMAGE_TRANSFORMATIONS.x > CURRENT_IMAGE_TRANSFORMATIONS.originX) {
					CURRENT_IMAGE_TRANSFORMATIONS.x = CURRENT_IMAGE_TRANSFORMATIONS.originX;
				}

				var t = CURRENT_IMAGE_TRANSFORMATIONS.originX - CURRENT_IMAGE_TRANSFORMATIONS.x;

				console.log(imageElm.offsetWidth * CURRENT_IMAGE_TRANSFORMATIONS.scale / 2 - t);*/
				// No move more than necesary at bottom
				if (CURRENT_IMAGE_TRANSFORMATIONS.y > CURRENT_IMAGE_TRANSFORMATIONS.originY) {
					CURRENT_IMAGE_TRANSFORMATIONS.y = CURRENT_IMAGE_TRANSFORMATIONS.originY;
				}

//							CURRENT_IMAGE_TRANSFORMATIONS.originX = touch_events.startPoints.x * document.body.offsetWidth - imageElm.offsetLeft;
//							CURRENT_IMAGE_TRANSFORMATIONS.originY = touch_events.startPoints.y * document.body.offsetHeight - imageElm.offsetTop;
				UI.updateImageTransformation();
			}
			if (event.touches.length == 2) { // zoom image
				var dist_x = event.touches[0].pageX - event.touches[1].pageX;
				
				var scale = Math.abs(dist_x);
				scale /= document.body.offsetWidth;
				scale = 0.5 + scale * 2;
				if (scale < 1) { scale = 1; }
				scale = Math.round( scale * 100) / 100;
				document.getElementById("cantidad").innerText = "Zoom: " + scale;
				CURRENT_IMAGE_TRANSFORMATIONS.scale = scale;
				UI.updateImageTransformation();
				
			}
		}
		
	}

	/*
	//if (speedX < 100)

	// Only when is one touch
	if (event.touches.length == 1) {
		if (current_adjust) {
			var range = document.querySelector("[data=" + touch_events.currentAdjust + "]");
			var pointVal = 1.25 * (event.touches[0].pageX / document.body.offsetWidth - 0.1);
			if (pointVal < 0) { pointVal = 0; }
			if (pointVal > 1) { pointVal = 1; }
			var _min = parseFloat(range.getAttribute("min"));
			var _max = parseFloat(range.getAttribute("max"));
			pointVal = (_max - _min) * (pointVal) +  _min;
			
			range.value = pointVal;
			range.dispatchEvent(new Event("input"));
		}
	}*/
}

touch_events.end = function(event) {
	var deltaT = touch_events.endPoints.time - touch_events.startPoints.time;
	deltaT /= 1000;
	var speedX = (touch_events.endPoints.x - touch_events.startPoints.x) / deltaT;
	var speedY = (touch_events.endPoints.y - touch_events.startPoints.y) / deltaT;
	CURRENT_IMAGE_TRANSFORMATIONS.deltaX = CURRENT_IMAGE_TRANSFORMATIONS.x;
	CURRENT_IMAGE_TRANSFORMATIONS.deltaY = CURRENT_IMAGE_TRANSFORMATIONS.y;
	//event.preventDefault();				
}

touch_events.cancel = function(event) {
	//event.preventDefault();				
}

touch_events.leave = function(event) {
	//event.preventDefault();				
}

window.RAF = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
window.msRequestAnimationFrame || function(f) { setTimeout(f, 30);};


window.addEventListener("load", function(event) {
	// Check mobile
	/*
  if (!isMobile()) {
  	document.body.innerHTML = "Loading...";
  	document.body.style.background = "#000";
  	location.href="desktop.html";
  	return;
  }
*/


  var dataActionElm = document.getElementsByClassName("data-action");
  var i = dataActionElm.length;
  while (i --) {
  	dataActionElm[i].addEventListener("click", UI.dataActionClick);
  }
  

  var items = document.getElementsByClassName("menu_item");
  i = items.length;
  while (i--) {
  	items[i].addEventListener("click", UI.clickMenuItem);	
  }

  // Image open action
  document.getElementById("image-open").addEventListener("click", function() {
		document.getElementById("image_data").click(); 	
  });

  // Download image action
  document.getElementById("image-save").addEventListener("click", function() {
  	window.Actions.download();
  });

  // Slider range 
  document.getElementById("slider_adjust_range").addEventListener("input", UI.sliderChange);


 /* document.body.addEventListener("touchstart",  touch_events.start, false);
  document.body.addEventListener("touchend",    touch_events.end, false);
  document.body.addEventListener("touchcancel", touch_events.cancel, false);
  document.body.addEventListener("touchleave",  touch_events.leave, false);
	document.body.addEventListener("touchmove",   touch_events.move, false);*/
	// Prevent going back
	history.pushState(null, document.title, location.href);
	window.addEventListener('popstate', function (event) {
		if (UI.isSliderShown()) {
			history.pushState(null, document.title, location.href);
  		UI.hideSlider();
  	}
	});

  document.getElementById("canvas").addEventListener("click", function(event) {
  	if (UI.isSliderShown()) {
  		UI.hideSlider();
  	}
  });

  __BOOT__();
});