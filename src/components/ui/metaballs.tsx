"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader - simple fullscreen quad
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader - ray marching metaballs
const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;

  varying vec2 vUv;

  // Smooth minimum for blending metaballs - polynomial version for smoother blends
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }

  // Sphere signed distance function
  float sdSphere(vec3 p, vec3 center, float radius) {
    return length(p - center) - radius;
  }

  // Scene - multiple metaballs with organic movement
  float scene(vec3 p) {
    float t = uTime * 0.25; // Slower, more elegant movement

    // Main central blob - breathing motion
    float breathe = sin(t * 0.8) * 0.05;
    vec3 center1 = vec3(
      sin(t * 0.5) * 0.15,
      cos(t * 0.4) * 0.1 + breathe,
      sin(t * 0.3) * 0.1
    );

    // Second blob - gentle orbit
    vec3 center2 = vec3(
      cos(t * 0.4) * 0.5 + sin(t * 0.3) * 0.15,
      sin(t * 0.5) * 0.25 + cos(t * 0.6) * 0.1,
      cos(t * 0.35) * 0.2
    );

    // Third blob - counter orbit
    vec3 center3 = vec3(
      -cos(t * 0.35) * 0.45 + sin(t * 0.25) * 0.1,
      cos(t * 0.45) * 0.3,
      sin(t * 0.4) * 0.15
    );

    // Mouse influence - subtle attraction
    vec2 mouse = (uMouse - 0.5) * 2.0;
    center1.x += mouse.x * uMouseInfluence * 0.15;
    center1.y += mouse.y * uMouseInfluence * 0.15;
    center2.x += mouse.x * uMouseInfluence * 0.08;
    center2.y += mouse.y * uMouseInfluence * 0.08;

    // Sphere distances - varied sizes for visual interest
    float d1 = sdSphere(p, center1, 0.38 + breathe);
    float d2 = sdSphere(p, center2, 0.30);
    float d3 = sdSphere(p, center3, 0.26);

    // Smooth blend all metaballs
    float blend = 0.5;
    float d = smin(d1, d2, blend);
    d = smin(d, d3, blend);

    return d;
  }

  // Calculate normal via gradient
  vec3 calcNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
      scene(p + vec3(eps, 0.0, 0.0)) - scene(p - vec3(eps, 0.0, 0.0)),
      scene(p + vec3(0.0, eps, 0.0)) - scene(p - vec3(0.0, eps, 0.0)),
      scene(p + vec3(0.0, 0.0, eps)) - scene(p - vec3(0.0, 0.0, eps))
    ));
  }

  // Fresnel effect
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }

  void main() {
    // Setup ray
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    vec3 ro = vec3(0.0, 0.0, 2.8); // Camera position
    vec3 rd = normalize(vec3(uv * 0.8, -1.0)); // Ray direction

    // Ray march
    float t = 0.0;
    float maxDist = 8.0;

    for(int i = 0; i < 64; i++) {
      vec3 p = ro + rd * t;
      float d = scene(p);

      if(d < 0.002) break;
      if(t > maxDist) break;

      t += d * 0.7;
    }

    // Background - pure black for contrast
    vec3 bg = vec3(0.0);

    if(t < maxDist) {
      vec3 p = ro + rd * t;
      vec3 normal = calcNormal(p);
      vec3 viewDir = -rd;

      // Fresnel for rim lighting
      float fres = fresnel(viewDir, normal, 3.0);

      // Premium monochromatic palette with subtle warmth
      vec3 baseColor = vec3(0.06, 0.06, 0.07);
      vec3 midColor = vec3(0.12, 0.11, 0.13);
      vec3 rimColor = vec3(0.25, 0.22, 0.28); // Subtle purple-gray
      vec3 highlightColor = vec3(0.95, 0.92, 0.88); // Warm white

      // Lighting setup - key light from top-right
      vec3 lightDir1 = normalize(vec3(0.8, 1.0, 0.6));
      vec3 lightDir2 = normalize(vec3(-0.5, 0.3, 0.8));

      float diffuse1 = max(dot(normal, lightDir1), 0.0);
      float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.3;

      // Specular highlights
      float specular1 = pow(max(dot(reflect(-lightDir1, normal), viewDir), 0.0), 64.0);
      float specular2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 32.0);

      // Ambient occlusion approximation
      float ao = 0.6 + 0.4 * normal.y;

      // Build the final color
      vec3 color = baseColor * ao * 1.2;

      // Add diffuse lighting
      color += midColor * (diffuse1 * 0.5 + diffuse2);

      // Rim lighting - the key visual element
      color += rimColor * fres * 0.7;
      color += rimColor * pow(fres, 5.0) * 0.4;

      // Specular highlights
      color += highlightColor * specular1 * 0.6;
      color += highlightColor * specular2 * 0.2;

      // Subsurface scattering approximation
      float sss = pow(max(dot(viewDir, -lightDir1), 0.0), 3.0);
      color += vec3(0.15, 0.12, 0.18) * sss * (1.0 - fres) * 0.3;

      // Depth fade for atmospheric perspective
      float depth = 1.0 - smoothstep(2.0, 4.0, t);
      color *= depth;

      // Smooth edge transition
      float edge = smoothstep(0.0, 0.15, 1.0 - fres * 0.5);
      color = mix(bg, color, edge);

      // Subtle vignette on the blob itself
      color *= 0.9 + 0.1 * (1.0 - fres);

      gl_FragColor = vec4(color, 1.0);
    } else {
      gl_FragColor = vec4(bg, 1.0);
    }
  }
`;

function MetaballScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseInfluence: { value: 0.5 },
    }),
    [size.width, size.height]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Smooth mouse following
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;

      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface MetaballsProps {
  className?: string;
}

export function Metaballs({ className }: MetaballsProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <MetaballScene />
      </Canvas>
    </div>
  );
}
