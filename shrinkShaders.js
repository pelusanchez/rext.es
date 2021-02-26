const fs = require('fs');

var vertex_shader = fs.readFileSync(__PATH__ + 'vertex_shader.vert', "utf8");
var fragment_shader = fs.readFileSync(__PATH__ + 'fragment_shader_production.frag', "utf8");


const __PATH__ = 'src/'

function removeComments(content) {
	content = content.split(/\n/g);
	var i = content.length;
	var newContent = '';
	while (i--) {
		content[i] = content[i].replace(/\s+/g, '');
		if (content[i].indexOf("\/\/") === 0) {
			continue;
		}
		newContent += content[i] + "\n";
	}
}

fragment_shader = parseCode(fragment_shader);

var shaderFile = `const __SHADERS__ = {
	VERTEX: \`${vertex_shader}\` , 
	FRAGMENT: \`${fragment_shader}\`
}`

fs.writeFileSync(__PATH__ + 'shaders.js', "utf8");
