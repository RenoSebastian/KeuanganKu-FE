// ============================================================================
// SRC/LIB/TYPES.TS (BARREL FILE)
//
// File ini adalah gerbang utama untuk semua tipe data aplikasi.
// Tujuannya adalah untuk menyederhanakan path import di seluruh komponen,
// sementara logika tipe sebenarnya sudah dipecah ke dalam folder /types.
// JANGAN MENULIS LOGIKA TIPE LANGSUNG DI SINI.
// ============================================================================

export * from './types/common';
export * from './types/auth';
export * from './types/dashboard';
export * from './types/budgeting';
export * from './types/education';
export * from './types/financial-checkup';
export * from './types/goals';
export * from './types/insurance';
export * from './types/pension';
export * from './types/retention';
export * from './types/risk-profile';