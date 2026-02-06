import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
    id: string;
    email: string;
    role: string;
    unitKerja?: string;
    iat: number;
    exp: number;
}

export function useAuthUser() {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 1. Ambil token dari LocalStorage (sesuai konfigurasi axios.ts)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            try {
                // 2. Decode Token untuk mendapatkan User ID
                const decoded = jwtDecode<UserPayload>(token);

                // 3. Cek Expiry (Optional Client-side Guard)
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    console.warn("Token expired in client-side check");
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                setUser(null);
            }
        } else {
            setUser(null);
        }

        setIsLoaded(true);
    }, []);

    return { user, isLoaded };
}