export function getFadeUpMotion(reduced: boolean) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: reduced ? 0.1 : 0.16,
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
      transition: { duration: reduced ? 0.1 : 0.16, ease: "easeOut" as const },
    },
    panel: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: reduced ? 0.1 : 0.16,
        ease: "easeOut" as const,
      },
    },
  };
}
