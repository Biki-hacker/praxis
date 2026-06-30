import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const Globe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x2d5be3, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const softLight = new THREE.DirectionalLight(0xffffff, 0.6);
    softLight.position.set(-5, -2, -2);
    scene.add(softLight);

    // 4. Globe Base Sphere
    const globeGeometry = new THREE.SphereGeometry(2, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2d5be3,
      transparent: true,
      opacity: 0.12,
      wireframe: false,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Wireframe Sphere Overlay
    const wireGeometry = new THREE.SphereGeometry(2.01, 24, 24);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x2d5be3,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireOverlay = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wireOverlay);

    // 5. Generate Civic Pin Points
    const pinsGroup = new THREE.Group();
    const pinColors = [0xe8720c, 0x2d5be3, 0x1a7a4a, 0xc1272d]; // orange, blue, green, red
    const pinGeometry = new THREE.SphereGeometry(0.05, 8, 8);

    // Scatter 40 pins randomly on sphere surface
    for (let i = 0; i < 40; i++) {
      const pinMaterial = new THREE.MeshPhongMaterial({
        color: pinColors[Math.floor(Math.random() * pinColors.length)],
        emissive: 0x111111,
        shininess: 30,
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);

      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();

      const r = 2.01;
      pin.position.x = r * Math.sin(phi) * Math.cos(theta);
      pin.position.y = r * Math.sin(phi) * Math.sin(theta);
      pin.position.z = r * Math.cos(phi);

      pinsGroup.add(pin);
    }
    scene.add(pinsGroup);

    // 6. Animation Loop
    let animationFrameId: number;
    let rotationSpeed = 0.003;

    const handleMouseEnter = () => {
      rotationSpeed = 0.008;
    };

    const handleMouseLeave = () => {
      rotationSpeed = 0.003;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate group on Y and X axis
      globe.rotation.y += rotationSpeed;
      wireOverlay.rotation.y += rotationSpeed;
      pinsGroup.rotation.y += rotationSpeed;

      globe.rotation.x = 0.1;
      wireOverlay.rotation.x = 0.1;
      pinsGroup.rotation.x = 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      
      const w = newWidth || width;
      const h = newHeight || height;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    
    resizeObserver.observe(container);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      globeGeometry.dispose();
      globeMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      pinGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] md:min-h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing"
    />
  );
};
