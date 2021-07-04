precision highp float;

varying vec2 vUv;
uniform float time;
#pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

void main () {
  float hue = mix(0.2, 0.5, sin(vUv.x * 3.14));
  vec3 color = hsl2rgb(vec3(hue, 0.1, vUv.y));
  gl_FragColor = vec4(color, 1.0);
}