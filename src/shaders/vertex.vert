precision highp float;

varying vec2 vUv;
uniform float time;
#pragma glslify: noise = require('glsl-noise/simplex/4d');

void main () {
  vUv = uv;
  vec3 transformed = position.xyz;
  float offset = 0.0;
  offset += 0.5 * noise(vec4(position.xyz * 0.5, time * 0.25));
  offset += 0.25 * noise(vec4(position.xyz * 1.5, time * 0.25));
  transformed += normal * offset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}