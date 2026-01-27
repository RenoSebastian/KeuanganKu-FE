import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number;
}

export function HealthGauge({ score }: HealthGaugeProps) {
  // --- KONFIGURASI VISUAL ---
  const radius = 85;
  const stroke = 14;
  // Radius aman agar stroke tidak terpotong (radius luar - stroke)
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Logic Lingkaran Penuh (360 derajat)
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // --- LOGIKA STATUS & WARNA ---
  let statusLabel = "BAHAYA";
  let statusColorClass = "text-rose-500 drop-shadow-sm";

  if (score >= 80) {
    statusLabel = "SEHAT";
    statusColorClass = "text-emerald-500 drop-shadow-sm";
  } else if (score >= 50) {
    statusLabel = "WASPADA";
    statusColorClass = "text-amber-500 drop-shadow-sm";
  }

  return (
    // Container dibuat W-Full H-Full agar mengikuti parent (Square)
    <div className="relative flex items-center justify-center w-full h-full group">

      {/* SVG Container - Rotasi -90deg agar progress mulai dari jam 12 (Atas) */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-700"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Gradient Premium: Merah (Awal) -> Kuning (Tengah) -> Hijau (Akhir) */}
          <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />   {/* Rose/Merah */}
            <stop offset="50%" stopColor="#f59e0b" />  {/* Amber/Kuning */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald/Hijau */}
          </linearGradient>

          {/* Efek Glow Halus pada Bar */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track Background (Lingkaran Penuh Abu-abu) */}
        <circle
          stroke="#f1f5f9"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Active Progress Bar (Lingkaran Penuh) */}
        <circle
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{
            strokeDasharray,
            strokeDashoffset,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" // Animasi smooth
          }}
        />
      </svg>

      {/* --- BAGIAN TENGAH (TEXT STATUS) --- */}
      {/* Absolute inset-0 memastikan teks benar-benar di tengah lingkaran */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">

        <h3 className={cn(
          "text-1xl md:text-2xl font-black tracking-wider uppercase transition-colors duration-500",
          statusColorClass
        )}>
          {statusLabel}
        </h3>
      </div>
    </div>
  );
}