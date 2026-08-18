import React from 'react';
import { motion } from 'motion/react';

export default function NetworkGraphic() {
  // Animation variants for Framer Motion
  const nodeVariants = {
    animate: {
      y: [0, -15, 0],
      rotateX: [0, 5, 0],
      rotateZ: [0, 2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const lineVariants = {
    animate: {
      opacity: [0.8, 0.3, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
      <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-150 translate-x-12 -translate-y-12">
        {/* Connection Lines */}
        <motion.g 
          stroke="#DDE1E7" 
          strokeWidth="1"
          variants={lineVariants}
          animate="animate"
        >
          <path d="M300 200 L400 250 L400 350 L300 400 L200 350 L200 250 Z" />
          <path d="M300 200 L300 300 L400 250" />
          <path d="M300 300 L200 250" />
          <path d="M300 300 L300 400" />
          <path d="M400 350 L500 300 L500 200 L400 150 L300 200" />
          <path d="M400 250 L500 200" />
          <path d="M200 350 L100 300 L100 200 L200 150 L300 200" />
          <path d="M200 250 L100 200" />
        </motion.g>
        
        {/* Isometric Nodes */}
        <g fill="#FFFFFF" stroke="#DDE1E7" strokeWidth="1.5">
          {/* Center Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            style={{ originX: "300px", originY: "300px" }}
            transform="translate(300, 300)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>

          {/* Top Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            transition={{ delay: 0.4 }}
            style={{ originX: "300px", originY: "150px" }}
            transform="translate(300, 150)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>

          {/* Bottom Right Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            transition={{ delay: 0.8 }}
            style={{ originX: "420px", originY: "320px" }}
            transform="translate(420, 320)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>

          {/* Bottom Left Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            transition={{ delay: 1.2 }}
            style={{ originX: "180px", originY: "320px" }}
            transform="translate(180, 320)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>

          {/* Top Right Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            transition={{ delay: 1.6 }}
            style={{ originX: "420px", originY: "180px" }}
            transform="translate(420, 180)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>
          
          {/* Top Left Node */}
          <motion.g 
            variants={nodeVariants}
            animate="animate"
            transition={{ delay: 2.0 }}
            style={{ originX: "180px", originY: "180px" }}
            transform="translate(180, 180)"
          >
            <path d="M0 -20 L34.64 -10 L0 10 L-34.64 -10 Z" fill="#F5F5F2" />
            <path d="M0 10 L34.64 -10 L34.64 30 L0 50 Z" fill="#FFFFFF" />
            <path d="M0 10 L-34.64 -10 L-34.64 30 L0 50 Z" fill="#E6E8EC" />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
