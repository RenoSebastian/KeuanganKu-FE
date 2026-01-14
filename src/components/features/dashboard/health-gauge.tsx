import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  // SVG Configuration
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Kita hanya pakai separuh lingkaran (180 derajat)
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * (circumference / 2); // Bagi 2 karena setengah lingkaran

  return (
    <div className="relative flex flex-col items-center justify-center w-28 h-16 overflow-hidden">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-[180deg] absolute -top-9" // Putar biar mulai dari kiri
      >
        {/* Background Track (Abu-abu) */}
        <circle
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ strokeDasharray, strokeDashoffset: 0 }} // Full half circle
        />
        {/* Progress Bar (Gradient Color) */}
        <circle
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ 
            strokeDasharray, 
            strokeDashoffset: circumference - (score / 100) * (circumference / 2) + (circumference / 2) // Logic fix for half circle
          }}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Definisi Warna Gradasi */}
        <defs>
          <linearGradient id="gaugeGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />   {/* Merah */}
            <stop offset="50%" stopColor="#eab308" />  {/* Kuning */}
            <stop offset="100%" stopColor="#22c55e" /> {/* Hijau */}
          </linearGradient>
        </defs>
      </svg>
      
      {/* Label Text */}
      <div className="absolute top-6 flex flex-col items-center z-10">
        <span className="text-[10px] font-medium text-slate-500">Skor Keuangan</span>
        <span className="text-2xl font-extrabold text-slate-800">{score}</span>
      </div>
    </div>
  );
}