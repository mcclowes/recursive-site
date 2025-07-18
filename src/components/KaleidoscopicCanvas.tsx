'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface CodeElement {
  id: string;
  type: 'function' | 'class' | 'variable' | 'import' | 'comment';
  name: string;
  line: number;
  complexity: number;
  content: string;
}

interface KaleidoscopicCanvasProps {
  code: string;
  language: string;
  analysis: {
    score: number;
    suggestions: Array<{
      type: string;
      message: string;
      line: number;
      source?: string;
      category?: string;
      explanation?: string;
      confidence?: number;
      id?: string;
    }>;
    metrics: {
      lines: number;
      characters: number;
      complexity: number;
      maintainability: string;
      aiAnalysisAvailable?: boolean;
      aiError?: string;
    };
  } | null;
  isEnabled: boolean;
  onElementSelect: (element: CodeElement) => void;
}

export default function KaleidoscopicCanvas({
  code,
  analysis,
  isEnabled,
  onElementSelect,
}: KaleidoscopicCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gemsRef = useRef<THREE.Mesh[]>([]);
  const frameRef = useRef<number | null>(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<CodeElement | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Extract code elements from the provided code
  const extractCodeElements = useCallback((code: string): CodeElement[] => {
    const elements: CodeElement[] = [];
    const lines = code.split('\n');
    let elementId = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Extract functions
      const functionMatch = trimmedLine.match(/(?:function\s+(\w+)|(\w+)\s*(?:=\s*)?(?:async\s+)?(?:\([^)]*\)\s*)?=>|(\w+)\s*\([^)]*\)\s*\{)/);
      if (functionMatch) {
        const name = functionMatch[1] || functionMatch[2] || functionMatch[3];
        if (name) {
          elements.push({
            id: `element-${elementId++}`,
            type: 'function',
            name,
            line: index + 1,
            complexity: Math.min(trimmedLine.length / 10, 10),
            content: trimmedLine,
          });
        }
      }

      // Extract classes
      const classMatch = trimmedLine.match(/class\s+(\w+)/);
      if (classMatch) {
        elements.push({
          id: `element-${elementId++}`,
          type: 'class',
          name: classMatch[1],
          line: index + 1,
          complexity: Math.min(trimmedLine.length / 8, 10),
          content: trimmedLine,
        });
      }

      // Extract variables
      const varMatch = trimmedLine.match(/(?:const|let|var)\s+(\w+)/);
      if (varMatch) {
        elements.push({
          id: `element-${elementId++}`,
          type: 'variable',
          name: varMatch[1],
          line: index + 1,
          complexity: Math.min(trimmedLine.length / 15, 10),
          content: trimmedLine,
        });
      }

      // Extract imports
      const importMatch = trimmedLine.match(/import.*from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        elements.push({
          id: `element-${elementId++}`,
          type: 'import',
          name: importMatch[1],
          line: index + 1,
          complexity: 2,
          content: trimmedLine,
        });
      }

      // Extract comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        elements.push({
          id: `element-${elementId++}`,
          type: 'comment',
          name: 'Comment',
          line: index + 1,
          complexity: 1,
          content: trimmedLine,
        });
      }
    });

    return elements;
  }, []);

  // Create a gem for each code element
  const createCodeGem = useCallback((element: CodeElement, position: THREE.Vector3): THREE.Mesh => {
    // Different geometries for different code element types
    let geometry: THREE.BufferGeometry;
    
    switch (element.type) {
      case 'function':
        geometry = new THREE.SphereGeometry(0.5 + element.complexity * 0.1, 32, 32);
        break;
      case 'class':
        geometry = new THREE.BoxGeometry(1 + element.complexity * 0.1, 1 + element.complexity * 0.1, 1 + element.complexity * 0.1);
        break;
      case 'variable':
        geometry = new THREE.ConeGeometry(0.3 + element.complexity * 0.05, 1 + element.complexity * 0.1, 8);
        break;
      case 'import':
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 6);
        break;
      case 'comment':
        geometry = new THREE.TetrahedronGeometry(0.4);
        break;
      default:
        geometry = new THREE.SphereGeometry(0.3, 16, 16);
    }

    // Color based on code quality and type
    const qualityScore = analysis?.score || 50;
    const color = new THREE.Color();
    
    if (element.type === 'function') {
      color.setHSL(0.6, 0.8, 0.5 + qualityScore / 200); // Blue tones
    } else if (element.type === 'class') {
      color.setHSL(0.3, 0.8, 0.5 + qualityScore / 200); // Green tones
    } else if (element.type === 'variable') {
      color.setHSL(0.1, 0.8, 0.5 + qualityScore / 200); // Yellow tones
    } else if (element.type === 'import') {
      color.setHSL(0.8, 0.8, 0.5 + qualityScore / 200); // Purple tones
    } else {
      color.setHSL(0, 0, 0.5 + qualityScore / 200); // Gray tones
    }

    const material = new THREE.MeshPhongMaterial({
      color,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });

    const gem = new THREE.Mesh(geometry, material);
    gem.position.copy(position);
    gem.userData = { element };

    // Add subtle animation
    gem.userData.originalPosition = position.clone();
    gem.userData.animationOffset = Math.random() * Math.PI * 2;

    return gem;
  }, [analysis]);

  // Initialize the 3D scene
  const initializeScene = useCallback(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    // Renderer with XR support
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add sparkle effects
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparklePositions = [];
    for (let i = 0; i < 1000; i++) {
      sparklePositions.push(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
    }
    sparkleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparklePositions, 3));
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Check for WebXR support
    if ('xr' in navigator) {
      // @ts-expect-error - WebXR is not fully typed in TypeScript yet
      navigator.xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      });
    }

    return { scene, renderer, camera };
  }, []);

  // Create gems from code elements
  const createCodeGems = useCallback((elements: CodeElement[]) => {
    if (!sceneRef.current) return;

    // Clear existing gems
    gemsRef.current.forEach(gem => {
      sceneRef.current?.remove(gem);
    });
    gemsRef.current = [];

    // Arrange gems in a spiral pattern
    elements.forEach((element, index) => {
      const angle = (index / elements.length) * Math.PI * 4;
      const radius = 3 + Math.sin(index * 0.5) * 2;
      const height = Math.cos(index * 0.3) * 2;

      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      const gem = createCodeGem(element, position);
      if (sceneRef.current) {
        sceneRef.current.add(gem);
        gemsRef.current.push(gem);
      }
    });
  }, [createCodeGem]);

  // Handle gem interaction
  const onGemClick = useCallback((event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(gemsRef.current);
    if (intersects.length > 0) {
      const element = intersects[0].object.userData.element;
      setSelectedElement(element);
      onElementSelect(element);

      // Provide voice feedback
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Selected ${element.type} ${element.name} at line ${element.line}`
        );
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }

      // Highlight selected gem
      gemsRef.current.forEach(gem => {
        const material = gem.material as THREE.MeshPhongMaterial;
        material.emissive.setHex(gem.userData.element.id === element.id ? 0x444444 : 0x000000);
      });
    }
  }, [onElementSelect, voiceEnabled]);

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    // Animate gems
    const time = Date.now() * 0.001;
    gemsRef.current.forEach(gem => {
      if (gem.userData.originalPosition && gem.userData.animationOffset) {
        gem.position.y = gem.userData.originalPosition.y + Math.sin(time + gem.userData.animationOffset) * 0.2;
        gem.rotation.y += 0.01;
      }
    });

    // Rotate camera around the scene
    if (!isVRActive) {
      const radius = 10;
      cameraRef.current.position.x = Math.cos(time * 0.1) * radius;
      cameraRef.current.position.z = Math.sin(time * 0.1) * radius;
      cameraRef.current.lookAt(0, 0, 0);
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [isVRActive]);

  // Initialize voice synthesis
  const initializeVoice = useCallback(() => {
    if ('speechSynthesis' in window) {
      setVoiceEnabled(true);
      const utterance = new SpeechSynthesisUtterance(
        'Kaleidoscopic Wisdom activated. Your code has been transformed into a visual symphony of gems.'
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Setup VR session
  const enterVR = useCallback(async () => {
    if (!rendererRef.current || !isVRSupported) return;

    try {
      // @ts-expect-error - WebXR is not fully typed in TypeScript yet
      const session = await navigator.xr.requestSession('immersive-vr');
      await rendererRef.current.xr.setSession(session);
      setIsVRActive(true);
    } catch (error) {
      console.error('Failed to enter VR mode:', error);
    }
  }, [isVRSupported]);

  useEffect(() => {
    if (!isEnabled) return;
    
    const currentMount = mountRef.current;
    if (!currentMount) return;

    initializeScene();
    initializeVoice();

    const elements = extractCodeElements(code);
    createCodeGems(elements);

    animate();

    // Add click handler
    const handleClick = onGemClick;
    currentMount.addEventListener('click', handleClick);

    // Handle window resize
    const handleResize = () => {
      if (!currentMount || !rendererRef.current || !cameraRef.current) return;

      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (currentMount) {
        currentMount.removeEventListener('click', handleClick);
      }
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isEnabled, code, extractCodeElements, createCodeGems, animate, onGemClick, initializeScene, initializeVoice]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full min-h-[500px] rounded-lg overflow-hidden" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">💎</span>
          Kaleidoscopic Wisdom
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            Functions ({gemsRef.current.filter(g => g.userData.element?.type === 'function').length})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Classes ({gemsRef.current.filter(g => g.userData.element?.type === 'class').length})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Variables ({gemsRef.current.filter(g => g.userData.element?.type === 'variable').length})
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            Imports ({gemsRef.current.filter(g => g.userData.element?.type === 'import').length})
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`w-full px-3 py-2 rounded text-sm ${
              voiceEnabled 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
          </button>
          
          {isVRSupported && (
            <button
              onClick={enterVR}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              🥽 Enter VR
            </button>
          )}
        </div>
      </div>

      {/* Selected Element Info */}
      {selectedElement && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm max-w-sm">
          <h4 className="font-semibold mb-2">Selected Element</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Type:</strong> {selectedElement.type}</div>
            <div><strong>Name:</strong> {selectedElement.name}</div>
            <div><strong>Line:</strong> {selectedElement.line}</div>
            <div><strong>Complexity:</strong> {selectedElement.complexity.toFixed(1)}</div>
            <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono">
              {selectedElement.content}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs">
        <h4 className="font-semibold mb-2">Instructions</h4>
        <ul className="text-sm space-y-1">
          <li>• Click gems to explore code elements</li>
          <li>• Different shapes represent different code types</li>
          <li>• Gem size indicates complexity</li>
          <li>• Colors reflect code quality</li>
          <li>• Enable voice for audio feedback</li>
          {isVRSupported && <li>• Use VR mode for immersive experience</li>}
        </ul>
      </div>
    </div>
  );
}