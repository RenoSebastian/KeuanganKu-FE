import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  // SVG Configuration
  const radius = 80; // Diperbesar sedikit agar lebih jelas
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Kita hanya pakai separuh lingkaran (180 derajat / setengah keliling)
  const halfCircumference = circumference / 2;
  const strokeDasharray = `${circumference} ${circumference}`;
  
  // Offset awal agar mulai dari kosong (sebelah kiri)
  // Logic: Offset penuh (circumference) = kosong. 
  // Kita ingin range 0 (kiri) s.d 100 (kanan) dalam bentuk setengah lingkaran.
  // Rumus: circumference - (score / 100) * halfCircumference
  const strokeDashoffset = circumference - (score / 100) * halfCircumference;

  // Tentukan warna solid fallback jika gradient bermasalah atau untuk stroke
  const getColor = (s: number) => {
    if (s >= 80) return "#10b981"; // Emerald-500
    if (s >= 50) return "#f59e0b"; // Amber-500
    return "#ef4444"; // Red-500
  };

  return (
    <div className="relative flex flex-col items-center justify-end w-48 h-28 overflow-hidden">
      {/* SVG Container - Rotasi -90deg + 180deg flip logic adjustment */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className="absolute top-0 transform rotate-[180deg]" // Memutar agar "bukaannya" di bawah, lalu kita potong via container overflow
        style={{ overflow: "visible" }}
      >
        {/* Definisi Warna Gradasi */}
        <defs>
          <linearGradient id="gaugeGradient" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />   {/* Merah (Kiri) */}
            <stop offset="50%" stopColor="#f59e0b" />  {/* Kuning (Tengah) */}
            <stop offset="100%" stopColor="#10b981" /> {/* Hijau (Kanan) */}
          </linearGradient>
        </defs>

        {/* Background Track (Abu-abu Pudar) */}
        <circle
          stroke="#f1f5f9"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ strokeDasharray, strokeDashoffset: 0 }} 
          strokeLinecap="round"
        />
        
        {/* Progress Bar (Isian) */}
        <circle
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
          style={{ 
            strokeDasharray, 
            strokeDashoffset,
            transition: "stroke-dashoffset 1.5s ease-out"
          }}
        />
      </svg>
      
      {/* Label Text (Centered in the semi-circle) */}
      <div className="relative z-10 flex flex-col items-center justify-center -mt-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Health Score
        </span>
        <span className={cn(
          "text-4xl font-black tracking-tighter",
          score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-500" : "text-red-500"
        )}>
          {score}
        </span>
        
        <div className={cn(
          "mt-2 px-2 py-0.5 rounded text-[10px] font-bold border",
          score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
          score >= 50 ? "bg-amber-50 text-amber-700 border-amber-100" : 
          "bg-red-50 text-red-700 border-red-100"
        )}>
          {score >= 80 ? "SEHAT" : score >= 50 ? "WASPADA" : "BAHAYA"}
        </div>
      </div>
    </div>
  );
}