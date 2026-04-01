"use client";
import { useUIStore } from '@/store/uiStore';

export default function Toast() {
  const { toastMessage } = useUIStore();

  return (
    <div className={`toast ${toastMessage ? 'show' : ''}`} id="toast">
      {toastMessage}
    </div>
  );
}
