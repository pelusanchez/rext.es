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

						var amountElm = document.getElementById("cantidad");
					  if (amountElm) {
					    amountElm.innerHTML = Locale.get(current_adjust.paramName) + ": " + Math.round(pointVal * 100) / 100;
					  }

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

			var UI = UI || {};
			UI.currentSelected = [];
			UI.currentAdjust = null;
			UI.currentSubmenu = null;


			UI.updateImageTransformation = function() {
				imageElm.style.transformOrigin = " " + CURRENT_IMAGE_TRANSFORMATIONS.originX + "px " + CURRENT_IMAGE_TRANSFORMATIONS.originY + "px";
				imageElm.style.transform = "translate(" + CURRENT_IMAGE_TRANSFORMATIONS.x + "px, " + CURRENT_IMAGE_TRANSFORMATIONS.y + "px) scale(" + CURRENT_IMAGE_TRANSFORMATIONS.scale + ")";
			};

			UI.closeSubmenu = function(menu) {
				document.getElementById("submenu_" + menu).style.transform = "translateY(600%)";
				setTimeout(function() {
					document.getElementById("submenu_" + menu).style.display = "none";
				}, 200); // In order to perform transform before display: none
				
			};

			UI.openSubmenu = function(menu) {
				var subMenuElm = document.getElementById("submenu_" + menu);
				var j = subMenuElm.children.length;
				var i = 0;
				var selectedElm = subMenuElm.children[0]; // select first from default
				while (i < j) {
					if (subMenuElm.children[i].className.indexOf("selected") > -1) {
						selectedElm = subMenuElm.children[i];
						break;
					}
					i++;
				}

				subMenuElm.style.display = "block";
				
				// When open menu, select the selected element on submenu
				//UI.selectAdjust(selectedElm);

				setTimeout(function() {
					subMenuElm.style.transform = "translateY(0%)";
				}, 200); // In order to perform display: block before translateY
				
			}

			UI.selectAdjust = function(that) {
				if (that.getAttribute("data-submenu")) {
					if (UI.currentSubmenu && UI.currentSubmenu !== that.getAttribute("data-submenu")) {
						UI.closeSubmenu(UI.currentSubmenu);
					}
					// Show submenu
					UI.currentSubmenu = that.getAttribute("data-submenu");
					UI.openSubmenu(that.getAttribute("data-submenu"));
					return;
				}

				// Close when menu changes, but prevent when in submenu
				if (UI.currentSubmenu && that.parentElement.className.indexOf("submenu") < 0) {
					UI.closeSubmenu(UI.currentSubmenu);
				}

				

				if (that.getAttribute("data-item")) {
    			current_adjust.paramName = that.getAttribute("data-item");
    		}
    		current_adjust.max = parseFloat(that.getAttribute("max"));
    		current_adjust.min = parseFloat(that.getAttribute("min"));
    		current_adjust.callbacks = that.getAttribute("data-callback") || "";

    		var amountElm = document.getElementById("cantidad");
    		var amount = Math.round(params[current_adjust.paramName] * 100) / 100;
			  if (amountElm) {
			    amountElm.innerHTML = Locale.get(current_adjust.paramName) + ": " + amount;
			  }
			  UI.showSlider();

			}

			UI.dataActionClick = function(event) {
				var that = event.target;
				console.log(event.target);
				if (that.getAttribute("data-action")) {
    			window.Actions[that.getAttribute("data-action")]();
    		}
			} 

			UI.selectMenuItem = function(index, menuElm) {
				if (!menuElm) { // menuElm is menu for default
					menuElm = document.getElementById("menu");
				}

				var menuId = menuElm.getAttribute("id");

				// Independiente del menu
				if (!UI.currentSelected[menuId] ) {
					UI.currentSelected[menuId] = 0; // Default
				}

				if (UI.currentSelected[menuElm.getAttribute("id")] !== index) {
					menuElm.children[UI.currentSelected[menuId]].classList.remove("selected");
					menuElm.children[index].classList.add("selected");
					UI.currentSelected[menuElm.getAttribute("id")] = index;
				}

				UI.selectAdjust(menuElm.children[index]);

			}


	    UI.clickMenuItem = function(event) {
	    	console.log(event.target);
	    	if (this !== event.target.parentElement) { // Select only the parent of text
	    		return;
	    	}

	    	var childElm = event.target.parentElement;
	    	// Obtain the # of element
	    	var menuElm = event.target.parentElement.parentElement;
	    	if (menuElm.classList.contains("menu")) {
	    		var j = menuElm.children.length;
	    		var i = 0;
	    		while (i < j) {
	    			if (menuElm.children[i] === childElm) {
	    				console.log(i);
	    				UI.selectMenuItem(i, menuElm);
	    				break;
	    			}
						i++;
	    		}
	    	}
	    }

	    UI.sliderChangeTO = { to: null, param: null };
	    UI.sliderChange = function(event) {
	    	var _min = current_adjust.min;
				var _max = current_adjust.max;
				var pointVal = (_max - _min) * this.value +  _min;
				pointVal = Math.round(pointVal * 100) / 100;
				var amountElm = document.getElementById("cantidad");
			  if (amountElm) {
			    amountElm.innerHTML = Locale.get(current_adjust.paramName) + ": " + pointVal;
			  }

				// Set params. Timeput prevent system to freezes
				// Clear timeout
				if (UI.sliderChangeTO.param == current_adjust.paramName) {
					clearTimeout(UI.sliderChangeTO.to);	
				} else {
					UI.sliderChangeTO.param = current_adjust.paramName;
				}

				UI.sliderChangeTO.to = setTimeout(function() {
					Actions.setParam({
				    paramName: current_adjust.paramName,
				    value: parseFloat(pointVal),
				    callbacks: current_adjust.callbacks,
				    save: true
				  });
				}, 0);
	    }

	    UI.showSlider = function() {
	    	var rangeClasses = {
					temperature: "temp",
				  tint: "tint",
					saturation: "sat",
					vibrance: "sat",
				  bAndW: "baw",
				  lightFill: "amount",
				  lightColor: "hsl",
				  lightSat: "sat",
				  darkFill: "amount",
				  darkColor: "hsl",
				  darkSat: "sat"
	    	};
	    	var className = rangeClasses[current_adjust.paramName] || "";
	    	document.getElementById("slider_adjust_range").className = className;

	    	var rangeVal = (parseFloat(params[current_adjust.paramName]) || 0) - current_adjust.min;
	    	rangeVal /= (current_adjust.max - current_adjust.min);
	    	document.getElementById("slider_adjust_range").value = rangeVal;

	    	document.getElementById("slider_adjust_info").innerText = Locale.get(current_adjust.paramName);
	    	document.getElementById("slider_adjust").style.display = "block";
	    }

	    UI.hideSlider = function() {
	    	document.getElementById("slider_adjust").style.display = "none";
	    }

	    UI.isSliderShown = function() {
	    	return (document.getElementById("slider_adjust").style.display != "none");
	    }

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
			  document.getElementById("canvas").addEventListener("click", function(event) {
			  	if (UI.isSliderShown()) {
			  		UI.hideSlider();
			  	}
			  });

		    __BOOT__();
		  });

			var Loading = Loading || {};
			Loading.start = function() {

			}