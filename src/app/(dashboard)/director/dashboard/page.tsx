import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { directorService } from "@/services/director.service";
import DashboardView from "@/components/features/director/dashboard-view"; // Import View Component (Client)

// Helper untuk decode token secara sederhana di server (tanpa library berat)
// Hanya untuk cek role dasar sebelum fetch data
function getUserRoleFromToken(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role;
  } catch (e) {
    return null;
  }
}

// Server Component (Async)
export default async function DirectorDashboardPage() {
  // 1. Ambil Token dari Cookie (Server Side)
  const cookieStore = await cookies(); // Gunakan 'await' karena cookies() di Next.js 15+ bersifat async
  const token = cookieStore.get("token")?.value || cookieStore.get("accessToken")?.value;

  // 2. Auth Check: Jika tidak ada token -> Redirect Login
  if (!token) {
    redirect("/login");
  }

  // 3. Role Check: (Optional Double Check)
  // Middleware sebenarnya sudah menangani ini, tapi good practice untuk double safety
  // const role = getUserRoleFromToken(token);
  // if (role !== 'DIRECTOR') redirect("/");

  try {
    // 4. Data Fetching (Server Side - Blocking)
    // Ini berjalan di Node.js server, sangat cepat (Low Latency ke Database/API Internal)
    const dashboardData = await directorService.getDashboardSummary(token);

    // 5. Render View Component (Client) dengan Data Awal
    return (
      <DashboardView initialData={dashboardData} />
    );

  } catch (error) {
    console.error("Failed to load director dashboard:", error);
    
    // Fallback Error Handling
    // Bisa redirect ke halaman error khusus atau login jika token expired
    redirect("/login?error=session_expired");
  }
}