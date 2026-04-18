import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleBurst = ({ active, onComplete }) => {
  const pointsRef = useRef();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const p = [];
      for (let i = 0; i < 50; i++) {
        p.push({
          position: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
          ).normalize().multiplyScalar(Math.random() * 0.1 + 0.05),
          life: 1.0,
        });
      }
      setParticles(p);
      setTimeout(onComplete, 1000); // Burst duration
    }
  }, [active, onComplete]);

  useFrame((state, delta) => {
    if (active && pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      particles.forEach((p, i) => {
        p.position.add(p.velocity);
        p.life -= delta;
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
      });
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active || particles.length === 0) return null;

  const posArray = new Float32Array(particles.length * 3);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={posArray}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.05} transparent opacity={0.8} />
    </points>
  );
};

export default function CreditOrb({ credits, newCredits = false }) {
  const orbRef = useRef();
  const [bursting, setBursting] = useState(false);

  useEffect(() => {
    if (newCredits) {
      setBursting(true);
    }
  }, [newCredits]);

  // Color shift from Green to Gold based on credits amount
  // Let's assume max color shift at 1000 credits
  const shiftRatio = Math.min(credits / 1000, 1.0);
  const color = new THREE.Color('#00FF88').lerp(new THREE.Color('#FFD700'), shiftRatio);

  useFrame((state, delta) => {
    if (orbRef.current) {
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      orbRef.current.scale.set(scale, scale, scale);
      orbRef.current.rotation.x += delta * 0.2;
      orbRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      <Sphere ref={orbRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          distort={0.3} 
          speed={2} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Holographic Text Overlay */}
      <Text
        position={[0, 0, 1.6]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {credits.toFixed(1)}
      </Text>

      <ParticleBurst active={bursting} onComplete={() => setBursting(false)} />
    </group>
  );
}
