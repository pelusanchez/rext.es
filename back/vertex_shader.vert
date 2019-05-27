attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_Yflip;
varying vec2 v_texCoord;


void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 dist = a_position / u_resolution;
   gl_Position = vec4( (dist * 2.0 - 1.0) * vec2(1, u_Yflip), 0, 1);
   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}