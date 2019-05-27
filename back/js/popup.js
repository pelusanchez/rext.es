var Popup = Popup || {};
Popup.setHeader = function(header) {
	if (!header) {
		Popup.elements.popupHeader.style.display = "none";
	} else {
		Popup.elements.popupHeader.style.display = "";
		Popup.elements.popupHeader.innerText = header;
	}
}

Popup.elements = {};

Popup.setBody = function(body) {
	Popup.elements.popupBody.innerText = body;
}

Popup.setBodyHTML = function(body) {
	Popup.elements.popupBody.innerHTML = body;
}

Popup.clearBottom = function() {
	Popup.elements.popupBottom.innerHTML = "";
}

Popup.addButton = function(text, callback, type) {
	var buttonDiv = document.createElement("div");
	buttonDiv.setAttribute("id", "__popup_button_" + (+ new Date()).toString("32") );
	buttonDiv.className = "button button-" + type;
	buttonDiv.append(document.createTextNode(text));
	buttonDiv.onclick = callback;
	Popup.elements.popupBottom.append(buttonDiv);
}

Popup.create = function() {
	if (document.getElementById("overlay")) {
		return;
	}
	Popup.elements.overlay = document.createElement("div");
	Popup.elements.overlay.setAttribute("id", "overlay");

	Popup.elements.popup = document.createElement("div");
	Popup.elements.popup.setAttribute("id", "popup");

	Popup.elements.popupContainer = document.createElement("div");
	Popup.elements.popupContainer.setAttribute("id", "popup-container");

	Popup.elements.popupHeader = document.createElement("div");
	Popup.elements.popupHeader.setAttribute("id", "popup-header");

	Popup.elements.popupBody = document.createElement("div");
	Popup.elements.popupBody.setAttribute("id", "popup-body");

	Popup.elements.popupBottom = document.createElement("div");
	Popup.elements.popupBottom.setAttribute("id", "popup-bottom");

	Popup.elements.popupContainer.append(Popup.elements.popupHeader);
	Popup.elements.popupContainer.append(Popup.elements.popupBody);
	Popup.elements.popupContainer.append(Popup.elements.popupBottom);

	Popup.elements.popup.append(Popup.elements.popupContainer);

	Popup.elements.overlay.append(Popup.elements.popup);

	document.body.append(Popup.elements.overlay);

	/*<div id="overlay">
			<div id="popup">
				<div id="popup-container">
					<div id="popup-header">
						HEADER
					</div>
					<div id="popup-body">
						BODY
					</div>
					<div id="popup-bottom">
					</div>
				</div>
			</div>
		</div>*/
}

Popup.visible = function(isVisible) {
	if (isVisible) {
		Popup.elements.overlay.style.display = "table";
		setTimeout(function() {
			Popup.elements.overlay.style.opacity = "1";
		}, 200);
	} else {
		Popup.elements.overlay.style.opacity = "0";
		setTimeout(function() {
			Popup.elements.overlay.style.display = "none";	
		}, 200);	
	}
}

Popup.show = function(data) {
	Popup.create();
	Popup.clearBottom();
	Popup.setHeader(data.header);
	if (data.body) {
		Popup.setBody(data.body);
	}

	if (data.bodyHTML) {
		Popup.setBodyHTML(data.bodyHTML);
	}
	document.addEventListener('keydown', Popup.keydown);
	if (!data.preventClose) {
		Popup.addButton("Cerrar", Popup.hide, 'secondary');
	}
	console.log(data)
	if (data.buttons) {
		Object.keys(data.buttons).forEach(button => {

			Popup.addButton(button.text, button.callback, button.type || 'default');
		})
	}
	Popup.visible(true);
}

Popup.keydown = function(e) {
	e = e || window.event;
	if (e.keyCode == 13) {
		Popup.hide();
	}
}
Popup.hide = function() {
	document.removeEventListener('keydown', Popup.keydown);
	Popup.visible(false);
}