"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
};

export default function LiveCounter({
  target,
  duration = 1800,
  className,
  prefix,
  suffix,
  format = (n) => n.toLocaleString("ja-JP"),
}: Props) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const start = (now: number) => {
      const begin = now;
      const tick = (t: number) => {
        const progress = Math.min((t - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      if (!startedRef.current) {
        startedRef.current = true;
        start(performance.now());
      }
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            start(performance.now());
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <span
      ref={ref}
      className={className}
      aria-label={`${prefix ?? ""}${target.toLocaleString("ja-JP")}${suffix ?? ""}`}
    >
      {prefix}
      {format(value)}
      {suffix}
    </span>
  );
}
