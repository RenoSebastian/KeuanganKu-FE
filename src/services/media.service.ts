import apiClient from '@/lib/axios';

// --- Types ---

export interface MediaUploadResponse {
    status: string;
    message: string;
    data: {
        url: string;      // Path relative: "uploads/uuid-filename.jpg"
        filename: string;
        mimetype: string;
        size: number;
    };
}

/**
 * MEDIA SERVICE
 * ------------------------------------------------------------------
 * Bertanggung jawab menangani upload file asinkron (Instant Upload).
 * Service ini dipanggil segera setelah user memilih file di <input type="file">.
 * ------------------------------------------------------------------
 */
export const mediaService = {

    /**
     * Upload file tunggal ke server.
     * @param file File object native browser
     * @returns Promise<string> URL path relative dari file yang berhasil diupload
     */
    async upload(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<MediaUploadResponse>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // --- [FIX] URI Normalization ---
        // Backend mereturn raw physical path (e.g., "/uploads/media/uuid.webp").
        // Kita harus memangkasnya menjadi URI API yang valid untuk dikonsumsi getFullUrl(),
        // yaitu "/media/uuid.webp" agar cocok dengan kontrak @Get(':filename') di MediaController.

        const rawUrl = response.data.data.url;

        // Ekstraksi murni nama file dari ujung string path
        const filename = rawUrl.substring(rawUrl.lastIndexOf('/') + 1);

        // Kembalikan URI yang sesuai dengan routing NestJS
        return `/media/${filename}`;
    },

    /**
     * Menghapus file fisik dari storage server.
     * Digunakan untuk mekanisme "Undo Upload" atau saat mengganti gambar (Replace).
     * @param path Relative path file (e.g., "uploads/xyz.jpg")
     */
    async delete(path: string): Promise<boolean> {
        if (!path) return false;

        try {
            // Mengirim path via body agar aman dari karakter URL encoded
            await apiClient.delete('/media', {
                data: { path },
            });
            return true;
        } catch (error) {
            // Kita log error tapi return false agar UI tidak crash (Fail Safe)
            console.error('Failed to delete media file:', error);
            return false;
        }
    },

    /**
     * Helper untuk mendapatkan Full URL untuk ditampilkan di <Image />
     * @param path Relative path dari backend
     */
    getFullUrl(path: string | undefined | null): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        // [FIX] Mengubah default fallback ke port 4000 (Backend) bukan 3000 (Frontend)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

        // Menghapus trailing slash dari base dan leading slash dari path untuk mencegah double slash
        const cleanBase = baseUrl.replace(/\/+$/, '');
        const cleanPath = path.replace(/^\/+/, '');

        return `${cleanBase}/${cleanPath}`;
    }
};