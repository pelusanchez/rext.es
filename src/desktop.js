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

window.onerror = function(errorMessage, errorUrl, errorLine) {
	__ERROR("Error: " + errorMessage + " en la url: " + errorUrl + ", en la Línea:" + errorLine);
};



function setElementDraggable(elmnt) {
	var iniX = 0,
			iniY = 0;
  elmnt.addEventListener("mousedown", dragMouseDown);

  

  function dragMouseDown(ev) {
    var e = ev || window.event;
    e.preventDefault();

    // get the mouse cursor position when starts:
    iniX = e.clientX;
    iniY = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
  	if (elmnt.className.indexOf("scaled") < 0) {
  		return;
  	}
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    var newX = iniX - e.clientX;
    var newY = iniY - e.clientY;
    iniX = e.clientX;
    iniY = e.clientY;
    
    elmnt.style.top = (elmnt.offsetTop - newY) + "px";
    elmnt.style.left = (elmnt.offsetLeft - newX) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

window.addEventListener("load", function(event) {
	// Check mobile
  if (isMobile()) {
  	document.body.innerHTML = "Loading...";
  	document.body.style.background = "#000";
  	location.href="mobile.html";
  	return;
  }



  var dataActionElm = document.getElementsByClassName("data-action");
  var i = dataActionElm.length;
  while (i --) {
  	dataActionElm[i].addEventListener("click", UI.dataActionClick);
  }
  
  var imageElm = document.getElementById("image_main");
  setElementDraggable(imageElm);
  
  


  var menu_container_openers = document.getElementsByClassName("menu-container-title");
  i = menu_container_openers.length;
  while (i--) {
  	menu_container_openers[i].addEventListener("click", UI.clickMenuContainer);	
  }

  var range = document.getElementsByClassName("range");
  i = range.length;
  while (i--) {
    range[i].addEventListener("dblclick", UI.rangeDblClick);
  	range[i].addEventListener("input", UI.moveRange);	
  }

/*  
  document.addEventListener("keydown", e => {
  	e = e || window.event;
  	// Control key pressed
  	if (e.ctrlKey) {
  		if (e.keyCode === 89) { // CNTRL + Y

  		}
  		if (e.keyCode === 90) { // CNTRL + Z

  		}
  	}
  });*/
  document.addEventListener("drop", UI.dropFile);
  document.addEventListener("dragover", event => { event.preventDefault(); event.stopPropagation(); document.body.style.opacity = 0.7; } );
  document.addEventListener("dragend", event => { event.preventDefault(); event.stopPropagation(); document.body.style.opacity = 1; });


  // Image open action
  document.getElementById("image-open").addEventListener("click", function() {
		document.getElementById("image_data").click(); 	
  });

  (function (imageElm) {
	  var lastClick = 0;
	  imageElm.addEventListener("click", (event) => {
	    if (+ new Date() - lastClick < 300) { // Double click
	      
	      if (imageElm.className.indexOf("scaled") > -1) {
	        imageElm.className = imageElm.className.replace(" scaled", "");
	        imageElm.style.position = "";
	        imageElm.style.transformOrigin = "";
					imageElm.style.transform = "";
	      } else {
	        imageElm.className += " scaled";
	        imageElm.style.top = imageElm.offsetLeft + "px";
    			imageElm.style.left = imageElm.offsetLeft + "px";
	        imageElm.style.position = "absolute";
	        
          imageElm.style.transformOrigin = " " + (event.clientX - imageElm.offsetLeft) + "px " + (event.clientY - imageElm.offsetTop) + "px";
					imageElm.style.transform = "scale(2.1)";
	      }
	      
	      return;
	    }
	    
	    lastClick = + new Date();
	    
	  })
	})(imageElm);

  // Download image action
  document.getElementById("image-save").addEventListener("click", async function() {
  	await window.Actions.download({ limit: 2000 }); // limited to 2000
  });

  __BOOT__();
});