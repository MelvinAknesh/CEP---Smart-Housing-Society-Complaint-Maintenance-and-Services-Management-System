import React, { useMemo } from 'react';
import { motion, useTransform, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Home, MessageSquare, Wrench, Building2, AlertCircle } from 'lucide-react';

const NUM_POINTS = 600;
const ICONS = [Home, MessageSquare, Wrench, Building2, AlertCircle];

export default function DottedGlobe({ scrollYProgress }) {
  // Generate points using Fibonacci sphere algorithm
  const points = useMemo(() => {
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const radius = 380; // 3D radius in pixels

    for (let i = 0; i < NUM_POINTS; i++) {
      const y = 1 - (i / (NUM_POINTS - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      const IconComp = ICONS[Math.floor(Math.random() * ICONS.length)];

      // Store true 3D coordinates
      pts.push({ x: x * radius, y: y * radius, z: z * radius, IconComp });
    }
    return pts;
  }, []);

  const scale = useTransform(scrollYProgress, [0, 1], [1, 3.5]); // Explosion effect
  
  // Custom manual rotation linked to scroll depth
  const rotateY = useMotionValue(0);
  
  useAnimationFrame(() => {
    // scrollYProgress is 0 at the top, 1 at the bottom
    const progress = scrollYProgress.get();
    
    // When progress = 0 (small globe), speed = 0.8 (moderate)
    // When progress = 1 (zoomed in), speed = 0.1 (very slow)
    const currentSpeed = 0.1 + (1 - progress) * 0.7;
    
    rotateY.set(rotateY.get() + currentSpeed);
  });

  return (
    <div className="dotted-globe-wrapper" style={{ opacity: 0.35 }}>
      <motion.div style={{ scale, width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
        <motion.div
          className="dotted-globe-container"
          style={{ rotateY, rotateX: 15, transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
        >
          {points.map((p, i) => {
            const { IconComp } = p;
            return (
              <div
                key={i}
                className="globe-dot"
                style={{
                  left: '50%',
                  top: '50%',
                  // True 3D positioning!
                  transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                }}
              >
                <IconComp size={10} strokeWidth={1.5} />
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}