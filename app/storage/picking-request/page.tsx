'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Plus, X, FileText,
  Factory, Wrench, Shield, Truck, Trash2, ChevronDown,
  ClipboardList, Package, Printer,
} from 'lucide-react'

type PickingType = 'manufacture' | 'repair' | 'maintenance' | 'scrap'

interface PickingItem {
  id: string
  moldId: string
  moldName: string
  itemNo: string
  spec: string
  qty: number
  unit: string
  fromWarehouse: string
  remark?: string
}

interface PickingRequest {
  id: string
  type: PickingType
  typeLabel: string
  fromWarehouse: string
  toLocation: string
  applicant: string
  applyTime: string
  status: '待审核' | '已审核待出库' | '已出库' | '已驳回' | '已取消'
  sourceOrderNo?: string
  remark?: string
  auditor?: string
  auditTime?: string
  items: PickingItem[]
}

const MOCK_DATA: PickingRequest[] = [
  {
    id: 'LL-20260624-0001',
    type: 'manufacture',
    typeLabel: '生产领用',
    fromWarehouse: '成品仓',
    toLocation: '冲压车间-A线-01号机',
    applicant: '张班长',
    applyTime: '2026-06-24 08:30',
    status: '待审核',
    sourceOrderNo: 'WO-2026-0624-003',
    remark: '生产工单领用',
    items: [
      {
        id: '1',
        moldId: 'M020',
        moldName: '7650SO成形凸模',
        itemNo: '60024901201020',
        spec: 'A2737650',
        qty: 1,
        unit: '件',
        fromWarehouse: '成品仓',
      },
    ],
  },
  {
    id: 'LL-20260624-0008',
    type: 'manufacture',
    typeLabel: '生产领用',
    fromWarehouse: '备料仓',
    toLocation: '加工中心01',
    applicant: '钳工A',
    applyTime: '2026-06-29 08:15',
    status: '已审核待出库',
    sourceOrderNo: 'WO-2024-001',
    remark: '模具钢料、弹簧、螺栓等5种物料',
    auditor: '王主管',
    auditTime: '2026-06-29 08:30',
    items: [
      { id: '1', moldId: '190038', moldName: '7686SO三工位成形凹模', itemNo: '60004712402104', spec: 'Cr12MoV φ80×120', qty: 5, unit: '件', fromWarehouse: '备料仓' },
      { id: '2', moldId: '', moldName: '弹簧', itemNo: '5.04.1336', spec: '', qty: 20, unit: '件', fromWarehouse: '备料仓' },
      { id: '3', moldId: '', moldName: '螺栓', itemNo: '5.04.1337', spec: 'M8×20', qty: 40, unit: '件', fromWarehouse: '备料仓' },
      { id: '4', moldId: '', moldName: '垫片', itemNo: '5.04.1338', spec: 'φ8', qty: 30, unit: '件', fromWarehouse: '备料仓' },
      { id: '5', moldId: '', moldName: '水管加工', itemNo: '5.04.1339', spec: '', qty: 10, unit: '件', fromWarehouse: '备料仓' },
    ],
  },
  {
    id: 'LL-20260624-0009',
    type: 'manufacture',
    typeLabel: '生产领用',
    fromWarehouse: '备料仓',
    toLocation: '车床区',
    applicant: '钳工A',
    applyTime: '2026-06-29 09:00',
    status: '已审核待出库',
    sourceOrderNo: 'WO-2024-005',
    remark: '凸模坯料、弹簧',
    auditor: '王主管',
    auditTime: '2026-06-29 09:10',
    items: [
      { id: '1', moldId: '33089', moldName: 'X200成型凸模', itemNo: '60003312402115', spec: 'SKD11 φ50×80', qty: 2, unit: '件', fromWarehouse: '备料仓' },
      { id: '2', moldId: '', moldName: '弹簧', itemNo: '5.04.1336', spec: '', qty: 10, unit: '件', fromWarehouse: '备料仓' },
    ],
  },
  {
    id: 'LL-20260624-0002',
    type: 'repair',
    typeLabel: '维修领料',
    fromWarehouse: '备料仓',
    toLocation: '工装维修车间',
    applicant: '李钳工',
    applyTime: '2026-06-24 09:15',
    status: '待审核',
    sourceOrderNo: 'WX-2026-0624-001',
    remark: '维修任务领料',
    items: [
      { id: '1', moldId: 'M007', moldName: '7667SO成形凹模', itemNo: '60024901201007', spec: 'A2737667', qty: 1, unit: '件', fromWarehouse: '备料仓' },
    ],
  },
  {
    id: 'LL-20260624-0003',
    type: 'maintenance',
    typeLabel: '保养领料',
    fromWarehouse: '备料仓',
    toLocation: '工装保养车间',
    applicant: '王保养工',
    applyTime: '2026-06-24 10:00',
    status: '待审核',
    sourceOrderNo: 'BY-2026-0624-002',
    items: [
      { id: '1', moldId: 'M015', moldName: '7659SO成形凹模', itemNo: '60024901201015', spec: 'A2737659', qty: 1, unit: '件', fromWarehouse: '备料仓' },
    ],
  },
  {
    id: 'LL-20260623-0005',
    type: 'manufacture',
    typeLabel: '生产领用',
    fromWarehouse: '成品仓',
    toLocation: '冲压车间-B线-03号机',
    applicant: '李班长',
    applyTime: '2026-06-23 07:50',
    status: '已审核待出库',
    sourceOrderNo: 'WO-2026-0623-007',
    auditor: '李主管',
    auditTime: '2026-06-23 08:10',
    items: [
      { id: '1', moldId: 'M021', moldName: '7648SO成形凹模', itemNo: '60024901201021', spec: 'A2737645', qty: 1, unit: '件', fromWarehouse: '成品仓' },
    ],
  },
  {
    id: 'LL-20260622-0006',
    type: 'scrap',
    typeLabel: '报废处置',
    fromWarehouse: '报废仓',
    toLocation: '处置单位-金属回收',
    applicant: '仓管员',
    applyTime: '2026-06-22 11:00',
    status: '已出库',
    sourceOrderNo: 'FS-2026-0622-001',
    remark: '已按报废单处置',
    auditor: '王主管',
    auditTime: '2026-06-22 11:30',
    items: [
      { id: '1', moldId: 'M003', moldName: '7671SO成形凸模', itemNo: '60024901201003', spec: 'A2737671', qty: 1, unit: '件', fromWarehouse: '报废仓' },
    ],
  },
  {
    id: 'LL-20260622-0007',
    type: 'repair',
    typeLabel: '维修领料',
    fromWarehouse: '技术仓',
    toLocation: '工装维修车间',
    applicant: '张钳工',
    applyTime: '2026-06-22 09:30',
    status: '已出库',
    sourceOrderNo: 'WX-2026-0622-003',
    auditor: '李主管',
    auditTime: '2026-06-22 09:45',
    items: [
      { id: '1', moldId: 'M010', moldName: '7664SO成形凸模', itemNo: '60024901201010', spec: 'A2737662', qty: 1, unit: '件', fromWarehouse: '技术仓' },
    ],
  },
]

const TYPE_META: Record<PickingType, { label: string; icon: React.ReactNode; bg: string; text: string; color: string }> = {
  manufacture: { label: '生产领用', icon: <Factory size={11} />, bg: 'bg-blue-100', text: 'text-blue-700', color: 'blue' },
  repair: { label: '维修领料', icon: <Wrench size={11} />, bg: 'bg-red-100', text: 'text-red-700', color: 'red' },
  maintenance: { label: '保养领料', icon: <Shield size={11} />, bg: 'bg-green-100', text: 'text-green-700', color: 'green' },
  scrap: { label: '报废处置', icon: <Trash2 size={11} />, bg: 'bg-gray-100', text: 'text-gray-700', color: 'gray' },
}

const WAREHOUSE_FROM_MAP: Record<PickingType, string> = {
  manufacture: '成品仓',
  repair: '备料仓',
  maintenance: '备料仓',
  scrap: '报废仓',
}

const WAREHOUSE_TO_MAP: Record<PickingType, string> = {
  manufacture: '生产车间',
  repair: '工装维修车间',
  maintenance: '工装保养车间',
  scrap: '处置单位',
}

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓', '报废仓']

const TAB_CONFIG: { key: PickingType | 'all'; label: string; icon?: React.ReactNode; color: string }[] = [
  { key: 'all', label: '全部', color: 'blue' },
  { key: 'manufacture', label: '生产领用', icon: <Factory size={13} />, color: 'blue' },
  { key: 'repair', label: '维修领料', icon: <Wrench size={13} />, color: 'red' },
  { key: 'maintenance', label: '保养领料', icon: <Shield size={13} />, color: 'green' },
  { key: 'scrap', label: '报废处置', icon: <Trash2 size={13} />, color: 'gray' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '待审核': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  '已审核待出库': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  '已出库': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  '已驳回': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  '已取消': { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
}

interface NewForm {
  type: PickingType | ''
  fromWarehouse: string
  toLocation: string
  sourceOrderNo: string
  remark: string
  items: {
    id: string
    moldId: string
    moldName: string
    itemNo: string
    spec: string
    qty: number
    unit: string
  }[]
}

const emptyForm: NewForm = {
  type: '',
  fromWarehouse: '',
  toLocation: '',
  sourceOrderNo: '',
  remark: '',
  items: [{ id: '1', moldId: '', moldName: '', itemNo: '', spec: '', qty: 1, unit: '件' }],
}

export default function PickingRequestPage() {
  const [activeTab, setActiveTab] = useState<PickingType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<NewForm>(emptyForm)
  const [detail, setDetail] = useState<PickingRequest | null>(null)

  const filtered = MOCK_DATA.filter((o) => {
    const matchTab = activeTab === 'all' || o.type === activeTab
    const matchSearch = !search || o.id.includes(search) || o.items.some(item => item.moldId.includes(search) || item.moldName.includes(search))
    const matchWh = !warehouseFilter || o.fromWarehouse === warehouseFilter
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchTab && matchSearch && matchWh && matchStatus
  })

  const pendingCount = MOCK_DATA.filter((o) => o.status === '待审核').length
  const tabPendingCount = (type: PickingType | 'all') =>
    MOCK_DATA.filter((o) => (type === 'all' || o.type === type) && o.status === '待审核').length

  const handleTypeChange = (type: PickingType) => {
    setForm({
      ...form,
      type,
      fromWarehouse: WAREHOUSE_FROM_MAP[type],
      toLocation: WAREHOUSE_TO_MAP[type],
    })
  }

  const handleSubmit = () => {
    if (!form.type || !form.fromWarehouse || form.items.length === 0) {
      alert('请填写必填项')
      return
    }
    const validItems = form.items.filter(item => item.moldName)
    if (validItems.length === 0) {
      alert('请至少添加一个物料')
      return
    }
    alert(`领料申请提交成功！\n\n单号：LL-${Date.now()}\n类型：${TYPE_META[form.type as PickingType].label}\n物料数量：${validItems.length}种\n\n状态：待审核，等待主管审批。`)
    setShowNew(false)
    setForm(emptyForm)
  }

  const handleAudit = (id: string, pass: boolean) => {
    if (pass) {
      if (!confirm(`确认审核通过该领料申请？\n\n审核通过后将推送至仓库执行出库。`)) return
      alert('审核通过，已推送至仓库执行出库')
    } else {
      const reason = prompt('请输入驳回原因：')
      if (reason === null) return
      alert('已驳回')
    }
    setDetail(null)
  }

  const handlePrintPicking = () => {
    if (!detail) return

    const today = new Date().toLocaleDateString('zh-CN')
    const printNo = `SOUT${today.replace(/-/g, '')}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`

    let tableRows = ''
    detail.items.forEach((item, idx) => {
      tableRows += `
        <tr>
          <td>${item.itemNo}</td>
          <td>${item.moldName}</td>
          <td>${item.spec}</td>
          <td>${item.unit}</td>
          <td>${item.qty}</td>
          <td>${item.fromWarehouse}</td>
          <td>${item.remark || ''}</td>
        </tr>
      `
    })

    const printContent = `
      <div class="page-break">
        <div class="bill-header">
          <h1>台州市百达电器有限公司</h1>
          <h2>生产领料</h2>
          <div class="bill-info">
            <span>NO. ${printNo}</span>
            <span>日期：${today}</span>
          </div>
        </div>
        <div class="bill-meta">
          <span>研发代码：___________</span>
          <span>研发项目：___________</span>
          <span>领料部门：${detail.toLocation || '___________'}</span>
        </div>
        <table class="bill-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>规格型号</th>
              <th>单位</th>
              <th>数量</th>
              <th>发料仓库</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="bill-footer">
          <div class="footer-left">
            <span>仓管员：___________</span>
          </div>
          <div class="footer-right">
            <span>领料：___________</span>
          </div>
        </div>
      </div>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>生产领料单 - ${detail.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Microsoft YaHei", "SimHei", sans-serif; font-size: 12px; color: #333; }
          .page-break { page-break-after: always; padding: 20px; }
          .page-break:last-child { page-break-after: avoid; }
          .bill-header { text-align: center; margin-bottom: 15px; }
          .bill-header h1 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
          .bill-header h2 { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          .bill-info { display: flex; justify-content: space-between; }
          .bill-info span { font-size: 11px; }
          .bill-meta { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px dashed #ccc; }
          .bill-meta span { font-size: 11px; }
          .bill-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .bill-table th, .bill-table td { border: 1px solid #333; padding: 6px 4px; text-align: center; font-size: 11px; }
          .bill-table th { background: #f5f5f5; font-weight: bold; }
          .bill-footer { display: flex; justify-content: space-between; margin-top: 40px; }
          .bill-footer span { font-size: 11px; }
          .footer-left, .footer-right { text-align: center; }
          @media print {
            body { padding: 0; }
            .page-break { padding: 15px; }
          }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 300);
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <ClipboardList size={13} className="text-amber-600" />
          <span className="text-xs text-amber-800">
            领料申请页 · 生产/维修/保养/报废统一发起 · 主管审核后推送仓库执行出库
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">领料申请</h1>
              <p className="text-[11px] text-gray-500">生产领用 / 维修领料 / 保养领料 / 报废处置</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-[11px] text-gray-400">待审核</div>
              <div className="text-lg font-bold text-red-500">{pendingCount}</div>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              新建领料
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 shrink-0 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? `border-${tab.color}-500 text-${tab.color}-600`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                activeTab === tab.key ? `bg-${tab.color}-100 text-${tab.color}-600` : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.key === 'all'
                  ? MOCK_DATA.length
                  : MOCK_DATA.filter((o) => o.type === tab.key).length}
              </span>
              {tabPendingCount(tab.key) > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {tabPendingCount(tab.key)}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="领料单号 / 模具编号 / 模具名称"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-64 focus:outline-none focus:border-purple-400 bg-gray-50"
            />
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-purple-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '来源仓库'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部仓库</option>
              {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>

          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-28 cursor-pointer hover:border-purple-300 bg-gray-50">
              <span className={statusFilter ? 'text-gray-700' : 'text-gray-400'}>{statusFilter || '单据状态'}</span>
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="">全部状态</option>
              <option value="待审核">待审核</option>
              <option value="已审核待出库">已审核待出库</option>
              <option value="已出库">已出库</option>
              <option value="已驳回">已驳回</option>
              <option value="已取消">已取消</option>
            </select>
          </div>

          <button
            onClick={() => { setSearch(''); setWarehouseFilter(''); setStatusFilter('') }}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded px-2.5 py-1.5 hover:bg-gray-50 bg-white"
          >
            <RotateCcw size={11} /> 重置
          </button>

          <div className="ml-auto text-[11px] text-gray-400">
            共 <span className="text-gray-600 font-medium">{filtered.length}</span> 条记录
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">领料单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">领料类型</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">物料</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">来源仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">流向</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">物料数</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">申请人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">申请时间</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">状态</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-16 text-center text-gray-400">暂无领料申请</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-purple-600 font-medium cursor-pointer hover:underline" onClick={() => setDetail(row)}>
                          {row.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${TYPE_META[row.type].bg} ${TYPE_META[row.type].text}`}>
                          {TYPE_META[row.type].icon}
                          {row.typeLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          {(row.items || []).slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              {item.moldId && <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[10px]">{item.moldId}</span>}
                              <span className="text-gray-800">{item.moldName}</span>
                              <span className="text-gray-500 text-[10px]">×{item.qty}</span>
                            </div>
                          ))}
                          {(row.items || []).length > 2 && (
                            <div className="text-[11px] text-gray-400">+{(row.items || []).length - 2} 种物料...</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{row.fromWarehouse}</td>
                      <td className="px-3 py-2.5 text-gray-500">{row.toLocation}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700 font-medium">{(row.items || []).length}种</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.applicant}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.applyTime}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[row.status]?.bg} ${STATUS_COLORS[row.status]?.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[row.status]?.dot} ${row.status === '待审核' ? 'animate-pulse' : ''}`} />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {row.status === '待审核' && (
                            <>
                              <button
                                onClick={() => {
                                  if (!confirm(`确认审核通过该领料申请？\n\n单号：${row.id}\n物料数：${row.items.length}种\n\n点击确认后将推送至仓库执行出库。`)) return
                                  alert('审核通过，已推送至仓库执行出库')
                                }}
                                className="flex items-center gap-0.5 text-[11px] text-green-600 hover:text-white px-1.5 py-0.5 rounded bg-green-50 hover:bg-green-500 border border-green-200 transition-colors"
                              >
                                <ClipboardList size={10} /> 通过
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('请输入驳回原因：')
                                  if (reason === null) return
                                  if (!reason.trim()) { alert('请输入驳回原因'); return }
                                  alert(`已驳回，原因：${reason}`)
                                }}
                                className="flex items-center gap-0.5 text-[11px] text-red-600 hover:text-white px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-500 border border-red-200 transition-colors"
                              >
                                <X size={10} /> 驳回
                              </button>
                            </>
                          )}
                          {row.status !== '待审核' && (
                            <button
                              onClick={() => setDetail(row)}
                              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-purple-600 px-1.5 py-0.5 rounded hover:bg-purple-50"
                            >
                              <Eye size={11} /> 详情
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showNew && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowNew(false)}>
            <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">新建领料申请</span>
                </div>
                <button onClick={() => { setShowNew(false); setForm(emptyForm) }} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[12px]">
                <div>
                  <label className="block text-gray-600 mb-1.5">
                    领料类型 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-purple-300">
                      <span className={form.type ? 'text-gray-800' : 'text-gray-400'}>
                        {form.type ? TYPE_META[form.type as PickingType].label : '请选择领料类型'}
                      </span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </button>
                    <select
                      value={form.type}
                      onChange={(e) => handleTypeChange(e.target.value as PickingType)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      <option value="">请选择领料类型</option>
                      {Object.entries(TYPE_META).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1.5">
                      来源仓库 <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <button className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-purple-300">
                        <span className={form.fromWarehouse ? 'text-gray-800' : 'text-gray-400'}>
                          {form.fromWarehouse || '请选择仓库'}
                        </span>
                        <ChevronDown size={12} className="text-gray-400" />
                      </button>
                      <select
                        value={form.fromWarehouse}
                        onChange={(e) => setForm({ ...form, fromWarehouse: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      >
                        <option value="">请选择仓库</option>
                        {WAREHOUSE_LIST.map((w) => <option key={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5">
                      流向 / 使用地点
                    </label>
                    <input
                      value={form.toLocation}
                      onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
                      placeholder="如：冲压车间-A线-01号机"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-purple-400 bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-600">
                      物料明细 <span className="text-red-400">*</span>
                    </label>
                    <button
                      onClick={() => {
                        const newId = String(form.items.length + 1)
                        setForm({ ...form, items: [...form.items, { id: newId, moldId: '', moldName: '', itemNo: '', spec: '', qty: 1, unit: '件' }] })
                      }}
                      className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700"
                    >
                      <Plus size={11} /> 添加物料
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.items.map((item, idx) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-gray-400 font-medium">物料 {idx + 1}</span>
                          {form.items.length > 1 && (
                            <button
                              onClick={() => setForm({ ...form, items: form.items.filter(i => i.id !== item.id) })}
                              className="text-[10px] text-red-500 hover:text-red-700"
                            >
                              删除
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">品名/模具名称</label>
                            <input
                              value={item.moldName}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], moldName: e.target.value }
                                setForm({ ...form, items: newItems })
                              }}
                              placeholder="品名"
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">品号</label>
                            <input
                              value={item.itemNo}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], itemNo: e.target.value }
                                setForm({ ...form, items: newItems })
                              }}
                              placeholder="编码"
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">规格型号</label>
                            <input
                              value={item.spec}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], spec: e.target.value }
                                setForm({ ...form, items: newItems })
                              }}
                              placeholder="规格"
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">模具编号</label>
                            <input
                              value={item.moldId}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], moldId: e.target.value }
                                setForm({ ...form, items: newItems })
                              }}
                              placeholder="选填"
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">数量</label>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], qty: Number(e.target.value) }
                                setForm({ ...form, items: newItems })
                              }}
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 text-[10px] mb-0.5">单位</label>
                            <input
                              value={item.unit}
                              onChange={(e) => {
                                const newItems = [...form.items]
                                newItems[idx] = { ...newItems[idx], unit: e.target.value }
                                setForm({ ...form, items: newItems })
                              }}
                              placeholder="件"
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1.5">
                    关联源单号
                  </label>
                  <input
                    value={form.sourceOrderNo}
                    onChange={(e) => setForm({ ...form, sourceOrderNo: e.target.value })}
                    placeholder="工单/维修单/保养单/报废单号"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-purple-400 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1.5">备注</label>
                  <textarea
                    value={form.remark}
                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                    rows={2}
                    placeholder="如有特殊情况请备注"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-purple-400 bg-gray-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={() => { setShowNew(false); setForm(emptyForm) }}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.type || !form.fromWarehouse || !form.items.some(item => item.moldName)}
                  className="px-4 py-1.5 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={13} /> 提交申请
                </button>
              </div>
            </div>
          </div>
        )}

        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-[580px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">领料单详情</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[detail.status]?.bg} ${STATUS_COLORS[detail.status]?.text}`}>
                    {detail.status}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <FileText size={13} className="text-gray-400" /> 单据信息
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">领料单号</span>
                      <span className="text-purple-600 font-medium">{detail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">领料类型</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${TYPE_META[detail.type].bg} ${TYPE_META[detail.type].text}`}>
                        {detail.typeLabel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">源单号</span>
                      <span className="text-gray-800 font-mono">{detail.sourceOrderNo || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">申请时间</span>
                      <span className="text-gray-600">{detail.applyTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">申请人</span>
                      <span className="text-gray-700">{detail.applicant}</span>
                    </div>
                    {detail.auditor && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">审核人</span>
                        <span className="text-gray-700">{detail.auditor}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Package size={13} className="text-gray-400" /> 物料明细
                    <span className="text-gray-400 font-normal">（{(detail.items || []).length}种）</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-medium text-gray-500">品名</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">品号</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">规格型号</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">模具编号</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500">数量</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">单位</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">仓库</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items || []).map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 text-gray-800">{item.moldName}</td>
                            <td className="px-3 py-2 text-gray-600 font-mono">{item.itemNo}</td>
                            <td className="px-3 py-2 text-gray-600">{item.spec}</td>
                            <td className="px-3 py-2 text-gray-600 font-mono">{item.moldId || '—'}</td>
                            <td className="px-3 py-2 text-right text-gray-800 font-medium">{item.qty}</td>
                            <td className="px-3 py-2 text-gray-600">{item.unit}</td>
                            <td className="px-3 py-2 text-gray-600">{item.fromWarehouse}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Factory size={13} className="text-gray-400" /> 仓储流向
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2.5 gap-x-6 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">来源仓库</span>
                      <span className="text-gray-800 font-medium">{detail.fromWarehouse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">流向</span>
                      <span className="text-gray-700">{detail.toLocation}</span>
                    </div>
                  </div>
                </div>

                {detail.remark && (
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">备注</h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-[12px] text-gray-600">{detail.remark}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button
                  onClick={handlePrintPicking}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white flex items-center gap-1"
                >
                  <Printer size={13} /> 打印申请单
                </button>
                <button
                  onClick={() => setDetail(null)}
                  className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white"
                >
                  关闭
                </button>
                {detail.status === '待审核' && (
                  <>
                    <button
                      onClick={() => handleAudit(detail.id, false)}
                      className="px-4 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 font-medium"
                    >
                      驳回
                    </button>
                    <button
                      onClick={() => handleAudit(detail.id, true)}
                      className="px-4 py-1.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded font-medium flex items-center gap-1"
                    >
                      审核通过
                    </button>
                  </>
                )}
                {detail.status === '已审核待出库' && (
                  <button
                    onClick={() => {
                      if (!confirm(`确认出库该领料申请？\n\n单号：${detail.id}\n物料数：${(detail.items || []).length}种\n\n点击确认后将执行发料。`)) return
                      alert('出库成功！物料已发放，工单领料任务已完成。')
                      setDetail(null)
                    }}
                    className="px-4 py-1.5 text-sm text-white bg-cyan-600 hover:bg-cyan-700 rounded font-medium flex items-center gap-1"
                  >
                    <Package size={13} /> 确认发料
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
