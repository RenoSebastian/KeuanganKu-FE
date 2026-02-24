"use client";

import { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    Check,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    Loader2,
    Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/hooks/use-notification-store";
import { NotificationType } from "@/types/notification";
import api from "@/lib/axios";

// Helper untuk icon berdasarkan tipe notifikasi
const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />;
        case "WARNING": return <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />;
        case "ERROR": return <XCircle className="h-4 w-4 text-red-500 mt-0.5" />;
        default: return <Info className="h-4 w-4 text-blue-500 mt-0.5" />;
    }
};

export function NotificationPopover() {
    const {
        notifications,
        unreadCount,
        setNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial data history dari API
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            // Limit 20 item terakhir
            const res = await api.get("/notifications?page=1&limit=20");
            setNotifications(res.data.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load saat komponen dipasang
    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handler: Tandai semua sudah dibaca
    const handleMarkAllRead = async () => {
        try {
            await api.patch("/notifications/read-all");
            markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    // Handler: Klik item notifikasi (tandai baca)
    const handleItemClick = async (id: string, isRead: boolean) => {
        if (!isRead) {
            try {
                await api.patch(`/notifications/${id}/read`);
                markAsRead(id);
            } catch (error) {
                console.error("Failed to mark read", error);
            }
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full h-10 w-10 hover:bg-slate-100 text-slate-500 transition-all">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-in zoom-in duration-300" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 sm:w-96 p-0 shadow-2xl rounded-2xl mr-2 sm:mr-4 border-slate-100" align="end">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-2xl border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-800">Notifikasi</h4>
                        {unreadCount > 0 && (
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                {unreadCount} Baru
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md"
                        >
                            <Check className="h-3 w-3" />
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                {/* List Area */}
                <ScrollArea className="h-100 bg-slate-50/30">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            <span className="text-xs font-medium">Memuat notifikasi...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400 p-6 text-center">
                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <Inbox className="h-6 w-6 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-600">Belum ada notifikasi</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-50 mx-auto leading-relaxed">
                                    Kami akan memberi tahu Anda jika ada aktivitas penting pada akun Anda.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id, item.isRead)}
                                    className={cn(
                                        "relative flex gap-3 p-4 cursor-pointer transition-all border-b border-slate-100 last:border-0 hover:bg-slate-50",
                                        !item.isRead ? "bg-white" : "bg-slate-50/50 opacity-80 hover:opacity-100"
                                    )}
                                >
                                    {/* Indikator Belum Dibaca (Garis Kiri) */}
                                    {!item.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                    )}

                                    <div className="shrink-0 pt-0.5">
                                        {getNotificationIcon(item.type)}
                                    </div>

                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={cn("text-xs font-semibold text-slate-800 leading-snug", !item.isRead && "text-slate-900 font-bold")}>
                                                {item.title}
                                            </p>
                                            <span className="text-[9px] text-slate-400 whitespace-nowrap shrink-0">
                                                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                            {item.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-2 border-t border-slate-100 bg-white rounded-b-2xl">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] text-slate-400 h-8 font-medium hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        Lihat Riwayat Lengkap
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}