"use client";

import { useEffect } from "react";
import { appRepository } from "@/db/repositories/app-repository";
import { useAppStore } from "@/stores/app-store";

export function useAppBootstrap() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);

  useEffect(() => {
    void appRepository.initializeApp(currentMonthKey);
  }, [currentMonthKey]);
}
