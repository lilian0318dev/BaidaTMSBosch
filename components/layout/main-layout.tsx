'use client'

import { Sidebar } from './sidebar'
import { TopBar } from './topbar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      {/* Rainbow top strip */}
      <div className="absolute top-0 left-0 right-0 h-1 z-50 flex">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-orange-400" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-teal-400" />
        <div className="flex-1 bg-cyan-400" />
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-indigo-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-pink-500" />
      </div>

      {/* Sidebar */}
      <div className="mt-1 shrink-0 h-[calc(100vh-4px)]">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 mt-1">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <footer className="h-[32px] bg-white border-t border-gray-200 flex items-center justify-center shrink-0">
          <span className="text-xs text-gray-400">© 2026 罗伯特·博世有限公司</span>
        </footer>
      </div>
    </div>
  )
}
