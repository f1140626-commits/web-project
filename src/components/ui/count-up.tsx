"use client"

import ReactCountUp from "react-countup";
import { useEffect, useState } from "react";

export function CountUp({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>{prefix}{end.toLocaleString()}{suffix}</span>;
  }

  return (
    <ReactCountUp
      end={end}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      duration={duration}
      separator=","
    />
  );
}
