import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { directorService } from "@/services/director.service";
import DashboardView from "@/components/features/director/dashboard-view"; 

// Server Component (Async)
export default async function DirectorDashboardPage() {
  // 1. Ambil Token dari Cookie (Server Side)
  // 'await' wajib digunakan untuk cookies() pada Next.js 15+
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value || cookieStore.get("accessToken")?.value;

  // 2. Auth Check: Jika tidak ada token -> Redirect Login
  if (!token) {
    redirect("/login");
  }

  try {
    // 3. Data Fetching (Server Side - Blocking)
    // Mengambil data summary dashboard dengan token server-side
    const dashboardData = await directorService.getDashboardSummary(token);

    // 4. Render View Component (Client) dengan Data Awal
    return (
      <DashboardView initialData={dashboardData} />
    );

  } catch (error: any) {
    console.error("[DirectorDashboard] Failed to load data:", error);
    
    // Improvement: Smart Error Handling
    // Hanya redirect ke login jika errornya benar-benar karena Auth (401)
    if (error?.response?.status === 401) {
      redirect("/login?error=session_expired");
    }

    // Jika error lain (misal 500 Server Error atau Network Error), 
    // lempar error agar ditangkap oleh error.tsx (Global Error Boundary)
    // Ini mencegah user bingung kenapa dilempar ke login padahal password benar tapi server sedang down.
    throw error; 
  }
}