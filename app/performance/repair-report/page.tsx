'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Calendar } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart,
} from 'recharts'

const trendData = [
  { month: '2026-01', count: 3 },
  { month: '2026-02', count: 5 },
  { month: '2026-03', count: 2 },
  { month: '2026-04', count: 8 },
  { month: '2026-05', count: 6 },
  { month: '2026-06', count: 4 },
]

const repairReasonData = [
  { name: '正常损耗', value: 12 },
  { name: '意外损坏', value: 6 },
  { name: '超寿命使用', value: 4 },
  { name: '操作失误', value: 3 },
  { name: '设计缺陷', value: 2 },
]

const mttrData = [
  { name: '张三', mttr1: 1.2, mttr2: 3.5 },
  { name: '李四', mttr1: 0.8, mttr2: 2.8 },
  { name: '王五', mttr1: 1.5, mttr2: 4.1 },
  { name: '赵六', mttr1: 0.6, mttr2: 2.2 },
]

const efficiencyData = [
  { name: '张三', qualified: 8, total: 9, rate: 88.9 },
  { name: '李四', qualified: 6, total: 7, rate: 85.7 },
  { name: '王五', qualified: 5, total: 6, rate: 83.3 },
  { name: '赵六', qualified: 4, total: 4, rate: 100 },
]

export default function RepairReportPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('month')

  return (
    <MainLayout>
      <div className="p-4 overflow-auto h-full">
        {/* Date filter bar */}
        <div className="bg-white rounded p-3 mb-4 flex items-center justify-between border border-gray-100">
          <div>
            <div className="text-[11px] text-gray-500 mb-1">报修时间</div>
            <div className="flex items-center border border-gray-200 rounded px-3 py-1.5 cursor-pointer hover:border-gray-300 bg-gray-50">
              <span className="text-[13px] text-gray-700">2026-01-01 — 2026-06-30</span>
              <Calendar size={13} className="ml-2 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 text-[12px] rounded border transition-colors ${period === 'week' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              周
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 text-[12px] rounded border transition-colors ${period === 'month' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              月
            </button>
          </div>
        </div>

        {/* Top row: KPI cards + trend chart + reason analysis */}
        <div className="grid grid-cols-[220px_1fr_280px] gap-4 mb-4">
          {/* KPI Cards */}
          <div className="space-y-3">
            <div className="bg-white rounded p-3 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-pink-50 shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">维修中工单数</div>
                <div className="text-2xl font-bold text-gray-800">4</div>
              </div>
            </div>
            <div className="bg-white rounded p-3 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-blue-50 shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">报修总工单数</div>
                <div className="text-2xl font-bold text-gray-800">28</div>
              </div>
            </div>
            <div className="bg-white rounded p-3 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-teal-50 shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">维修耗时 (h)</div>
                <div className="text-2xl font-bold text-gray-800">83.4</div>
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">报修趋势图变化</h3>
            <div className="text-[11px] text-gray-400 mb-2">数量</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={{ r: 4, fill: '#3b82f6' }} strokeWidth={2} name="报修数量" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Repair reason */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">维修原因分析</h3>
            <div className="text-[11px] text-gray-400 mb-2">数量</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={repairReasonData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={64} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 3, 3, 0]} name="数量" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: MTTR chart + efficiency chart */}
        <div className="grid grid-cols-2 gap-4">
          {/* MTTR */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">维修人员平均修复时间</h3>
            <div className="text-[11px] text-gray-400 mb-2">小时</div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={mttrData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="mttr1" fill="#f97316" name="平均响应时间MTTR1(h)" />
                <Bar dataKey="mttr2" fill="#9ca3af" name="平均维修时间MTTR2(h)" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-3 rounded-sm bg-orange-400" /> 平均响应时间MTTR1(h)
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-3 rounded-sm bg-gray-400" /> 平均维修时间MTTR2(h)
              </div>
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-white rounded p-4 border border-gray-100">
            <h3 className="text-[13px] font-semibold text-gray-700 mb-1">维修人员工作效率</h3>
            <div className="flex justify-between text-[11px] text-gray-400 mb-2">
              <span>件数</span>
              <span>效率 (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={efficiencyData} margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="qualified" fill="#22c55e" name="一次维修合格件数" />
                <Bar yAxisId="left" dataKey="total" fill="#3b82f6" name="总维修件数" />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#eab308" strokeWidth={2} dot={{ r: 4, fill: '#eab308' }} name="维修效率(%)" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-3 rounded-sm bg-green-500" /> 一次维修合格件数
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-3 rounded-sm bg-blue-500" /> 总维修件数
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-0.5 bg-yellow-400" /> 维修效率
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
