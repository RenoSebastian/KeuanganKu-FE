import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * TABLE COMPONENT (PWA OPTIMIZED)
 * ------------------------------------------------------------------
 * Komponen dasar untuk menampilkan data tabular.
 * Terdapat proteksi layout untuk layar mobile (Horizontal Swipe).
 */

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  // [FIX PWA & UX]: 
  // 1. overflow-x-auto: Membuka kunci swipe horizontal.
  // 2. [scrollbar-width:none] & [&::-webkit-scrollbar]:hidden : Menyembunyikan visual scrollbar di semua browser (Chrome, Firefox, Safari) agar terlihat seperti native app.
  // 3. [-webkit-overflow-scrolling:touch] : Memberikan efek fisika "membal" saat di-scroll mentok di iOS.
  <div className="relative w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
    <table
      ref={ref}
      // min-w-full memastikan tabel tidak akan pernah menyusut lebih kecil dari ukuran asli kontennya
      className={cn("w-full min-w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-slate-50/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // [FIX PWA & UX]: 
      // h-12 px-4 memberikan Touch-Target yang lega.
      // whitespace-nowrap mengunci teks (misal: "Tanggal Simulasi") agar tidak pernah patah menjadi 2 baris ke bawah saat dilayar sempit.
      "h-12 px-4 text-left align-middle font-semibold text-slate-500 tracking-wide whitespace-nowrap [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // [FIX PWA & UX]: 
      // p-4 untuk 'breathing room'.
      // whitespace-nowrap ditambahkan agar isi data tidak tumpah/hancur berantakan ke bawah. Data akan tetap lurus menyamping seiring di-scroll.
      "p-4 align-middle whitespace-nowrap text-slate-700 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm font-medium text-slate-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}