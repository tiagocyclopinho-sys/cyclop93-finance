"use client"
import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string) {
    if (!dateStr) return '---';
    // Split YYYY-MM-DD and rearrange to DD/MM/YYYY to avoid timezone shifts
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

export function getTodayISO() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
