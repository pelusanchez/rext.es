const express = require('express');
const fs = require('fs');
const babel = require('@babel/core');
const routes = require('./routes.js');
const ClosureCompiler = require('google-closure-compiler').jsCompiler;
const closureCompiler = new ClosureCompiler({
  compilation_level: 'ADVANCED'
});

const app = express();

var _root = __dirname + '/src/';
var noCache = {
	root: _root,
  maxAge: '0',
  setHeaders: function (res, path, stat) {
    res.set('Last-Modified', Date.now())
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  }
};

app.listen(3000); // Listen to port 3000

// Create the routes

var JSCACHE = {};

app.use((req, res) => {
	var path = req.path;
	
	var filename = path.split(/\//g);
	filename = filename[filename.length - 1];

	console.log("[" + req.method + "] " + path + ", filename = " + filename);
	if (path.indexOf(".js") > -1) { // Create babel code


		const jsCode = fs.readFileSync(_root + path, "utf8");
		var len = jsCode.length;

		if (JSCACHE[path] && len == JSCACHE[path].length) {
			console.log("In cache");
			return res.send(jsCode.code);
		} else {
			console.log("No in cache");
		}

		// Check if there are cached file of this js code
		
		var result = babel.transformSync(jsCode);
		res.set('Content-Type', 'application/js');
		res.set('Last-Modified', Date.now())
		res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
		res.type('js');

		closureCompiler.run([{
		 src: result.code,
		 sourceMap: null // optional input source map
		}], (exitCode, stdOut, stdErr) => {
		  //compilation complete
		  JSCACHE[path] = {
		  	length: len,
		  	code: stdOut[0].src
		  };
		  res.send(stdOut[0].src);
		});

		

	} else {
		res.sendFile(path, noCache);
	}
});
