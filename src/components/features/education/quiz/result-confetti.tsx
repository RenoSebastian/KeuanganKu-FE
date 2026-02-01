'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ResultConfettiProps {
    show: boolean;
}

export function ResultConfetti({ show }: ResultConfettiProps) {
    useEffect(() => {
        if (show) {
            // Efek ledakan confetti dari tengah bawah
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22c55e', '#16a34a'] // Green theme
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#22c55e', '#16a34a']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [show]);

    return null; // Komponen ini tidak me-render DOM elements, hanya side-effect visual
}