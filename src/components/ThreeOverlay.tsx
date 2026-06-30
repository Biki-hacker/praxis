import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Issue } from '../types';

interface ThreeOverlayProps {
  issues: Issue[];
}

export const ThreeOverlay: React.FC<ThreeOverlayProps> = ({ issues }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    // Ambient fog
    scene.background = new THREE.Color(0xf8f6f1);
    scene.fog = new THREE.FogExp2(0xf8f6f1, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 5, 8);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 4. Ground Grid
    const size = 10;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x2d5be3, 0xc8c2ba);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(size, size);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0xf0ede6,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    // 5. Render Extruded Cylinder for each Issue
    const cylindersGroup = new THREE.Group();
    
    // Salt Lake coordinates center roughly: lat: 22.57264, lng: 88.43363
    const centerLat = 22.57264;
    const centerLng = 88.43363;
    const scale = 300; // Map lat/lng differences into grid units

    const catColors: any = {
      Pothole: 0xf5c518,
      Water: 0x3aabdb,
      Light: 0xf59e0b,
      Waste: 0x65a30d,
      Infrastructure: 0x8b5cf6,
      Other: 0x6b7280
    };

    const severityHeights: any = {
      Low: 0.4,
      Medium: 0.8,
      High: 1.4,
      Critical: 2.2
    };

    issues.forEach((issue) => {
      const color = catColors[issue.category] || 0x6b7280;
      const heightVal = severityHeights[issue.severity] || 0.8;

      // Map latitude and longitude relative to center
      const dx = (issue.lng - centerLng) * scale;
      const dz = -(issue.lat - centerLat) * scale; // invert Y axis for coordinates

      // Keep cylinders within grid boundary
      const x = Math.max(-4.5, Math.min(4.5, dx));
      const z = Math.max(-4.5, Math.min(4.5, dz));

      const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, heightVal, 16);
      const cylinderMat = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        shininess: 60,
        emissive: 0x111111,
      });

      const mesh = new THREE.Mesh(cylinderGeo, cylinderMat);
      // Position base on ground grid
      mesh.position.set(x, heightVal / 2, z);
      
      // Store some extra data for orbital scaling / animations
      mesh.userData = { originalHeight: heightVal, originalY: heightVal / 2 };
      
      cylindersGroup.add(mesh);

      // Add a small decorative pulse ring at the top of critical/high issues
      if (issue.severity === 'Critical' || issue.severity === 'High') {
        const ringGeo = new THREE.RingGeometry(0.18, 0.22, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, heightVal + 0.02, z);
        cylindersGroup.add(ring);
      }
    });

    scene.add(cylindersGroup);

    // 6. Camera Orbit controls (drag to rotate)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let theta = Math.PI / 4; // horizontal rotation angle
    let phi = Math.PI / 4;   // vertical rotation angle
    const radius = 9;

    const updateCameraPosition = () => {
      // Clamping phi to avoid flipping camera upsidedown
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));
      
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);
    };

    updateCameraPosition();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      theta -= deltaMove.x * 0.007;
      phi -= deltaMove.y * 0.007;

      updateCameraPosition();

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Auto-orbit slowly if user isn't dragging
    let animationFrameId: number;
    let autoRotationTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        autoRotationTimer += 0.002;
        theta += 0.0015;
        // Make cylinders breathe/pulse slightly
        cylindersGroup.children.forEach((mesh) => {
          if (mesh instanceof THREE.Mesh) {
            const pulse = 1 + 0.05 * Math.sin(autoRotationTimer * 4 + mesh.position.x);
            mesh.scale.set(1, pulse, 1);
            // shift position Y to align with scaled height
            mesh.position.y = (mesh.userData.originalHeight * pulse) / 2;
          }
        });
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      camera.aspect = (newWidth || width) / (newHeight || height);
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth || width, newHeight || height);
    });
    
    resizeObserver.observe(container);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gridHelper.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      cylindersGroup.children.forEach((mesh: any) => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: any) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [issues]);

  return (
    <div className="relative w-full h-full bg-bg-sunken rounded-xl overflow-hidden shadow-inner flex flex-col justify-between">
      {/* Three canvas container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing min-h-[400px]" />
      
      {/* Absolute Overlays */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-ink-primary/5 shadow-sm">
        <h4 className="text-xs font-bold text-ink-primary leading-tight">Civic Density Extrusions</h4>
        <p className="text-[10px] text-ink-secondary">Height = Severity • Color = Category</p>
      </div>

      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-ink-primary/5 shadow-sm flex flex-wrap gap-2 max-w-[280px]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f5c518]"></span>
          <span className="text-[10px] font-bold text-ink-secondary">Pothole</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3aabdb]"></span>
          <span className="text-[10px] font-bold text-ink-secondary">Water</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
          <span className="text-[10px] font-bold text-ink-secondary">Light</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#65a30d]"></span>
          <span className="text-[10px] font-bold text-ink-secondary">Waste</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
          <span className="text-[10px] font-bold text-ink-secondary">Infra</span>
        </div>
      </div>
    </div>
  );
};
