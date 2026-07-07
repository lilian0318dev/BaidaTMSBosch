'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Wrench, AlertTriangle, Search, ChevronRight,
  Package, CheckCircle2, X, ArrowDownToLine,
} from 'lucide-react'

interface PendingItem {
  id: string
  moldId: string
  moldName: string
  itemNo: string
  spec: string
  location: string
  issue: string
  reasonCategory: string
  severity: 'normal' | 'urgent' | 'emergency'
  applicant: string
  applyTime: string
  totalCount: number
}

const WAITING_OFFLINE: PendingItem[] = [
  {
    id: 'WX-20260623-0001',
    moldId: 'M010',
    moldName: '7664SO成形凸模',
    itemNo: '60024901201010',
    spec: 'A2737664',
    location: '现场仓 / 冲压一车间 / 03号机',
    issue: '型腔磨损严重，产品尺寸超差',
    reasonCategory: '模具磨损 / 型腔磨损',
    severity: 'urgent',
    applicant: '张班长',
    applyTime: '2026-06-23 09:15',
    totalCount: 52360,
  },
  {
    id: 'WX-20260623-0002',
    moldId: 'M015',
    moldName: '7659SO成形凹模',
    itemNo: '60024901201015',
    spec: 'A2737659',
    location: '现场仓 / 冲压二车间 / 07号机',
    issue: '顶针断裂，产品顶出异常',
    reasonCategory: '崩裂破损 / 断裂',
    severity: 'emergency',
    applicant: '李班长',
    applyTime: '2026-06-23 10:30',
    totalCount: 38920,
  },
  {
    id: 'WX-20260622-0005',
    moldId: 'M016',
    moldName: '7658SO成形凸模',
    itemNo: '60024901201016',
    spec: 'A2737658',
    location: '现场仓 / 冲压一车间 / 05号机',
    issue: '滑块卡顿，开合模不顺畅',
    reasonCategory: '装配异常 / 卡滞动作不顺',
    severity: 'normal',
    applicant: '王班长',
    applyTime: '2026-06-22 16:45',
    totalCount: 45680,
  },
  {
    id: 'WX-20260622-0003',
    moldId: 'M007',
    moldName: '7667SO成形凹模',
    itemNo: '60024901201007',
    spec: 'A2737667',
    location: '现场仓 / 冲压一车间 / 02号机',
    issue: '分型面磨损，飞边过大',
    reasonCategory: '模具磨损 / 分型面磨损',
    severity: 'urgent',
    applicant: '赵班长',
    applyTime: '2026-06-22 11:20',
    totalCount: 61250,
  },
  {
    id: 'WX-20260621-0006',
    moldId: 'M009',
    moldName: '7665SO成形凹模',
    itemNo: '60024901201009',
    spec: 'A2737665',
    location: '现场仓 / 冲压二车间 / 04号机',
    issue: '崩角，产品边缘缺料',
    reasonCategory: '崩裂破损 / 崩角',
    severity: 'emergency',
    applicant: '周班长',
    applyTime: '2026-06-21 08:30',
    totalCount: 48760,
  },
]

const severityMap = {
  normal: { label: '普通', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  urgent: { label: '加急', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  emergency: { label: '特急', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function RepairPendingPage() {
  const [search, setSearch] = useState('')
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<PendingItem | null>(null)
  const [processCount, setProcessCount] = useState('')

  const offlineFiltered = WAITING_OFFLINE.filter(
    (i) =>
      i.moldId.toLowerCase().includes(search.toLowerCase()) ||
      i.moldName.includes(search) ||
      i.itemNo.includes(search)
  )

  const handleOpenOffline = (item: PendingItem) => {
    setCurrentItem(item)
    setProcessCount('')
    setShowOfflineModal(true)
  }

  const handleConfirmOffline = () => {
    if (!processCount || isNaN(Number(processCount)) || Number(processCount) <= 0) {
      alert('请输入正确的本次加工次数')
      return
    }
    alert(`确认入库成功！\n维修单号：${currentItem?.id}\n本次加工：${processCount} 模次\n累计加工：${(currentItem?.totalCount || 0) + Number(processCount)} 模次\n已转入待修仓，任务已推送至钳工【我的维修任务-待接单】`)
    setShowOfflineModal(false)
  }

  const emergencyCount = offlineFiltered.filter((i) => i.severity === 'emergency').length

  return (
    <MainLayout>
      <div className="p-4 h-full bg-gray-50 overflow-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Wrench size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">待修仓</div>
              <div className="text-[12px] text-gray-500">车间下模入库登记 · 维修中转管理</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {emergencyCount > 0 && (
              <div className="flex items-center gap-2 text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                <AlertTriangle size={13} />
                <span>特急待处理：{emergencyCount} 项</span>
              </div>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[12px] text-gray-500 mb-1">待下模</div>
            <div className="text-2xl font-bold text-amber-600">{WAITING_OFFLINE.length}</div>
            <div className="text-[11px] text-gray-400 mt-1">副等待车间下模送库</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[12px] text-gray-500 mb-1">特急</div>
            <div className="text-2xl font-bold text-red-600">
              {WAITING_OFFLINE.filter((i) => i.severity === 'emergency').length}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">副需优先处理</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[12px] text-gray-500 mb-1">加急</div>
            <div className="text-2xl font-bold text-orange-600">
              {WAITING_OFFLINE.filter((i) => i.severity === 'urgent').length}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">副需尽快处理</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[12px] text-gray-500 mb-1">今日入库</div>
            <div className="text-2xl font-bold text-green-600">2</div>
            <div className="text-[11px] text-gray-400 mt-1">副（截至当前）</div>
          </div>
        </div>

        {/* 搜索 + 列表 */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <div className="flex items-center border-b border-gray-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <ArrowDownToLine size={14} className="text-amber-600" />
              <span className="text-[13px] font-medium text-gray-800">待下模列表</span>
              <span className="bg-amber-100 text-amber-700 text-[11px] px-1.5 py-0.5 rounded">
                {WAITING_OFFLINE.length}
              </span>
            </div>

            <div className="ml-auto">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索模具编号 / 名称 / 品号..."
                  className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-56 focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
            </div>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-[12px]">
                  <th className="px-4 py-2.5 text-left font-medium">维修单号</th>
                  <th className="px-4 py-2.5 text-left font-medium">模具编号</th>
                  <th className="px-4 py-2.5 text-left font-medium">模具名称</th>
                  <th className="px-4 py-2.5 text-left font-medium">品号</th>
                  <th className="px-4 py-2.5 text-left font-medium">当前位置</th>
                  <th className="px-4 py-2.5 text-left font-medium">不良原因</th>
                  <th className="px-4 py-2.5 text-left font-medium">紧急程度</th>
                  <th className="px-4 py-2.5 text-left font-medium">申请时间</th>
                  <th className="px-4 py-2.5 text-left font-medium">累计加工</th>
                  <th className="px-4 py-2.5 text-left font-medium">申请人</th>
                  <th className="px-4 py-2.5 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {offlineFiltered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-[12px] text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                )}
                {offlineFiltered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[#1e5fa8] font-medium text-[12px]">{item.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-[#1e5fa8] px-2 py-0.5 rounded text-[12px] font-medium">
                        {item.moldId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-800 font-medium">{item.moldName}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 font-mono">{item.itemNo}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{item.location}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-600">{item.reasonCategory}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${severityMap[item.severity].bg} ${severityMap[item.severity].text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${severityMap[item.severity].dot}`} />
                        {severityMap[item.severity].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{item.applyTime}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-700 font-medium">
                      {item.totalCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{item.applicant}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenOffline(item)}
                        className="text-[12px] text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded transition-colors flex items-center gap-1"
                      >
                        <Package size={12} /> 确认入库
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-[12px] text-blue-700">
          <span className="font-medium">流程说明：</span>
          维修申请提交 → 车间人员下模并确认入库（填写加工次数）→ 模具转入待修仓 → 钳工在【我的维修任务-待接单】领取任务 → 执行维修 → 完工后推送 QMS 检验
        </div>
      </div>

      {/* 确认入库弹窗 */}
      {showOfflineModal && currentItem && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setShowOfflineModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-800">确认下模入库</span>
              </div>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[12px]">
              {/* 模具信息 */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[11px] text-gray-500">维修单号</div>
                    <div className="text-[13px] font-semibold text-gray-800">{currentItem.id}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">模具编号</div>
                    <div className="text-[13px] font-semibold text-[#1e5fa8]">{currentItem.moldId}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">模具名称</div>
                    <div className="text-[13px] font-medium text-gray-800">{currentItem.moldName}</div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500">
                  当前位置：<span className="text-gray-700">{currentItem.location}</span>
                </div>
              </div>

              {/* 转库说明 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-[11px] text-gray-500 mb-1">转出</div>
                  <div className="text-[12px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    现场仓
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
                <div className="text-center">
                  <div className="text-[11px] text-gray-500 mb-1">转入</div>
                  <div className="text-[12px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    模具待修仓
                  </div>
                </div>
              </div>

              {/* 加工次数 */}
              <div>
                <label className="text-gray-600 block mb-1.5">
                  本次加工次数 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={processCount}
                  onChange={(e) => setProcessCount(e.target.value)}
                  placeholder="请输入模具本次加工次数"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#1e5fa8]"
                />
                <div className="text-[11px] text-gray-400 mt-1.5">
                  累计加工次数：{currentItem.totalCount.toLocaleString()} 模次
                  {processCount && !isNaN(Number(processCount)) && (
                    <span className="text-[#1e5fa8] ml-1">
                      → 入库后累计：{(currentItem.totalCount + Number(processCount)).toLocaleString()} 模次
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-600 block mb-1.5">送库人</label>
                <input
                  type="text"
                  defaultValue="张班长"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-[#1e5fa8]"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-[12px] text-gray-600 border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmOffline}
                className="text-[12px] text-white bg-orange-500 hover:bg-orange-600 rounded px-4 py-1.5 font-medium flex items-center gap-1"
              >
                <CheckCircle2 size={12} /> 确认入库
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
