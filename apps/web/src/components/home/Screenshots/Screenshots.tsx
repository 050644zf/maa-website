import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Mesh, TextureLoader, Vector2 } from 'three';
import screenshotCenter from '../../../assets/screenshots/center.webp?url';
import screenshotLeft from '../../../assets/screenshots/left.webp?url';
import screenshotRight from '../../../assets/screenshots/right.webp?url';

function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t;
}

function absInRange(num: number, center: number, delta: number) {
  const abs = Math.abs(num);
  return abs >= center - delta && abs <= center + delta;
}

const sidePanelRotationOffset = 0.15;

export function Screenshots() {
  const lerpTo = useRef<Vector2>(new Vector2(0, 0));
  const textureCenter = useLoader(TextureLoader, screenshotCenter);
  const textureLeft = useLoader(TextureLoader, screenshotLeft);
  const textureRight = useLoader(TextureLoader, screenshotRight);

  const imageAspects = {
    left: 1010 / 768,
    center: 786 / 588,
    right: 1010 / 768,
  };
  const meshCenterRef = useRef<Mesh | null>(null);
  const meshLeftRef = useRef<Mesh | null>(null);
  const meshRightRef = useRef<Mesh | null>(null);

  useFrame(() => {
    if (
      meshCenterRef.current &&
      absInRange(meshCenterRef.current.rotation.x, 0, 0.01) &&
      absInRange(meshCenterRef.current.rotation.y, 0, 0.01) &&
      meshLeftRef.current &&
      absInRange(meshLeftRef.current.rotation.x, 0, 0.01) &&
      absInRange(
        meshLeftRef.current.rotation.y,
        sidePanelRotationOffset,
        0.01
      ) &&
      meshRightRef.current &&
      absInRange(meshRightRef.current.rotation.x, 0, 0.01) &&
      absInRange(
        meshRightRef.current.rotation.y,
        -sidePanelRotationOffset,
        0.01
      )
    ) {
      return;
    }

    if (meshCenterRef.current && meshLeftRef.current && meshRightRef.current) {
      const lerpT = 0.25;
      meshCenterRef.current.rotation.x = lerp(
        meshCenterRef.current.rotation.x,
        0 + lerpTo.current.x * 0.1,
        lerpT
      );
      meshCenterRef.current.rotation.y = lerp(
        meshCenterRef.current.rotation.y,
        0 + lerpTo.current.y * 0.1,
        lerpT
      );
      meshLeftRef.current.rotation.x = lerp(
        meshLeftRef.current.rotation.x,
        0 + lerpTo.current.x * 0.1,
        lerpT
      );
      meshLeftRef.current.rotation.y = lerp(
        meshLeftRef.current.rotation.y,
        sidePanelRotationOffset + lerpTo.current.y * 0.1,
        lerpT
      );
      meshRightRef.current.rotation.x = lerp(
        meshRightRef.current.rotation.x,
        0 + lerpTo.current.x * 0.1,
        lerpT
      );
      meshRightRef.current.rotation.y = lerp(
        meshRightRef.current.rotation.y,
        -sidePanelRotationOffset + lerpTo.current.y * 0.1,
        lerpT
      );
    }
  });

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (
        meshCenterRef.current &&
        meshLeftRef.current &&
        meshRightRef.current
      ) {
        const { clientX, clientY } = e instanceof MouseEvent ? e : e.touches[0];
        const x = (clientX / window.innerWidth) * 2 - 1;
        const y = (clientY / window.innerHeight) * 2 - 1;

        lerpTo.current.set(y, x); // inverted intentionally
      }
    };

    const onEnd = () => {
      if (
        meshCenterRef.current &&
        meshLeftRef.current &&
        meshRightRef.current
      ) {
        // lerp back to 0
        lerpTo.current.set(0, 0);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseleave', onEnd);
    document.addEventListener('touchend', onEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseleave', onEnd);
      document.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <>
      <mesh
        ref={meshRightRef}
        position={[3, 0, -0.5]}
        rotation={[0, -sidePanelRotationOffset, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3 * imageAspects.right, 3, 0]} />
        <meshPhysicalMaterial transparent map={textureRight} />
      </mesh>
      <mesh
        ref={meshLeftRef}
        position={[-3, 0, -0.5]}
        rotation={[0, sidePanelRotationOffset, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3 * imageAspects.left, 3, 0]} />
        <meshPhysicalMaterial transparent map={textureLeft} />
      </mesh>
      <mesh ref={meshCenterRef} position={[0, 0, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[3 * imageAspects.center, 3, 0]} />
        <meshPhysicalMaterial transparent map={textureCenter} />
      </mesh>
    </>
  );
}
