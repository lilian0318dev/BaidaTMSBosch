'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import {
  RotateCcw, RefreshCw, ChevronDown, Pencil, Eye, Trash2, Library, Search, FolderPlus
} from 'lucide-react'

// 保养级别
const MAINTENANCE_LEVELS = ['一级保养', '二级保养']
const LEVEL_COLORS: Record<string, string> = {
  '一级保养': 'bg-blue-100 text-blue-700',
  '二级保养': 'bg-purple-100 text-purple-700',
}

// 保养项标准库 — 基础数据定义
const MAINTENANCE_ITEMS = [
  {
    id: 'T001', name: '导柱清洁润滑', level: '一级保养', moldType: '通用',
    content: '用专用润滑脂对导柱表面进行清洁后均匀涂抹',
    tools: '无纺布、专用润滑脂', stdTime: 15,
    checkStandard: '导柱表面无异物，润滑脂涂抹均匀无遗漏',
  },
  {
    id: 'T002', name: '型腔检查', level: '一级保养', moldType: '指定模具',
    content: '目视检查型腔表面有无划痕、裂纹、粘料等异常',
    tools: '内窥镜、手电筒', stdTime: 20,
    checkStandard: '型腔表面光洁，无划痕/裂纹/粘料',
  },
  {
    id: 'T003', name: '弹簧压力检测', level: '二级保养', moldType: '通用',
    content: '使用弹簧测力计测量弹簧压力值并与标准值比对',
    tools: '弹簧测力计', stdTime: 30,
    checkStandard: '压力值在 80N - 120N 范围内为合格',
  },
  {
    id: 'T004', name: '冷却水路检测', level: '一级保养', moldType: '通用',
    content: '检查冷却水流量、温度及管路密封性',
    tools: '流量计、温度计', stdTime: 25,
    checkStandard: '流量正常，水温在 20-35℃，无渗漏',
  },
  {
    id: 'T005', name: '合模精度检测', level: '二级保养', moldType: '指定模具',
    content: '用百分表测量模具对角线偏差',
    tools: '百分表、磁性座', stdTime: 40,
    checkStandard: '对角线偏差 ≤ 0.05mm',
  },
  {
    id: 'T006', name: '顶针系统检查', level: '一级保养', moldType: '通用',
    content: '检查顶针伸出量、复位情况及润滑状态',
    tools: '游标卡尺、润滑脂', stdTime: 20,
    checkStandard: '顶针动作顺畅，伸出量一致，复位可靠',
  },
]

export default function MaintenanceTasksPage() {
  const [items, setItems] = useState(MAINTENANCE_ITEMS)
  const [searchName, setSearchName] = useState('')
  const [activeLevel, setActiveLevel] = useState<string>('')
  const [moldTypeFilter, setMoldTypeFilter] = useState<string>('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = items.filter(
    (t) =>
      (!searchName || t.name.includes(searchName)) &&
      (!activeLevel || t.level === activeLevel) &&
      (!moldTypeFilter || t.moldType === moldTypeFilter)
  )

  const stats = {
    total: items.length,
    level1: items.filter(t => t.level === '一级保养').length,
    level2: items.filter(t => t.level === '二级保养').length,
    common: items.filter(t => t.moldType === '通用').length,
    specific: items.filter(t => t.moldType === '指定模具').length,
  }

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-3 h-full">
        {/* 标准库标题区 */}
        <div className="bg-white rounded border border-gray-200 px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Library size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">保养项标准库</div>
            <div className="text-xs text-gray-500 mt-0.5">保养作业基础数据。定义不同模具类型在不同保养级别下需要执行的标准保养项目，保养计划与保养工单将引用此标准库。</div>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-gray-500 shrink-0">
            <div className="flex flex-col items-start"><span className="text-gray-400 text-[11px]">标准项总数</span><span className="font-semibold text-gray-700 mt-0.5">{stats.total}</span></div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex flex-col items-start"><span className="text-gray-400 text-[11px]">一级保养</span><span className="font-semibold text-blue-600 mt-0.5">{stats.level1}</span></div>
            <div className="flex flex-col items-start"><span className="text-gray-400 text-[11px]">二级保养</span><span className="font-semibold text-purple-600 mt-0.5">{stats.level2}</span></div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 mr-1">
              <Search size={13} className="text-gray-400" />
            </div>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="按项目名称搜索"
              className="border border-gray-200 rounded px-2.5 py-1.5 text-sm w-44 focus:outline-none focus:border-blue-400 bg-gray-50"
            />

            {/* 保养级别选择 */}
            <div className="relative ml-2">
              <select
                value={activeLevel}
                onChange={(e) => setActiveLevel(e.target.value)}
                className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-sm pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="">全部级别</option>
                {MAINTENANCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>

            {/* 模具类型选择 */}
            <div className="relative">
              <select
                value={moldTypeFilter}
                onChange={(e) => setMoldTypeFilter(e.target.value)}
                className="appearance-none border border-gray-200 rounded px-2.5 py-1.5 text-sm pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="">全部模具类型</option>
                <option value="通用">通用</option>
                <option value="指定模具">指定模具</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => { setSearchName(''); setActiveLevel(''); setMoldTypeFilter('') }}
              className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
            >
              <RotateCcw size={12} /> 重置筛选
            </button>

            <span className="ml-2 text-[11px] text-gray-400">共 {filtered.length} 项</span>

            <div className="ml-auto flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-gray-200 rounded bg-white" title="刷新"><RefreshCw size={13} /></button>
              <Link
                href="/maintenance/tasks/new"
                className="flex items-center gap-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded px-3 py-1.5 transition-colors"
              >
                <FolderPlus size={13} /> 新增保养项
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
                <tr>
                  {['项目编号','项目名称','保养级别','模具类型','作业内容','所需工具/耗材','标准时间','检查标准/合格判据','操作'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-gray-500 font-medium text-[12px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-[12px] text-gray-400 font-mono">{t.id}</td>
                    <td className="px-4 py-2.5 text-gray-800 text-[13px] font-medium">
                      <Link href={`/maintenance/tasks/${t.id}`} className="text-[#1e5fa8] hover:underline">{t.name}</Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${LEVEL_COLORS[t.level]}`}>{t.level}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-[12px]">
                      {t.moldType === '通用'
                        ? <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">通用</span>
                        : <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">指定模具</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-[12px] max-w-[200px]" title={t.content}>{t.content}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-[12px] max-w-[120px]" title={t.tools}>{t.tools || '-'}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-[12px] whitespace-nowrap">{t.stdTime ? `${t.stdTime} 分钟` : '-'}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-[12px] max-w-[220px]" title={t.checkStandard}>{t.checkStandard || '-'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/maintenance/tasks/${t.id}`} className="text-[11px] text-[#1e5fa8] hover:underline flex items-center gap-0.5">
                          <Eye size={12} /> 查看
                        </Link>
                        <div className="w-px h-3 bg-gray-200" />
                        <Link href={`/maintenance/tasks/${t.id}`} className="text-[11px] text-[#1e5fa8] hover:underline flex items-center gap-0.5">
                          <Pencil size={12} /> 编辑
                        </Link>
                        <div className="w-px h-3 bg-gray-200" />
                        <button onClick={() => setDeleteId(t.id)} className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-0.5">
                          <Trash2 size={12} /> 删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-20 text-center text-xs text-gray-400">
                    <div className="inline-block"><Library size={32} className="mx-auto mb-2 text-gray-300" /> 暂无保养项</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-lg shadow-xl w-80 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">确认删除保养项</h3>
            <p className="text-sm text-gray-500 mb-5">删除后，已引用该保养项的保养计划和工单历史数据仍保留，但新建保养计划时将不再包含此项目。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
              <button onClick={() => { setItems((p) => p.filter((t) => t.id !== deleteId)); setDeleteId(null) }} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
