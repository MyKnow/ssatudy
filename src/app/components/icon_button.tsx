"use client";

import { motion } from "framer-motion";

interface IconButtonProps {
  label: string;
  onClick: () => void;
  selected?: boolean;
}

export default function IconButton({ label, onClick, selected = false }: IconButtonProps) {
  return (
    <div className="icon-button-wrapper">
      <motion.button
        type="button"
        className={`icon-button ${selected ? "selected" : ""}`}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
      >
        {label}
      </motion.button>
    </div>
  );
}