export function getFadeUpMotion(reduced: boolean) {
  return {
    initial: { opacity: 0, y: reduced ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0.16 : 0.32,
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
      transition: { duration: reduced ? 0.12 : 0.22, ease: "easeOut" as const },
    },
    panel: {
      initial: { opacity: 0, y: reduced ? 0 : 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduced ? 0 : 28 },
      transition: {
        duration: reduced ? 0.16 : 0.28,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };
}
