// Post-processing: bloom for the lit signs, then a film pass (grain, gate weave,
// soft chromatic fringe, vignette, a wandering light leak, and the burn).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const FilmShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.045 }, burn: { value: 0 }, aspect: { value: 1.6 }, vig: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, grain, burn, aspect, vig; varying vec2 vUv;
    float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
    void main(){
      float fr = floor(time * 24.0);
      vec2 weave = vec2(hash(vec2(fr, 1.0)) - 0.5, hash(vec2(fr, 7.0)) - 0.5) * 0.0011;
      vec2 uv = vUv + weave, c = uv - 0.5;
      float d = dot(c, c);
      vec2 off = c * d * 0.011;
      vec3 col = vec3(texture2D(tDiffuse, uv + off).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - off).b);
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col *= 1.0 + (hash(vec2(fr, 3.0)) - 0.5) * 0.035;                          // flicker
      col = mix(col, col * vec3(1.05, 1.0, 0.93), 0.55);                          // warm print
      col += vec3(0.008, 0.011, 0.016) * (1.0 - smoothstep(0.0, 0.25, lum));      // lifted, cool blacks
      vec2 lp = vec2(0.5 + 0.62 * sin(time * 0.07), 0.5 + 0.55 * cos(time * 0.05)) - 0.5;
      float leak = smoothstep(0.75, 0.0, length((c - lp) * vec2(aspect, 1.0))) * noise(uv * 2.5 + time * 0.04);
      col += vec3(1.0, 0.32, 0.06) * leak * (0.05 + burn * 1.6);
      float b = burn * smoothstep(0.25, 0.9, noise(uv * vec2(aspect, 1.0) * 2.2 + vec2(time * 0.9, -time * 0.6)) + burn * 0.6);
      col = mix(col, vec3(1.0, 0.5, 0.12) * 2.6 + vec3(1.0, 0.95, 0.8) * b * 2.0, b * 0.9);
      float g = hash(gl_FragCoord.xy + vec2(fr * 37.0, fr * 91.0)) - 0.5;
      col += g * grain * (1.0 - lum * 0.55);
      col *= mix(1.0, smoothstep(0.82, 0.18, sqrt(d) * 1.08), 0.72 * vig);
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`,
};

export function createFx(renderer, scene, camera) {
  // multisampled target: the timber slats are thin and shimmer without it
  const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.42, 0.7, 1.25);
  composer.addPass(bloom);
  const film = new ShaderPass(FilmShader);
  composer.addPass(film);
  composer.addPass(new OutputPass());
  return {
    composer, bloom, film,
    resize(w, h, pr) { composer.setPixelRatio(pr); composer.setSize(w, h); film.uniforms.aspect.value = w / h; },
    render(time) { film.uniforms.time.value = time; composer.render(); },
    set burn(v) { film.uniforms.burn.value = v; },
    low() { bloom.enabled = false; film.uniforms.grain.value = 0.035; },
  };
}
