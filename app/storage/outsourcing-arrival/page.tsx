'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Plus, Search, RotateCcw, Eye, X, Truck, Package, Upload,
  ChevronDown, FileText, ClipboardList,
} from 'lucide-react'

interface OutsourcingOrder {
  id: string
  erpOrderNo: string
  supplier: string
  moldId: string
  moldName: string
  itemNo: string
  spec: string
  processType: string
  expectedDate: string
  status: '待到货' | '待检' | '已入库' | '已退货'
  arrivedQty: number
  totalQty: number
}

interface ArrivalNotice {
  id: string
  erpOrderNo: string
  supplier: string
  deliveryNo: string
  moldId: string
  moldName: string
  arrivedQty: number
  submitter: string
  submitTime: string
  status: '待检' | '合格' | '不合格'
  remark?: string
}

const ERP_ORDERS: OutsourcingOrder[] = [
  {
    id: 'WW-2026-0620-001',
    erpOrderNo: 'ERP-WW-20260620-008',
    supplier: '华南热处理有限公司',
    moldId: 'M012',
    moldName: '7662SO成形凸模',
    itemNo: '60024901201012',
    spec: 'A2737662',
    processType: '热处理',
    expectedDate: '2026-06-25',
    status: '待到货',
    arrivedQty: 0,
    totalQty: 1,
  },
  {
    id: 'WW-2026-0618-003',
    erpOrderNo: 'ERP-WW-20260618-005',
    supplier: '精达模具镀铬厂',
    moldId: 'M008',
    moldName: '7666SO成形凹模',
    itemNo: '60024901201008',
    spec: 'A2737666',
    processType: '镀铬',
    expectedDate: '2026-06-22',
    status: '待到货',
    arrivedQty: 0,
    totalQty: 1,
  },
  {
    id: 'WW-2026-0615-002',
    erpOrderNo: 'ERP-WW-20260615-003',
    supplier: '恒辉精密模具厂',
    moldId: 'M022',
    moldName: '7645SO成形凹模',
    itemNo: '60024901201022',
    spec: 'A2737645',
    processType: '线切割',
    expectedDate: '2026-06-20',
    status: '待到货',
    arrivedQty: 0,
    totalQty: 1,
  },
]

const ARRIVAL_NOTICES: ArrivalNotice[] = [
  {
    id: 'DDT-20260623-0001',
    erpOrderNo: 'ERP-WW-20260615-002',
    supplier: '华南热处理有限公司',
    deliveryNo: 'FH-20260623-0088',
    moldId: 'M005',
    moldName: '7669SO成形凹模',
    arrivedQty: 1,
    submitter: '仓管员A',
    submitTime: '2026-06-23 11:00',
    status: '待检',
    remark: '委外热处理回厂，包装完好',
  },
  {
    id: 'DDT-20260620-0002',
    erpOrderNo: 'ERP-WW-20260610-001',
    supplier: '精达模具镀铬厂',
    deliveryNo: 'JD-20260620-0015',
    moldId: 'M003',
    moldName: '7671SO成形凸模',
    arrivedQty: 1,
    submitter: '仓管员B',
    submitTime: '2026-06-20 09:30',
    status: '合格',
    remark: '镀铬处理回厂',
  },
  {
    id: 'DDT-20260610-0003',
    erpOrderNo: 'ERP-WW-20260605-003',
    supplier: '恒辉精密模具厂',
    deliveryNo: 'HH-20260610-0032',
    moldId: 'M005',
    moldName: '7669SO成形凹模',
    arrivedQty: 1,
    submitter: '仓管员A',
    submitTime: '2026-06-10 11:30',
    status: '合格',
    remark: '委外热处理回厂',
  },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  '待检': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '合格': { bg: 'bg-green-100', text: 'text-green-700' },
  '不合格': { bg: 'bg-red-100', text: 'text-red-700' },
}

export default function OutsourcingArrivalPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OutsourcingOrder | null>(null)
  const [deliveryNo, setDeliveryNo] = useState('')
  const [arrivedQty, setArrivedQty] = useState(1)
  const [remark, setRemark] = useState('')
  const [detail, setDetail] = useState<ArrivalNotice | null>(null)

  const pendingOrders = ERP_ORDERS.filter(
    (o) => o.status === '待到货' && (
      !search || o.erpOrderNo.includes(search) || o.moldId.includes(search) || o.moldName.includes(search)
    )
  )

  const historyNotices = ARRIVAL_NOTICES.filter(
    (n) => !search || n.id.includes(search) || n.moldId.includes(search) || n.moldName.includes(search)
  )

  const handleSubmit = () => {
    if (!selectedOrder || !deliveryNo) {
      alert('请选择委外工单并填写送货单号')
      return
    }
    alert(`委外到货通知单已提交！\n\n单号：DDT-${Date.now()}\n委外单号：${selectedOrder.erpOrderNo}\n送货单号：${deliveryNo}\n模具：${selectedOrder.moldName}\n数量：${arrivedQty}\n\n已生成委外待检单，推送QMS执行来料检验。`)
    setShowNew(false)
    setSelectedOrder(null)
    setDeliveryNo('')
    setArrivedQty(1)
    setRemark('')
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* 顶部说明条 */}
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Truck size={13} className="text-orange-600" />
          <span className="text-xs text-orange-800">
            委外到货专属入库链路 · 关联ERP委外工单 · 提交后生成待检单推送QMS · 检验合格后流转工艺入库审核
          </span>
        </div>

        {/* 标题区 */}
        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">委外到货通知单</h1>
              <p className="text-[11px] text-gray-500">供应商送货回厂登记 · 仓管/钳工使用</p>
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            新增到货通知单
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            待到货委外单
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              activeTab === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {pendingOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            到货通知记录
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              activeTab === 'history' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {historyNotices.length}
            </span>
          </button>
        </div>

        {/* 过滤工具栏 */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'pending' ? '搜索委外单号 / 模具编号 / 模具名称' : '搜索通知单号 / 模具编号 / 模具名称'}
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-orange-400 bg-gray-50"
            />
          </div>

          <button
            onClick={() => setSearch('')}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={11} /> 重置
          </button>

          <div className="ml-auto text-[11px] text-gray-400">
            共 <span className="text-gray-600 font-medium">{activeTab === 'pending' ? pendingOrders.length : historyNotices.length}</span> 条记录
          </div>
        </div>

        {/* 列表区 */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {activeTab === 'pending' ? (
              /* 待到货委外单 */
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">委外单号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">ERP单号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">供应商</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">加工类型</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具编号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">规格</th>
                    <th className="px-3 py-2.5 text-right font-medium text-gray-500">数量</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">预计到货</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">状态</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-16 text-center text-gray-400">暂无待到货委外单</td></tr>
                  ) : (
                    pendingOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-orange-600 font-medium font-mono">{order.id}</td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{order.erpOrderNo}</td>
                        <td className="px-3 py-2.5 text-gray-700">{order.supplier}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[11px]">
                            {order.processType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                            {order.moldId}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-800 font-medium">{order.moldName}</td>
                        <td className="px-3 py-2.5 text-gray-500">{order.spec}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700">{order.totalQty}</td>
                        <td className="px-3 py-2.5 text-gray-500">{order.expectedDate}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowNew(true) }}
                            className="flex items-center gap-1 text-[11px] text-orange-600 hover:text-orange-700 px-2 py-0.5 rounded hover:bg-orange-50 font-medium"
                          >
                            <Plus size={11} /> 到货登记
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              /* 到货通知记录 */
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">通知单号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">委外单号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">供应商</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">送货单号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具编号</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">模具名称</th>
                    <th className="px-3 py-2.5 text-right font-medium text-gray-500">到货数量</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">提交人</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">提交时间</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">检验状态</th>
                    <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyNotices.length === 0 ? (
                    <tr><td colSpan={11} className="px-4 py-16 text-center text-gray-400">暂无到货记录</td></tr>
                  ) : (
                    historyNotices.map((notice) => (
                      <tr key={notice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setDetail(notice)}>
                            {notice.id}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">{notice.erpOrderNo}</td>
                        <td className="px-3 py-2.5 text-gray-700">{notice.supplier}</td>
                        <td className="px-3 py-2.5 text-gray-600 font-mono text-[11px]">{notice.deliveryNo}</td>
                        <td className="px-3 py-2.5">
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                            {notice.moldId}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-800 font-medium">{notice.moldName}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700">{notice.arrivedQty}</td>
                        <td className="px-3 py-2.5 text-gray-600">{notice.submitter}</td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{notice.submitTime}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[notice.status]?.bg || 'bg-gray-100'} ${statusColors[notice.status]?.text || 'text-gray-600'}`}>
                            {notice.status === '待检' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                            {notice.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => setDetail(notice)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50"
                          >
                            <Eye size={11} /> 详情
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 新增到货通知单弹窗 */}
        {showNew && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setShowNew(false); setSelectedOrder(null) }}>
            <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-orange-500" />
                  <span className="text-sm font-semibold text-gray-800">新增委外到货通知单</span>
                </div>
                <button onClick={() => { setShowNew(false); setSelectedOrder(null) }} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* 选择委外工单 */}
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1.5">
                    关联委外工单 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button
                      className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-orange-300"
                    >
                      {selectedOrder ? (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-medium">{selectedOrder.id}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-700">{selectedOrder.moldName}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{selectedOrder.supplier}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">请选择委外工单（下拉/扫码）</span>
                      )}
                      <ChevronDown size={12} className="text-gray-400" />
                    </button>
                    <select
                      value={selectedOrder?.id || ''}
                      onChange={(e) => {
                        const order = ERP_ORDERS.find(o => o.id === e.target.value)
                        setSelectedOrder(order || null)
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      <option value="">请选择委外工单</option>
                      {ERP_ORDERS.map((o) => (
                        <option key={o.id} value={o.id}>{o.id} - {o.moldName} - {o.supplier}</option>
                      ))}
                    </select>
                  </div>
                  {selectedOrder && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      ERP单号：{selectedOrder.erpOrderNo} · 加工类型：{selectedOrder.processType}
                    </p>
                  )}
                </div>

                {/* 送货单号 */}
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1.5">
                    送货单号 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={deliveryNo}
                    onChange={(e) => setDeliveryNo(e.target.value)}
                    placeholder="请输入供应商送货单号"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-orange-400 bg-gray-50"
                  />
                </div>

                {/* 到货明细 */}
                {selectedOrder && (
                  <div>
                    <label className="block text-[12px] text-gray-600 mb-1.5">到货明细</label>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-medium text-gray-500">模具编号</th>
                            <th className="px-3 py-1.5 text-left font-medium text-gray-500">模具名称</th>
                            <th className="px-3 py-1.5 text-right font-medium text-gray-500">应到数量</th>
                            <th className="px-3 py-1.5 text-right font-medium text-gray-500">实到数量</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-gray-200">
                            <td className="px-3 py-2 text-gray-700 font-mono">{selectedOrder.moldId}</td>
                            <td className="px-3 py-2 text-gray-800 font-medium">{selectedOrder.moldName}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{selectedOrder.totalQty}</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min={1}
                                value={arrivedQty}
                                onChange={(e) => setArrivedQty(Number(e.target.value))}
                                className="w-16 border border-gray-200 rounded px-2 py-1 text-right text-[11px] focus:outline-none focus:border-orange-400 bg-white"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 送货照片 */}
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1.5">送货单据照片</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-orange-300 transition-colors cursor-pointer bg-gray-50">
                    <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-[11px] text-gray-400">点击上传或拖拽送货单照片</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">支持 JPG / PNG 格式，最多 5 张</p>
                  </div>
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-[12px] text-gray-600 mb-1.5">备注</label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={2}
                    placeholder="如有特殊情况请备注说明"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-orange-400 bg-gray-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={() => { setShowNew(false); setSelectedOrder(null) }}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOrder || !deliveryNo}
                  className="px-4 py-1.5 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ClipboardList size={13} /> 提交到货通知
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 详情弹窗 */}
        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-[520px]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">到货通知单详情</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[detail.status]?.bg} ${statusColors[detail.status]?.text}`}>
                    {detail.status}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[12px]">
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">通知单号</span>
                    <span className="text-gray-800 font-medium">{detail.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">委外单号</span>
                    <span className="text-blue-600 font-mono">{detail.erpOrderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">供应商</span>
                    <span className="text-gray-700">{detail.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">送货单号</span>
                    <span className="text-gray-700 font-mono">{detail.deliveryNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">模具编号</span>
                    <span className="text-blue-600 font-medium">{detail.moldId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">模具名称</span>
                    <span className="text-gray-800 font-medium">{detail.moldName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">到货数量</span>
                    <span className="text-gray-700">{detail.arrivedQty} 副</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">提交人</span>
                    <span className="text-gray-600">{detail.submitter}</span>
                  </div>
                  <div className="col-span-2 flex justify-between">
                    <span className="text-gray-400">提交时间</span>
                    <span className="text-gray-600">{detail.submitTime}</span>
                  </div>
                </div>
                {detail.remark && (
                  <div>
                    <div className="text-[11px] text-gray-400 mb-1">备注</div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-gray-600">{detail.remark}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end px-5 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setDetail(null)}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
