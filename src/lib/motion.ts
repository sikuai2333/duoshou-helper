export function getFadeUpMotion() {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.16,
      ease: "easeOut" as const,
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
      initial: { opacity: 0, y: reduced ? 0 : 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: reduced ? 0 : 8 },
      transition: {
        duration: reduced ? 0.12 : 0.18,
        ease: "easeOut" as const,
      },
    },
  };
}
