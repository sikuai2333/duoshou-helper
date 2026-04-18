export function getFadeUpMotion(reduced: boolean) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.12 : 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };
}

export function getSheetMotion(reduced: boolean) {
  return {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: reduced ? 0.1 : 0.18, ease: "easeOut" as const },
    },
    panel: {
      initial: { opacity: 0, y: reduced ? 0 : 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduced ? 0 : 16 },
      transition: {
        duration: reduced ? 0.12 : 0.22,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };
}
