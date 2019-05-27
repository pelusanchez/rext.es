window.addEventListener("onload", function() {
	if('serviceWorker' in navigator) {
		try {
	  	navigator.serviceWorker.register('/serviceWorker.js')
	  	console.log("NONE")
	  } catch(err) {
	  	// Error not handled
	  }
	}
});
