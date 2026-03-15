import { useEffect, useState } from "react";

type RouteLoadingProps = {
  pathname: string;
};

export const RouteLoading = ({ pathname }: RouteLoadingProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 650);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f1433] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ffcc00] border-r-[#ffcc00] animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-[#ffcc00] border-l-[#ffcc00] animate-spin [animation-duration:1.2s]" />
        </div>
        <div className="text-xs uppercase tracking-[0.35em] text-white/70">Loading</div>
      </div>
    </div>
  );
};
