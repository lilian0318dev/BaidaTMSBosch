'use client'

import { useState } from 'react'

interface MoldCardProps {
  id: string
  name: string
  nextProductionDate?: string
  location: string
  recommendedLife: number
  usedCount: number
  lastMaintenanceDate?: string
  lastMaintenanceCount?: number
  remainingMaintenance?: number
  urgency?: 'high' | 'medium' | 'low'
  repairDate?: string
  repairReason?: string
  remark?: string
  onClick?: () => void
  selected?: boolean
}

const statusBarColors = [
  { color: '#22c55e', label: '正常' },
  { color: '#ef4444', label: '异常' },
  { color: '#eab308', label: '警告' },
  { color: '#3b82f6', label: '待检' },
]

export function MoldCard({ id, name, nextProductionDate, location, recommendedLife, usedCount, lastMaintenanceDate, lastMaintenanceCount, remainingMaintenance, urgency, repairDate, repairReason, remark, onClick, selected }: MoldCardProps) {
  return (
    <div
      className={`bg-[#e8e8e8] rounded mb-2 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${selected ? 'border-l-blue-500' : 'border-l-purple-500'}`}
      onClick={onClick}
    >
      {/* Top border strip */}
      <div className="h-1 rounded-t" style={{
        background: 'linear-gradient(to right, #a855f7 60%, #e5e7eb 60%)'
      }} />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center overflow-hidden">
              <img src="https://via.placeholder.com/48x48/9ca3af/ffffff?text=M" alt="模具" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{id}</div>
              <div className="text-sm text-gray-600">{name}</div>
            </div>
          </div>
          <div className="text-right">
            {urgency && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs text-white font-medium mr-2 ${
                urgency === 'high' ? 'bg-red-500' : urgency === 'medium' ? 'bg-orange-400' : 'bg-yellow-500'
              }`}>
                {urgency === 'high' ? '高' : urgency === 'medium' ? '中' : '低'}
              </span>
            )}
            {nextProductionDate && (
              <div>
                <div className="text-xs text-gray-500">下次排产日期</div>
                <div className="text-xs font-medium text-gray-700">{nextProductionDate}</div>
              </div>
            )}
            {repairDate && (
              <div>
                <div className="text-xs text-gray-500">最近一次排产日期</div>
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">状态堆叠图</div>
          <div className="flex h-4 rounded overflow-hidden">
            <div className="flex-1 bg-green-500 flex items-center justify-center text-white text-xs">0%</div>
            <div className="flex-1 bg-red-500 flex items-center justify-center text-white text-xs">0%</div>
            <div className="flex-1 bg-yellow-500 flex items-center justify-center text-white text-xs">0%</div>
            <div className="flex-1 bg-blue-500 flex items-center justify-center text-white text-xs">0%</div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-xs">
          <div>
            <div className="text-gray-500">当前位置</div>
            <div className="font-medium text-gray-700">{location}</div>
          </div>
          <div>
            <div className="text-gray-500">建议寿命</div>
            <div className="font-medium text-gray-700">{recommendedLife}</div>
          </div>
          <div>
            <div className="text-gray-500">当前已使用次数</div>
            <div className="font-medium text-gray-700">{usedCount}</div>
          </div>
          <div>
            <div className="text-gray-500">上次保养日期</div>
            <div className="font-medium text-gray-700">{lastMaintenanceDate || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">上次保养次数</div>
            <div className="font-medium text-gray-700">{lastMaintenanceCount ?? '-'}</div>
          </div>
          <div>
            <div className="text-gray-500">保养剩余次数</div>
            <div className="font-medium text-gray-700">{remainingMaintenance ?? '-'}</div>
          </div>
          {repairDate && (
            <div>
              <div className="text-gray-500">期望完成日期</div>
              <div className="font-medium text-gray-700">{repairDate}</div>
            </div>
          )}
          {repairReason !== undefined && (
            <div>
              <div className="text-gray-500 flex items-center gap-1">
                维修原因
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div className="font-medium text-gray-700">{repairReason || '-'}</div>
            </div>
          )}
          {remark !== undefined && (
            <div>
              <div className="text-gray-500 flex items-center gap-1">
                原因备注
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div className="font-medium text-gray-700">{remark || '-'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
