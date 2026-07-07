'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RefreshCw, ChevronDown, ChevronRight,
  Info, CheckCircle, XCircle, Clock, ExternalLink,
  MapPin, FileText
} from 'lucide-react'

// 工序制造类型
type ManufactureType = 'self' | 'outsource' | 'both' // 只能自制 | 只能委外 | 既可自制也可委外

interface Process {
  seq: string
  name: string
  isInspect: boolean
  isOutsource: boolean
  manufactureType?: ManufactureType // 默认 undefined 表示既可自制也可委外
}

// ERP同步的工艺路线数据
const PROCESS_ROUTES = [
  {
    id: 'PR-001',
    name: '7686SO三工位成形工艺',
    itemNo: '60004712402104',
    itemName: '7686SO三工位成形凹模',
    department: '一车间卡钳活塞',
    totalProcesses: 8,
    outsourceCount: 1,
    inspectCount: 2,
    processes: [
      { seq: '0010', name: '粗铣', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0020', name: '钳工', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0030', name: '热处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0040', name: '车配', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0050', name: '精车', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0060', name: '平面磨', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0070', name: '线切割', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0080', name: '精铣+电火', isInspect: true, isOutsource: false, manufactureType: 'both' },
    ],
  },
  {
    id: 'PR-002',
    name: 'Y587成形工艺路线',
    itemNo: '60022212402005',
    itemName: 'Y587成形凹模',
    department: '一车间卡钳活塞',
    totalProcesses: 6,
    outsourceCount: 1,
    inspectCount: 1,
    processes: [
      { seq: '0010', name: '粗铣', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0020', name: '钳工', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0030', name: '热处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0040', name: '精车', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0050', name: '平面磨', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0060', name: '抛光', isInspect: false, isOutsource: false, manufactureType: 'self' },
    ],
  },
  {
    id: 'PR-003',
    name: '695反挤成形工艺',
    itemNo: '60008412402030',
    itemName: '695反挤冲头芯',
    department: '一车间动铁芯',
    totalProcesses: 10,
    outsourceCount: 2,
    inspectCount: 2,
    processes: [
      { seq: '0010', name: '粗铣', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0020', name: '车配', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0030', name: '热处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0040', name: '精车', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0050', name: '平面磨', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0060', name: '线切割', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0070', name: '精铣', isInspect: true, isOutsource: false, manufactureType: 'both' },
      { seq: '0080', name: '钳工', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0090', name: '平面割', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0100', name: '检验', isInspect: true, isOutsource: false, manufactureType: 'self' },
    ],
  },
  {
    id: 'PR-004',
    name: '1250冲孔切边工艺',
    itemNo: '60010112104000',
    itemName: '1250冲孔、切边成套',
    department: '一车间磁极',
    totalProcesses: 12,
    outsourceCount: 3,
    inspectCount: 3,
    processes: [
      { seq: '0010', name: '锻造', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0020', name: '粗车', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0030', name: '热处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0040', name: '精车', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0050', name: '钻孔', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0060', name: '冲孔', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0070', name: '切边', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0080', name: '整形', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0090', name: '检验', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0100', name: '表面处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0110', name: '终检', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0120', name: '包装', isInspect: false, isOutsource: false, manufactureType: 'self' },
    ],
  },
  {
    id: 'PR-005',
    name: '0212精锻工艺路线',
    itemNo: '60026601202002',
    itemName: '0212精锻上模',
    department: '一车间爪极',
    totalProcesses: 5,
    outsourceCount: 1,
    inspectCount: 1,
    processes: [
      { seq: '0010', name: '锻造', isInspect: false, isOutsource: false, manufactureType: 'self' },
      { seq: '0020', name: '热处理', isInspect: false, isOutsource: true, manufactureType: 'outsource' },
      { seq: '0030', name: '车削', isInspect: false, isOutsource: false, manufactureType: 'both' },
      { seq: '0040', name: '检验', isInspect: true, isOutsource: false, manufactureType: 'self' },
      { seq: '0050', name: '精磨', isInspect: false, isOutsource: false, manufactureType: 'self' },
    ],
  },
]

export default function ProcessRoutesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRoutes, setExpandedRoutes] = useState<string[]>([])

  const filteredRoutes = PROCESS_ROUTES.filter(
    (route) =>
      !searchTerm ||
      route.name.includes(searchTerm) ||
      route.itemNo.includes(searchTerm) ||
      route.itemName.includes(searchTerm)
  )

  const toggleExpand = (id: string) => {
    setExpandedRoutes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-gray-800">工艺路线</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} />
              ERP同步
            </button>
          </div>
        </div>

        {/* 说明条 */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2 shrink-0">
          <Info size={14} className="text-blue-600 shrink-0" />
          <span className="text-xs text-blue-700">
            工艺路线数据来源于 <strong>ERP 全量同步</strong>，本系统仅支持查看，不支持手动新增或编辑。如需修改，请联系 ERP 管理员。
          </span>
        </div>

        {/* 搜索栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工艺路线名称 / 品号 / 品名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-500">
            共 {filteredRoutes.length} 条工艺路线
          </span>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto p-4 bg-[#f5f6f8]">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">工艺路线总数</div>
              <div className="text-2xl font-bold text-gray-800">{PROCESS_ROUTES.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">工序总数</div>
              <div className="text-2xl font-bold text-gray-800">
                {PROCESS_ROUTES.reduce((sum, r) => sum + r.totalProcesses, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">涉及委外工序</div>
              <div className="text-2xl font-bold text-orange-600">
                {PROCESS_ROUTES.reduce((sum, r) => sum + r.outsourceCount, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-1">涉及检验工序</div>
              <div className="text-2xl font-bold text-purple-600">
                {PROCESS_ROUTES.reduce((sum, r) => sum + r.inspectCount, 0)}
              </div>
            </div>
          </div>

          {/* 工艺路线列表 */}
          <div className="space-y-3">
            {filteredRoutes.map((route) => {
              const isExpanded = expandedRoutes.includes(route.id)
              return (
                <div key={route.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* 路线头 */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(route.id)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* 展开图标 */}
                      <div className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>

                      {/* 路线信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{route.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-600">
                            {route.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {route.department}
                          </span>
                          <span>{route.itemNo}</span>
                          <span>{route.itemName}</span>
                        </div>
                      </div>
                    </div>

                    {/* 统计标签 */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-50 text-xs">
                        <span className="text-gray-500">工序</span>
                        <span className="font-semibold text-gray-700">{route.totalProcesses}</span>
                      </div>
                      {route.outsourceCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-50 text-xs">
                          <ExternalLink size={11} className="text-orange-500" />
                          <span className="font-medium text-orange-600">{route.outsourceCount}</span>
                        </div>
                      )}
                      {route.inspectCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 text-xs">
                          <FileText size={11} className="text-purple-500" />
                          <span className="font-medium text-purple-600">{route.inspectCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 展开的工序详情 */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50">
                      {/* 表头 */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100/50 text-xs font-medium text-gray-500">
                        <div className="col-span-1">序号</div>
                        <div className="col-span-2">工序编号</div>
                        <div className="col-span-3">工序名称</div>
                        <div className="col-span-2">检验</div>
                        <div className="col-span-2">自制</div>
                        <div className="col-span-2">委外</div>
                      </div>
                      {/* 工序列表 */}
                      <div className="divide-y divide-gray-100">
                        {route.processes.map((process, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-4 px-4 py-2.5 text-xs items-center hover:bg-white transition-colors"
                          >
                            <div className="col-span-1 text-gray-400">{idx + 1}</div>
                            <div className="col-span-2 font-mono text-gray-700">{process.seq}</div>
                            <div className="col-span-3 font-medium text-gray-800">{process.name}</div>
                            <div className="col-span-2">
                              {process.isInspect ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-600">
                                  <CheckCircle size={10} />
                                  需检验
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <XCircle size={10} />
                                  -
                                </span>
                              )}
                            </div>
                            <div className="col-span-2">
                              {process.manufactureType === 'self' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-600">
                                  <CheckCircle size={10} />
                                  自制
                                </span>
                              ) : process.manufactureType === 'both' || process.manufactureType === undefined ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                  可自制
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <XCircle size={10} />
                                  -
                                </span>
                              )}
                            </div>
                            <div className="col-span-2">
                              {process.manufactureType === 'outsource' ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-600">
                                  <ExternalLink size={10} />
                                  委外
                                </span>
                              ) : process.manufactureType === 'both' || process.manufactureType === undefined ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                                  可委外
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400">
                                  <XCircle size={10} />
                                  -
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredRoutes.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">未找到匹配的工艺路线</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
