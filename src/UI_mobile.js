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
	var amount = Math.round(Editor.getParamValue(current_adjust.paramName) * 100) / 100;
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
    amountElm.innerHTML = Locale.get(current_adjust.paramName) + ": " + parseInt(200 * (this.value - 0.5)) / 100;
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
	}, 10);
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

	var rangeVal = (Editor.getParamValue(current_adjust.paramName) || 0) - current_adjust.min;
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
