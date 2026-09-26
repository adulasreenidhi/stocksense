import React from 'react';
import Navbar from './Navbar';
import { Wifi, Activity, Shield } from 'lucide-react';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-canvas text-neutral-100 flex flex-col relative selection:bg-accent selection:text-white">
      {/* Subtle atmospheric ambient glow - premium dark obsidian feel */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-accent/[0.04] to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-white/[0.015] blur-3xl pointer-events-none -z-10" />

      {/* Floating Glassmorphic Navbar (~72px tall dock) */}
      <Navbar />

      {/* Main Content Container with proper top padding to clear floating navbar dock */}
      <main className="flex-1 w-full max-w-7xl mx-auto pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Minimal Discord/Nike-style micro status bar */}
      <footer className="border-t border-white/[0.06] bg-canvas-subtle/50 backdrop-blur-md py-3 px-4 sm:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
            <span className="text-neutral-500">•</span>
            <span>NODE: AP-SOUTH-1</span>
            <span className="text-neutral-500">•</span>
            <span>SYNC: 12ms</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>STOCKSENSE v1.0.0</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
              API STATUS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
