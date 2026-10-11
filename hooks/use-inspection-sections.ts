"use client";
import { useRef, useState } from "react";

type Section = "overview" | "specifications" | "reviews";

export function useInspectionSections() {
  const scroll = useRef<HTMLDivElement>(null);
  const overview = useRef<HTMLElement>(null);
  const specifications = useRef<HTMLElement>(null);
  const reviews = useRef<HTMLElement>(null);
  const sections = { overview, specifications, reviews };
  const [active, setActive] = useState<Section>("overview");

  const updateActive = () => {
    if (!scroll.current) return;
    const top = scroll.current.getBoundingClientRect().top + 32;
    let current: Section = "overview";
    for (const name of ["overview", "specifications", "reviews"] as const) {
      const element = sections[name].current;
      if (element && element.getBoundingClientRect().top <= top) current = name;
    }
    setActive(current);
  };

  const show = (name: Section) => {
    const container = scroll.current;
    const section = sections[name].current;
    if (!container || !section) return;
    const top =
      container.scrollTop +
      section.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      24;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    container.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
  };

  return {
    scrollRef: scroll,
    overviewRef: overview,
    specificationsRef: specifications,
    reviewsRef: reviews,
    active,
    show,
    updateActive,
  };
}
