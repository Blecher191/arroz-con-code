import { useState, useEffect } from "react";


export default function SettingsPage() {

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>


      <button
        className="rounded-md border border-red-200 px-6 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Sign Out
      </button>
    </section>
  );
} 