'use client'

import { useState, useMemo } from 'react'
import { Search, RotateCcw, Pause, CheckCircle, Clock, FileText, X, User, Package, RefreshCw, AlertTriangle, Plus, Minus, ShoppingCart, Check, SkipForward, Printer, QrCode, Info, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type ExecStatus = '进行中' | '暂停' | '待检验' | '已完成' | '委外中' | '待发料' | '待领料'
type ProcessOutsourceType = '全部自制' | '部分委外' | '全部委外'

interface BomItem {
  code: string
  name: string
  spec: string
  unit: string
  qty: number
  warehouse: string
  selected?: boolean
  selectedQty?: number
}

// 委外记录
interface OutsourceRecord {
  id: string
  outNo: string
  qty: number
  vendor: string
  planSendDate: string
  planReturnDate: string
  processReq: string
  remark: string
  createTime: string
  creator: string
  status: '已发委外' | '委外中' | '已到货' | '已检验'
  arrivedQty: number
  qualifiedQty: number
  defectiveQty: number
  // 合并委外专用字段（可选）
  mergedOutNo?: string  // 合并委外单号
  processList?: Array<{
    processCode: string
    processName: string
    totalQty: number
    outsourceQty: number
    arrivedQty: number
    qualifiedQty: number
    defectiveQty: number
  }>
}

// 报工记录
interface ReportRecord {
  id: string
  qty: number
  defectiveQty?: number
  type: '本厂报工' | '委外报工'
  createTime: string
  creator: string
}

interface MergedOutsourceProcessDetail {
  code: string
  name: string
  totalQty: number
  outsourceQty: number
  arrivedQty: number
  qualifiedQty: number
  defectiveQty: number
  processRemark: string
}

interface MergedOutsourceArrivalRecord {
  id: string
  processCode: string
  qty: number
  qualifiedQty: number
  defectiveQty: number
  arriveTime: string
  handler: string
}

interface MergedOutsourceRecord {
  id: string
  mergedOutNo: string
  woNo: string
  vendor: string
  planSendDate: string
  planReturnDate: string
  processReq: string
  remark: string
  status: '已发委外' | '委外中' | '部分到货' | '全部到货'
  processList: MergedOutsourceProcessDetail[]
  createTime: string
  creator: string
  arrivalRecords: MergedOutsourceArrivalRecord[]
}

interface FieldTask {
  id: string
  taskNo: string
  woNo: string
  moldCode: string
  moldName: string
  processName: string
  processSeq: string
  workCenter: string
  planHours: number
  assignee: string
  woIssuer: string
  startTime: string
  endTime: string
  status: ExecStatus
  isOutsource: boolean      // 当前任务是否是委外任务（委外工序）
  canOutsource: boolean     // 工艺路径中是否允许委外（新增字段）
  isInspect: boolean
  isReWork: boolean
  actualHours: number
  completedQty: number
  remark: string
  outsourceVendor?: string
  outsourceProgress?: number
  // 新增：数量管理字段
  planQty: number           // 工单总计划数量
  outsourceQty: number      // 本工序已委外数量
  reportedQty: number       // 本工序已累计报工数量
  outsourceType: ProcessOutsourceType  // 委外类型标识
  outsourceRecords?: OutsourceRecord[]  // 历次委外记录
  reportRecords?: ReportRecord[]        // 历次报工记录
  mergedOutNo?: string      // 合并委外单号（若属于合并委外）
  isMergedOutsource?: boolean  // 是否合并委外工序
}

const STATUS_STYLES: Record<ExecStatus, { bar: string; badge: string }> = {
  '进行中': { bar: 'bg-[#1e5fa8]', badge: 'bg-blue-100 text-blue-700' },
  '暂停':   { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  '待检验': { bar: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700' },
  '已完成': { bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  '委外中': { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
  '待发料': { bar: 'bg-cyan-400', badge: 'bg-cyan-100 text-cyan-700' },
  '待领料': { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' },
}

const MATERIAL_LIBRARY: BomItem[] = [
  { code: 'M-001', name: '模具钢料', spec: 'Cr12MoV φ80×120', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-002', name: '模具钢料', spec: 'Cr12MoV φ70×100', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-003', name: '模具钢料', spec: 'SKD11 φ60×100', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-004', name: '模具钢料', spec: 'SKD11 φ50×80', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-005', name: '模具钢料', spec: 'SKD61 150×100×80', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-006', name: '下模板坯料', spec: '45#钢 400×300×50', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-007', name: '垫板', spec: '45#钢 200×150×20', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-008', name: '垫板', spec: '45#钢 180×120×15', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-009', name: '凸模坯料', spec: 'Cr12MoV φ50×80', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-010', name: '凹模坯料', spec: 'Cr12MoV φ70×100', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-011', name: '斜楔座坯料', spec: 'Cr12MoV 200×150×100', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-012', name: '斜楔滑板', spec: '铜合金 100×50×10', unit: '件', qty: 1, warehouse: '备料仓' },
  { code: 'M-013', name: '弹簧', spec: 'φ10×50 65Mn', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-014', name: '弹簧', spec: 'φ8×40 65Mn', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-015', name: '弹簧', spec: 'φ12×60 65Mn', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-016', name: '弹簧', spec: 'φ16×80 65Mn', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-017', name: '氮气弹簧', spec: 'KSN500', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-018', name: '内六角螺栓', spec: 'M6×25 12.9级', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-019', name: '内六角螺栓', spec: 'M8×30 12.9级', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-020', name: '内六角螺栓', spec: 'M8×25 12.9级', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-021', name: '内六角螺栓', spec: 'M10×40 12.9级', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-022', name: '内六角螺栓', spec: 'M12×60 12.9级', unit: '个', qty: 1, warehouse: '标准件仓' },
  { code: 'M-023', name: '导柱导套', spec: 'φ25×100', unit: '套', qty: 1, warehouse: '标准件仓' },
  { code: 'M-024', name: '导柱导套', spec: 'φ32×150', unit: '套', qty: 1, warehouse: '标准件仓' },
  { code: 'M-025', name: '顶针', spec: 'φ6×150 SKH51', unit: '支', qty: 1, warehouse: '标准件仓' },
  { code: 'M-026', name: '冷却接头', spec: 'PT1/4', unit: '个', qty: 1, warehouse: '标准件仓' },
]

// 按工单定义完整的工艺路径（模拟ERP工艺路线）
const WORK_ORDER_ROUTES: Record<string, {
  woNo: string
  moldCode: string
  moldName: string
  itemNo: string
  woIssuer: string
  planQty: number  // 工单总计划数量
  processes: { code: string; name: string; hours: number; workCenter: string; isOutsource?: boolean; isInspect?: boolean }[]
}> = {
  'WO-2024-001': {
    woNo: 'WO-2024-001',
    moldCode: '190038',
    moldName: '7686SO三工位成形凹模',
    itemNo: '60004712402104',
    woIssuer: '钳工A',
    planQty: 10,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '钳工', hours: 4, workCenter: '钳工车间' },
      { code: '0030', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0040', name: '精车', hours: 4, workCenter: '车床区' },
      { code: '0050', name: '线切割', hours: 3, workCenter: '线切割' },
      { code: '0060', name: '平面磨', hours: 3, workCenter: '磨床区' },
      { code: '0070', name: '精铣', hours: 6, workCenter: '加工中心02' },
      { code: '0080', name: '抛光', hours: 2, workCenter: '抛光区' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-002': {
    woNo: 'WO-2024-002',
    moldCode: '26015',
    moldName: 'Y587成形凹模',
    itemNo: '60022212402005',
    woIssuer: '钳工B',
    planQty: 8,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '钳工', hours: 4, workCenter: '钳工车间' },
      { code: '0030', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0040', name: '线切割', hours: 3, workCenter: '线切割' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-003': {
    woNo: 'WO-2024-003',
    moldCode: '190041',
    moldName: '7686SO成形凹模',
    itemNo: '60004712402030',
    woIssuer: '钳工C',
    planQty: 6,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '钳工', hours: 4, workCenter: '钳工车间' },
      { code: '0030', name: '精车', hours: 4, workCenter: '车床区' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-004': {
    woNo: 'WO-2024-004',
    moldCode: '45021',
    moldName: '1850L下模仁',
    itemNo: '60005212402108',
    woIssuer: '钳工A',
    planQty: 12,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 6, workCenter: '加工中心01' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '精铣', hours: 4, workCenter: '加工中心02' },
      { code: '0040', name: '线切割', hours: 3, workCenter: '线切割' },
      { code: '0050', name: '平面磨', hours: 2, workCenter: '磨床区' },
      { code: '0060', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-005': {
    woNo: 'WO-2024-005',
    moldCode: '33089',
    moldName: 'X200成型凸模',
    itemNo: '60003312402115',
    woIssuer: '钳工A',
    planQty: 5,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '车削', hours: 5, workCenter: '车床区' },
      { code: '0020', name: '铣外形', hours: 4, workCenter: '铣床区' },
      { code: '0030', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0040', name: '精车', hours: 3, workCenter: '车床区' },
      { code: '0050', name: '磨平面', hours: 2, workCenter: '磨床区' },
      { code: '0060', name: '钳工', hours: 3, workCenter: '钳工车间' },
      { code: '0070', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-006': {
    woNo: 'WO-2024-006',
    moldCode: '51002',
    moldName: '7686斜楔机构',
    itemNo: '60005112402088',
    woIssuer: '钳工B',
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '铣斜面', hours: 5, workCenter: '铣床区' },
      { code: '0030', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0040', name: '精铣', hours: 6, workCenter: '加工中心02' },
      { code: '0050', name: '线切割', hours: 4, workCenter: '线切割' },
      { code: '0060', name: '抛光', hours: 2, workCenter: '抛光区' },
      { code: '0070', name: '钳工', hours: 3, workCenter: '钳工车间' },
      { code: '0080', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-007': {
    woNo: 'WO-2024-007',
    moldCode: '28015',
    moldName: 'Y580下模板',
    itemNo: '60002812402102',
    woIssuer: '钳工C',
    planQty: 8,
    processes: [
      { code: '0000', name: '领料', hours: 1, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 10, workCenter: '加工中心01' },
      { code: '0020', name: '铣槽', hours: 4, workCenter: '铣床区' },
      { code: '0030', name: '钻孔', hours: 3, workCenter: '钻床区' },
      { code: '0040', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0050', name: '精铣', hours: 6, workCenter: '加工中心02' },
      { code: '0060', name: '磨平面', hours: 3, workCenter: '磨床区' },
      { code: '0070', name: '钳工', hours: 4, workCenter: '钳工车间' },
      { code: '0080', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  // 钳工A的工单 - 各种状态补充
  'WO-2024-008': {
    woNo: 'WO-2024-008',
    moldCode: '62001',
    moldName: '7686SO上模座',
    itemNo: '60006212402001',
    woIssuer: '钳工A',
    planQty: 4,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 6, workCenter: '加工中心01' },
      { code: '0020', name: '精铣', hours: 4, workCenter: '加工中心02' },
      { code: '0030', name: '钳工', hours: 3, workCenter: '钳工车间' },
      { code: '0040', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-009': {
    woNo: 'WO-2024-009',
    moldCode: '35012',
    moldName: 'X300冲头',
    itemNo: '60003512402088',
    woIssuer: '钳工A',
    planQty: 20,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '车削', hours: 4, workCenter: '车床区' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '磨外圆', hours: 3, workCenter: '磨床区' },
      { code: '0040', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-010': {
    woNo: 'WO-2024-010',
    moldCode: '48033',
    moldName: '5600T下模固定板',
    itemNo: '60004812402015',
    woIssuer: '钳工A',
    planQty: 2,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 12, workCenter: '加工中心01' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '精铣', hours: 8, workCenter: '加工中心02' },
      { code: '0040', name: '平面磨', hours: 4, workCenter: '磨床区' },
      { code: '0050', name: '线切割', hours: 6, workCenter: '线切割' },
      { code: '0060', name: '钳工', hours: 6, workCenter: '钳工车间' },
      { code: '0070', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-011': {
    woNo: 'WO-2024-011',
    moldCode: '71008',
    moldName: '3800T脱料板',
    itemNo: '60007112402003',
    woIssuer: '钳工A',
    planQty: 3,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '精铣', hours: 6, workCenter: '加工中心02' },
      { code: '0030', name: '线切割', hours: 4, workCenter: '线切割' },
      { code: '0040', name: '钳工', hours: 5, workCenter: '钳工车间' },
      { code: '0050', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-012': {
    woNo: 'WO-2024-012',
    moldCode: '55021',
    moldName: '6300T上模垫板',
    itemNo: '60005512402012',
    woIssuer: '钳工A',
    planQty: 6,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 10, workCenter: '加工中心01' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '平面磨', hours: 3, workCenter: '磨床区' },
      { code: '0040', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-013': {
    woNo: 'WO-2024-013',
    moldCode: '66015',
    moldName: '8500T下模座',
    itemNo: '60006612402008',
    woIssuer: '钳工A',
    planQty: 1,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 15, workCenter: '加工中心01' },
      { code: '0020', name: '精铣', hours: 10, workCenter: '加工中心02' },
      { code: '0030', name: '钳工', hours: 8, workCenter: '钳工车间' },
      { code: '0040', name: '最终检验', hours: 2, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-014': {
    woNo: 'WO-2024-014',
    moldCode: '77003',
    moldName: '5200T卸料板',
    itemNo: '60007712402015',
    woIssuer: '钳工A',
    planQty: 2,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '激光切割', hours: 2, workCenter: '激光区' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '精铣', hours: 6, workCenter: '加工中心01' },
      { code: '0040', name: '钳工', hours: 4, workCenter: '钳工车间' },
      { code: '0050', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  'WO-2024-015': {
    woNo: 'WO-2024-015',
    moldCode: '91002',
    moldName: '7200T上模板',
    itemNo: '60009112402010',
    woIssuer: '钳工A',
    planQty: 5,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗铣', hours: 8, workCenter: '加工中心01' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '精铣', hours: 6, workCenter: '加工中心02', isOutsource: true },
      { code: '0040', name: '钳工', hours: 5, workCenter: '钳工车间', isOutsource: true },
      { code: '0050', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
  // 测试合并委外场景：连续3道委外工序合并发给同一供应商
  'WO-2024-016': {
    woNo: 'WO-2024-016',
    moldCode: '92001',
    moldName: '850T压铸模镶件',
    itemNo: '60009112403001',
    woIssuer: '钳工A',
    planQty: 8,
    processes: [
      { code: '0000', name: '领料', hours: 0.5, workCenter: '仓库' },
      { code: '0010', name: '粗加工', hours: 4, workCenter: '加工中心01' },
      { code: '0020', name: '热处理', hours: 24, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '表面处理', hours: 12, workCenter: '委外', isOutsource: true },
      { code: '0040', name: '精加工', hours: 8, workCenter: '委外', isOutsource: true },
      { code: '0050', name: '钳工研配', hours: 6, workCenter: '钳工车间' },
      { code: '0060', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ]
  },
}

// 每个工单的当前进度
const WO_PROGRESS: Record<string, {
  completedUpTo: number
  currentActive: number
  outsourceCreated: boolean
  paused: boolean
  pickingRequested: boolean  // 领料是否已申请
  extraTasks: FieldTask[]
  // 按工序存储数量和记录
  processData: Record<string, {
    outsourceQty: number      // 本工序已委外数量
    reportedQty: number       // 本工序已报工数量
    outsourceType: ProcessOutsourceType  // 委外类型
    outsourceRecords: OutsourceRecord[]  // 历次委外记录
    reportRecords: ReportRecord[]        // 历次报工记录
  }>
}> = {
  'WO-2024-001': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 10, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 10, type: '本厂报工', createTime: '2024-06-20 10:00', creator: '钳工A' }] },
    },
  },
  'WO-2024-002': {
    completedUpTo: -1,
    currentActive: 0,
    outsourceCreated: false,
    paused: false,
    pickingRequested: false,
    extraTasks: [],
    processData: {},
  },
  'WO-2024-003': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [
      {
        id: 'T003-R1', taskNo: 'TK-2024-003-R1', woNo: 'WO-2024-003',
        moldCode: '190041', moldName: '7686SO成形凹模',
        processName: '粗铣（返工1）', processSeq: '0010',
        workCenter: '加工中心01', planHours: 2,
        assignee: '钳工C', woIssuer: '钳工C',
        startTime: '2024-06-22 09:00', endTime: '2024-06-22 11:00',
        status: '已完成', isOutsource: false, canOutsource: false, isInspect: false, isReWork: true,
        actualHours: 2.0, completedQty: 1, remark: '首件尺寸超差返工',
        planQty: 6, outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制',
      },
      {
        id: 'T003-IP1', taskNo: 'TK-2024-003-IP1', woNo: 'WO-2024-003',
        moldCode: '190041', moldName: '7686SO成形凹模',
        processName: '粗铣（检验1）', processSeq: '0010',
        workCenter: '质检', planHours: 1,
        assignee: '质检组', woIssuer: '钳工C',
        startTime: '2024-06-22 14:00', endTime: '',
        status: '待检验', isOutsource: false, canOutsource: false, isInspect: true, isReWork: false,
        actualHours: 0.5, completedQty: 1, remark: '首件检验',
        planQty: 6, outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制',
      },
    ],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 6, type: '本厂报工', createTime: '2024-06-21 09:00', creator: '钳工C' }] },
      '0010': { outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 6, type: '本厂报工', createTime: '2024-06-21 15:00', creator: '钳工C' }] },
    },
  },
  // 钳工A的工单
  'WO-2024-004': {
    completedUpTo: -1,
    currentActive: 0,
    outsourceCreated: false,
    paused: false,
    pickingRequested: false,
    extraTasks: [],
    processData: {},
  },
  'WO-2024-005': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 5, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 5, type: '本厂报工', createTime: '2024-06-22 08:00', creator: '钳工A' }] },
    },
  },
  // 钳工B的工单
  'WO-2024-006': {
    completedUpTo: -1,
    currentActive: 0,
    outsourceCreated: false,
    paused: false,
    pickingRequested: false,
    extraTasks: [],
    processData: {},
  },
  // 钳工C的工单
  'WO-2024-007': {
    completedUpTo: 2,
    currentActive: 3,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 8, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 8, type: '本厂报工', createTime: '2024-06-20 09:00', creator: '钳工C' }] },
      '0010': { outsourceQty: 0, reportedQty: 8, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 8, type: '本厂报工', createTime: '2024-06-20 14:00', creator: '钳工C' }] },
      '0020': { outsourceQty: 0, reportedQty: 8, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 8, type: '本厂报工', createTime: '2024-06-21 10:00', creator: '钳工C' }] },
    },
  },
  // 钳工A - 待发料状态（领料已申请，等待仓库发料）
  'WO-2024-008': {
    completedUpTo: -1,
    currentActive: 0,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {},
  },
  // 钳工A - 进行中状态（普通工序）
  'WO-2024-009': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 20, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 20, type: '本厂报工', createTime: '2024-06-25 09:00', creator: '钳工A' }] },
    },
  },
  // 钳工A - 暂停状态
  'WO-2024-010': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: false,
    paused: true,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 2, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 2, type: '本厂报工', createTime: '2024-06-26 08:00', creator: '钳工A' }] },
    },
  },
  // 钳工A - 委外中状态
  'WO-2024-011': {
    completedUpTo: 2,
    currentActive: 3,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 3, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 3, type: '本厂报工', createTime: '2024-06-23 10:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 3, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 3, type: '本厂报工', createTime: '2024-06-24 09:00', creator: '钳工A' }] },
      '0020': { outsourceQty: 0, reportedQty: 3, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 3, type: '本厂报工', createTime: '2024-06-25 14:00', creator: '钳工A' }] },
    },
  },
  // 钳工A - 待检验状态（末道检验）
  'WO-2024-012': {
    completedUpTo: 3,
    currentActive: 4,
    outsourceCreated: true,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 6, type: '本厂报工', createTime: '2024-06-22 09:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 6, type: '本厂报工', createTime: '2024-06-23 15:00', creator: '钳工A' }] },
      '0020': { outsourceQty: 6, reportedQty: 6, outsourceType: '全部委外', outsourceRecords: [{ id: 'OS-002', outNo: 'OUT-2024-002', qty: 6, vendor: '精工热处理厂', planSendDate: '2024-06-24', planReturnDate: '2024-06-30', processReq: '淬火+低温回火，硬度HRC45-50', remark: '', createTime: '2024-06-24 10:00', creator: '钳工A', status: '已到货', arrivedQty: 6, qualifiedQty: 5, defectiveQty: 1 }], reportRecords: [{ id: 'R1', qty: 6, type: '委外报工', createTime: '2024-06-26 09:00', creator: '钳工A' }] },
      '0030': { outsourceQty: 0, reportedQty: 6, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 6, type: '本厂报工', createTime: '2024-06-27 10:00', creator: '钳工A' }] },
    },
  },
  // 钳工A - 已完成状态（全部完工）
  'WO-2024-013': {
    completedUpTo: 4,
    currentActive: -1,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2024-06-18 09:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2024-06-19 16:00', creator: '钳工A' }] },
      '0020': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2024-06-21 10:00', creator: '钳工A' }] },
      '0030': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2024-06-24 14:00', creator: '钳工A' }] },
      '0040': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2024-06-25 10:00', creator: '钳工A' }] },
    },
  },
  // 钳工A - 委外中状态（当前工序委外中）
  'WO-2024-014': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: true,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 2, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 2, type: '本厂报工', createTime: '2024-06-26 09:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 2, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 2, type: '本厂报工', createTime: '2024-06-26 14:00', creator: '钳工A' }] },
      '0020': { outsourceQty: 2, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{ id: 'OS-003', outNo: 'OUT-2024-003', qty: 2, vendor: '恒辉热处理有限公司', planSendDate: '2024-06-27', planReturnDate: '2024-07-03', processReq: '调质处理HB260-290', remark: '', createTime: '2024-06-27 10:00', creator: '钳工A', status: '委外中', arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 }], reportRecords: [] },
    },
  },
  // 钳工A - 进行中状态（当前工序是委外工序-热处理，未发起委外）
  'WO-2024-015': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: false,
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 5, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 5, type: '本厂报工', createTime: '2024-06-27 08:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 5, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 5, type: '本厂报工', createTime: '2024-06-27 14:00', creator: '钳工A' }] },
    },
  },
  // 测试合并委外：已发起合并委外（3道工序合并发给同一供应商）
  'WO-2024-016': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: true, // 标记已发起委外
    paused: false,
    pickingRequested: true,
    extraTasks: [],
    processData: {
      '0000': { outsourceQty: 0, reportedQty: 8, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 8, type: '本厂报工', createTime: '2024-06-28 09:00', creator: '钳工A' }] },
      '0010': { outsourceQty: 0, reportedQty: 8, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 8, type: '本厂报工', createTime: '2024-06-28 15:00', creator: '钳工A' }] },
      '0020': { outsourceQty: 8, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{
        id: 'MO1',
        outNo: 'MERGE-OUT-2024-0001',
        qty: 8,
        vendor: '精工热处理厂',
        planSendDate: '2024-06-29',
        planReturnDate: '2024-07-15',
        processReq: '硬度HRC58-62，表面镀硬铬',
        remark: '合并委外：热处理+表面处理+精加工',
        createTime: '2024-06-28 16:00',
        creator: '钳工A',
        status: '已发委外',
        arrivedQty: 0,
        qualifiedQty: 0,
        defectiveQty: 0,
        mergedOutNo: 'MERGE-OUT-2024-0001',
        processList: [
          { processCode: '0020', processName: '热处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0030', processName: '表面处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0040', processName: '精加工', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
        ],
      }], reportRecords: [] },
      '0030': { outsourceQty: 8, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{
        id: 'MO1',
        outNo: 'MERGE-OUT-2024-0001',
        qty: 8,
        vendor: '精工热处理厂',
        planSendDate: '2024-06-29',
        planReturnDate: '2024-07-15',
        processReq: '硬度HRC58-62，表面镀硬铬',
        remark: '合并委外：热处理+表面处理+精加工',
        createTime: '2024-06-28 16:00',
        creator: '钳工A',
        status: '已发委外',
        arrivedQty: 0,
        qualifiedQty: 0,
        defectiveQty: 0,
        mergedOutNo: 'MERGE-OUT-2024-0001',
        processList: [
          { processCode: '0020', processName: '热处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0030', processName: '表面处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0040', processName: '精加工', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
        ],
      }], reportRecords: [] },
      '0040': { outsourceQty: 8, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{
        id: 'MO1',
        outNo: 'MERGE-OUT-2024-0001',
        qty: 8,
        vendor: '精工热处理厂',
        planSendDate: '2024-06-29',
        planReturnDate: '2024-07-15',
        processReq: '硬度HRC58-62，表面镀硬铬',
        remark: '合并委外：热处理+表面处理+精加工',
        createTime: '2024-06-28 16:00',
        creator: '钳工A',
        status: '已发委外',
        arrivedQty: 0,
        qualifiedQty: 0,
        defectiveQty: 0,
        mergedOutNo: 'MERGE-OUT-2024-0001',
        processList: [
          { processCode: '0020', processName: '热处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0030', processName: '表面处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
          { processCode: '0040', processName: '精加工', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 },
        ],
      }], reportRecords: [] },
    },
  },
}

const CURRENT_USER = '钳工A'
const IS_ADMIN = CURRENT_USER === 'ADMIN'

export default function FieldExecutionPage() {
  const [progressMap, setProgressMap] = useState(WO_PROGRESS)
  const [extraTasksMap, setExtraTasksMap] = useState<Record<string, FieldTask[]>>(() => {
    const map: Record<string, FieldTask[]> = {}
    Object.entries(WO_PROGRESS).forEach(([woNo, prog]) => {
      map[woNo] = prog.extraTasks || []
    })
    return map
  })

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ExecStatus | ''>('')
  const [onlyMine, setOnlyMine] = useState(true)
  const [detail, setDetail] = useState<FieldTask | null>(null)
  const [reportModal, setReportModal] = useState<FieldTask | null>(null)
  const [reportForm, setReportForm] = useState({ actualHours: '', completedQty: '', defectiveQty: '', remark: '', reportType: '本厂报工' as '本厂报工' | '委外报工' })
  const [outsourceModal, setOutsourceModal] = useState<FieldTask | null>(null)
  const [outsourceForm, setOutsourceForm] = useState({
    qty: '',
    vendor: '精工热处理厂',
    planSendDate: '',
    planReturnDate: '',
    processReq: '',
    remark: '',
  })
  // 连续委外弹窗
  const [showMultiOutsourceModal, setShowMultiOutsourceModal] = useState(false)
  const [multiOutsourceTask, setMultiOutsourceTask] = useState<FieldTask | null>(null)
  const [multiOutsourceForm, setMultiOutsourceForm] = useState({
    vendor: '精工热处理厂',
    planSendDate: '',
    planReturnDate: '',
    outsourceQty: 0,
    totalQty: 0,
    processReq: '',
    remark: '',
    processList: [] as { processCode: string; processName: string; totalQty: number; selected: boolean }[],
  })
  const [pickingModal, setPickingModal] = useState<FieldTask | null>(null)
  const [pickingItems, setPickingItems] = useState<BomItem[]>([])
  const [pickingSearch, setPickingSearch] = useState('')
  const [expandedRecords, setExpandedRecords] = useState<{ outsource: boolean; report: boolean }>({ outsource: false, report: false })

  const statusTabs = [
    { label: '全部', color: 'text-gray-700', bar: 'bg-gray-400', key: '', activeBg: 'bg-gray-100', activeRing: 'ring-gray-300' },
    { label: '待领料', color: 'text-slate-700', bar: 'bg-slate-400', key: '待领料', activeBg: 'bg-slate-50', activeRing: 'ring-slate-300' },
    { label: '待发料', color: 'text-cyan-700', bar: 'bg-cyan-400', key: '待发料', activeBg: 'bg-cyan-50', activeRing: 'ring-cyan-300' },
    { label: '进行中', color: 'text-blue-700', bar: 'bg-[#1e5fa8]', key: '进行中', activeBg: 'bg-[#1e5fa8]/10', activeRing: 'ring-[#1e5fa8]/40' },
    { label: '暂停', color: 'text-yellow-700', bar: 'bg-yellow-400', key: '暂停', activeBg: 'bg-yellow-50', activeRing: 'ring-yellow-300' },
    { label: '待检验', color: 'text-purple-700', bar: 'bg-purple-400', key: '待检验', activeBg: 'bg-purple-50', activeRing: 'ring-purple-300' },
    { label: '委外中', color: 'text-amber-700', bar: 'bg-amber-400', key: '委外中', activeBg: 'bg-amber-50', activeRing: 'ring-amber-300' },
    { label: '已完成', color: 'text-emerald-700', bar: 'bg-emerald-400', key: '已完成', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-300' },
  ]

  // 获取工序的数量数据
  const getProcessData = (woNo: string, processCode: string) => {
    const progress = progressMap[woNo]
    if (!progress || !progress.processData) {
      return { outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as ProcessOutsourceType, outsourceRecords: [], reportRecords: [] }
    }
    return progress.processData[processCode] || { outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as ProcessOutsourceType, outsourceRecords: [], reportRecords: [] }
  }

  // 根据进度生成可见任务列表（任务逐级产生）
  const visibleTasks = useMemo(() => {
    const result: FieldTask[] = []

    Object.entries(WORK_ORDER_ROUTES).forEach(([woNo, route]) => {
      if (onlyMine && !IS_ADMIN && route.woIssuer !== CURRENT_USER) return

      const progress = progressMap[woNo]
      const extras = extraTasksMap[woNo] || []
      const planQty = route.planQty || 1

      // 工单全部完成时，展示最后一道工序为"已完成"
      if (progress.currentActive < 0 && progress.completedUpTo >= 0) {
        const lastIdx = progress.completedUpTo
        const proc = route.processes[lastIdx]
        const pData = getProcessData(woNo, proc.code)
        result.push({
          id: `${woNo}-${proc.code}`,
          taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
          woNo,
          moldCode: route.moldCode,
          moldName: route.moldName,
          processName: proc.name,
          processSeq: proc.code,
          workCenter: proc.workCenter,
          planHours: proc.hours,
          assignee: route.woIssuer,
          woIssuer: route.woIssuer,
          startTime: '-',
          endTime: '-',
          status: '已完成',
          isOutsource: proc.isOutsource || false,
          canOutsource: proc.isOutsource || false,
          isInspect: proc.isInspect || false,
          isReWork: false,
          actualHours: proc.hours,
          completedQty: planQty,
          remark: '',
          planQty,
          outsourceQty: pData.outsourceQty,
          reportedQty: pData.reportedQty,
          outsourceType: pData.outsourceType,
          outsourceRecords: pData.outsourceRecords,
          reportRecords: pData.reportRecords,
        })
      }

      // 进行中的工序
      if (progress.currentActive >= 0) {
        const proc = route.processes[progress.currentActive]
        const pData = getProcessData(woNo, proc.code)
        if (proc.isOutsource && progress.outsourceCreated) {
          result.push({
            id: `${woNo}-${proc.code}-OS`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}-OS`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            processName: `${proc.name}（委外）`,
            processSeq: proc.code + '-O',
            workCenter: '委外',
            planHours: proc.hours,
            assignee: '精工热处理厂',
            woIssuer: route.woIssuer,
            startTime: '-',
            endTime: '',
            status: '委外中',
            isOutsource: true,
            canOutsource: true,
            isInspect: false,
            isReWork: false,
            actualHours: 0,
            completedQty: 0,
            remark: '已送外加工',
            outsourceVendor: '精工热处理厂',
            outsourceProgress: 45,
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
          })
        } else if (proc.isOutsource && !progress.outsourceCreated) {
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            processName: proc.name,
            processSeq: proc.code,
            workCenter: proc.workCenter,
            planHours: proc.hours,
            assignee: route.woIssuer,
            woIssuer: route.woIssuer,
            startTime: '-',
            endTime: '',
            status: '进行中',
            isOutsource: true,
            canOutsource: true,
            isInspect: false,
            isReWork: false,
            actualHours: 0,
            completedQty: 0,
            remark: '等待委外发起',
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
          })
        } else if (!proc.isOutsource) {
          // 领料工序特殊处理
          const isPicking = proc.code === '0000'
          let taskStatus: ExecStatus = progress.paused ? '暂停' : '进行中'
          if (isPicking && !progress.pickingRequested) {
            taskStatus = '待领料'
          } else if (isPicking && progress.pickingRequested) {
            taskStatus = '待发料'
          }
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            processName: proc.name,
            processSeq: proc.code,
            workCenter: proc.workCenter,
            planHours: proc.hours,
            assignee: route.woIssuer,
            woIssuer: route.woIssuer,
            startTime: '-',
            endTime: '',
            status: taskStatus,
            isOutsource: false,
            canOutsource: proc.isOutsource || false,  // 工艺路径中是否允许委外
            isInspect: proc.isInspect || false,
            isReWork: false,
            actualHours: 0,
            completedQty: 0,
            remark: isPicking && progress.pickingRequested ? '已提交领料申请，等待仓库发料' : (progress.paused ? '机床故障等待维修' : ''),
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
          })
        }
      }

      // 额外任务
      extras.forEach(extra => {
        result.push(extra)
      })
    })

    return result.sort((a, b) => {
      if (a.woNo !== b.woNo) return a.woNo.localeCompare(b.woNo)
      return a.processSeq.localeCompare(b.processSeq)
    })
  }, [progressMap, extraTasksMap, onlyMine])

  const countOf = (key: ExecStatus | '') => {
    const base = key === '' ? visibleTasks : visibleTasks.filter(t => t.status === key)
    return base.length
  }

  const mineActiveCount = visibleTasks.filter(t => t.status === '进行中' || t.status === '暂停').length

  const filtered = visibleTasks.filter(t => {
    if (search && !t.taskNo.includes(search) && !t.moldName.includes(search) && !t.processName.includes(search) && !t.woNo.includes(search)) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  const updateStatus = (id: string, status: ExecStatus) => {
    // 简单处理：更新额外任务的状态
    setExtraTasksMap(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(woNo => {
        next[woNo] = next[woNo].map(t => {
          if (t.id !== id) return t
          const now = new Date().toLocaleString('zh-CN')
          return {
            ...t, status,
            startTime: status === '进行中' && !t.startTime ? now : t.startTime,
            endTime: status === '已完成' ? now : t.endTime,
          }
        })
      })
      return next
    })
  }

  const submitOutsource = () => {
    if (!outsourceModal) return
    const qty = Number(outsourceForm.qty)
    if (!qty || qty <= 0) {
      alert('请输入有效的委外数量')
      return
    }
    if (!outsourceForm.planSendDate) {
      alert('请选择预计下单日期')
      return
    }
    if (!outsourceForm.planReturnDate) {
      alert('请选择预计交货日期')
      return
    }
    const route = WORK_ORDER_ROUTES[outsourceModal.woNo]
    const planQty = route?.planQty || 1
    const currentOutsourceQty = outsourceModal.outsourceQty || 0
    if (qty + currentOutsourceQty > planQty) {
      alert(`本次委外数量 ${qty} + 已委外数量 ${currentOutsourceQty} = ${qty + currentOutsourceQty}，超过工单总计划数量 ${planQty}`)
      return
    }

    // 生成委外任务单号
    const outNo = `OUT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    // 创建委外记录
    const newRecord: OutsourceRecord = {
      id: `OS-${Date.now()}`,
      outNo,
      qty,
      vendor: outsourceForm.vendor,
      planSendDate: outsourceForm.planSendDate,
      planReturnDate: outsourceForm.planReturnDate,
      processReq: outsourceForm.processReq,
      remark: outsourceForm.remark,
      createTime: new Date().toLocaleString('zh-CN'),
      creator: CURRENT_USER,
      status: '已发委外',
      arrivedQty: 0,
      qualifiedQty: 0,
      defectiveQty: 0,
    }

    // 更新processData
    setProgressMap(prev => {
      const prevData = prev[outsourceModal.woNo].processData?.[outsourceModal.processSeq] || {
        outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制', outsourceRecords: [], reportRecords: []
      }
      const newOutsourceQty = prevData.outsourceQty + qty
      const newOutsourceType: ProcessOutsourceType = newOutsourceQty === planQty ? '全部委外' :
        newOutsourceQty > 0 ? '部分委外' : '全部自制'
      return {
        ...prev,
        [outsourceModal.woNo]: {
          ...prev[outsourceModal.woNo],
          outsourceCreated: true,
          processData: {
            ...prev[outsourceModal.woNo].processData,
            [outsourceModal.processSeq]: {
              ...prevData,
              outsourceQty: newOutsourceQty,
              outsourceType: newOutsourceType,
              outsourceRecords: [...prevData.outsourceRecords, newRecord],
            }
          }
        }
      }
    })

    alert(`委外任务单已创建！\n\n委外单号：${outNo}\n委外数量：${qty}\n供应商：${outsourceForm.vendor}\n预计交货：${outsourceForm.planReturnDate}\n\n可打印单据后交由采购对接，到货后在「委外到货登记」页面登记。`)
    setOutsourceModal(null)
    setOutsourceForm({ qty: '', vendor: '精工热处理厂', planSendDate: '', planReturnDate: '', processReq: '', remark: '' })
  }

  // 打开委外弹窗（单工序委外）
  const openMultiOutsourceModal = (task: FieldTask) => {
    const woNo = task.woNo
    const route = WORK_ORDER_ROUTES[woNo]
    if (!route) {
      alert('未找到工单工艺路径')
      return
    }

    const currentProcess = route.processes.find(p => p.code === task.processSeq.replace('-O', ''))
    if (!currentProcess || !currentProcess.isOutsource) {
      alert('当前工序不可委外')
      return
    }

    const planQty = route.planQty || 1
    const today = new Date()
    const returnDate = new Date()
    returnDate.setDate(today.getDate() + 10)

    setMultiOutsourceTask(task)
    setMultiOutsourceForm({
      vendor: '精工热处理厂',
      planSendDate: today.toISOString().split('T')[0],
      planReturnDate: returnDate.toISOString().split('T')[0],
      outsourceQty: planQty,
      totalQty: planQty,
      processReq: '',
      remark: '',
      processList: [{
        processCode: currentProcess.code,
        processName: currentProcess.name,
        totalQty: planQty,
        selected: true,
      }],
    })
    setShowMultiOutsourceModal(true)
  }

  // 提交委外
  const submitMultiOutsource = () => {
    if (!multiOutsourceTask) return
    if (!multiOutsourceForm.planSendDate) {
      alert('请选择预计下单日期')
      return
    }
    if (!multiOutsourceForm.planReturnDate) {
      alert('请选择预计交货日期')
      return
    }

    const selectedProcesses = multiOutsourceForm.processList.filter(p => p.selected)
    if (selectedProcesses.length < 1) {
      alert('请选择委外工序')
      return
    }

    const outsourceQty = multiOutsourceForm.outsourceQty
    if (outsourceQty <= 0) {
      alert('委外数量必须大于0')
      return
    }
    if (outsourceQty > multiOutsourceForm.totalQty) {
      alert(`委外数量不能超过计划数量 ${multiOutsourceForm.totalQty}`)
      return
    }

    const woNo = multiOutsourceTask.woNo
    const planQty = multiOutsourceForm.totalQty
    const selfQty = planQty - outsourceQty
    const outsourceType = outsourceQty === planQty ? '全部委外' : outsourceQty > 0 ? '部分委外' : '全部自制'

    const mergedOutNo = `OUT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`

    setProgressMap(prev => {
      const next = { ...prev }
      if (!next[woNo]) return next

      for (const p of selectedProcesses) {
        const code = p.processCode
        const prevData = next[woNo].processData?.[code] || {
          outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as const, outsourceRecords: [], reportRecords: []
        }

        const newRecord: OutsourceRecord = {
          id: `MO-${Date.now()}-${code}`,
          outNo: mergedOutNo,
          qty: outsourceQty,
          vendor: multiOutsourceForm.vendor,
          planSendDate: multiOutsourceForm.planSendDate,
          planReturnDate: multiOutsourceForm.planReturnDate,
          processReq: multiOutsourceForm.processReq,
          remark: multiOutsourceForm.remark,
          createTime: new Date().toLocaleString('zh-CN'),
          creator: CURRENT_USER,
          status: '已发委外',
          arrivedQty: 0,
          qualifiedQty: 0,
          defectiveQty: 0,
        }

        next[woNo] = {
          ...next[woNo],
          outsourceCreated: true,
          processData: {
            ...next[woNo].processData,
            [code]: {
              ...prevData,
              outsourceQty,
              outsourceType: outsourceType as ProcessOutsourceType,
              outsourceRecords: [...prevData.outsourceRecords, newRecord],
            },
          },
        }
      }

      return next
    })

    alert(`委外任务单已创建！\n\n委外单号：${mergedOutNo}\n工单号：${woNo}\n工序：${selectedProcesses.map(p => p.processName).join('、')}\n委外数量：${outsourceQty}件\n自制数量：${selfQty}件\n供应商：${multiOutsourceForm.vendor}\n预计交货：${multiOutsourceForm.planReturnDate}\n\n可打印单据后交由采购对接。`)
    setShowMultiOutsourceModal(false)
    setMultiOutsourceTask(null)
  }

  const toggleTaskSelect = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const submitReport = () => {
    if (!reportModal) return
    const qty = Number(reportForm.completedQty)
    if (!qty || qty <= 0) {
      alert('请输入有效的报工数量')
      return
    }

    const route = WORK_ORDER_ROUTES[reportModal.woNo]
    const planQty = route?.planQty || 1
    const outsourceQty = reportModal.outsourceQty || 0
    const selfMakeQty = planQty - outsourceQty
    const totalReportedQty = reportModal.reportedQty || 0
    const selfReportedQty = Math.max(0, totalReportedQty - outsourceQty)
    const remainingSelfQty = selfMakeQty - selfReportedQty

    if (qty > remainingSelfQty) {
      alert(`本次报工数量 ${qty} 超过剩余自制待报工数量 ${remainingSelfQty}\n\n委外部分请在「委外到货登记」页面登记。`)
      return
    }

    // 创建报工记录（固定为本厂报工）
    const newRecord: ReportRecord = {
      id: `R-${Date.now()}`,
      qty,
      defectiveQty: Number(reportForm.defectiveQty) || undefined,
      type: '本厂报工',
      createTime: new Date().toLocaleString('zh-CN'),
      creator: CURRENT_USER,
    }

    // 如果是主工序任务，更新进度和processData
    const progress = progressMap[reportModal.woNo]
    if (route && progress) {
      const procIdx = route.processes.findIndex(p => p.code === reportModal.processSeq.replace('-O', ''))
      if (procIdx === progress.currentActive && !reportModal.isReWork && !reportModal.isInspect) {
        const newTotalReportedQty = totalReportedQty + qty
        // 只有累计报工数量=工单总计划数量，该工序才算全部完工，才能流转到下一道工序
        const isFullyCompleted = newTotalReportedQty === planQty

        setProgressMap(prev => {
          const prevData = prev[reportModal.woNo].processData?.[reportModal.processSeq] || {
            outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制', outsourceRecords: [], reportRecords: []
          }
          return {
            ...prev,
            [reportModal.woNo]: {
              ...prev[reportModal.woNo],
              completedUpTo: isFullyCompleted ? procIdx : prev[reportModal.woNo].completedUpTo,
              currentActive: isFullyCompleted && procIdx + 1 < route.processes.length ? procIdx + 1 :
                isFullyCompleted ? -1 : prev[reportModal.woNo].currentActive,
              paused: false,
              processData: {
                ...prev[reportModal.woNo].processData,
                [reportModal.processSeq]: {
                  ...prevData,
                  reportedQty: newTotalReportedQty,
                  reportRecords: [...prevData.reportRecords, newRecord],
                }
              }
            }
          }
        })

        if (isFullyCompleted) {
          alert(`工序已全部完工！\n\n累计报工：${newTotalReportedQty}/${planQty}\n（自制：${selfReportedQty + qty}，委外：${outsourceQty}）\n已自动流转到下一道工序。`)
        } else {
          alert(`部分报工成功！\n\n本次报工：${qty}\n累计报工：${newTotalReportedQty}/${planQty}\n（自制：${selfReportedQty + qty}，委外：${outsourceQty}）\n剩余自制待报工：${remainingSelfQty - qty}`)
        }

        setReportModal(null)
        setReportForm({ actualHours: '', completedQty: '', defectiveQty: '', remark: '', reportType: '本厂报工' })
        return
      }
    }

    // 额外任务
    setExtraTasksMap(prev => {
      const next = { ...prev }
      if (next[reportModal.woNo]) {
        next[reportModal.woNo] = next[reportModal.woNo].map(t => t.id === reportModal.id ? {
          ...t,
          actualHours: Number(reportForm.actualHours) || t.actualHours,
          completedQty: qty,
          remark: reportForm.remark,
          status: t.isInspect ? '待检验' : '已完成',
          endTime: new Date().toLocaleString('zh-CN'),
        } : t)
      }
      return next
    })
    setReportModal(null)
    setReportForm({ actualHours: '', completedQty: '', defectiveQty: '', remark: '', reportType: '本厂报工' })
  }

  const openPickingModal = (task: FieldTask) => {
    setPickingItems([])
    setPickingSearch('')
    setPickingModal(task)
  }

  const searchResults = useMemo(() => {
    if (!pickingSearch.trim()) return []
    const kw = pickingSearch.trim().toLowerCase()
    return MATERIAL_LIBRARY.filter(m =>
      m.name.toLowerCase().includes(kw) ||
      m.code.toLowerCase().includes(kw) ||
      m.spec.toLowerCase().includes(kw)
    ).slice(0, 10)
  }, [pickingSearch])

  const addPickingItem = (item: BomItem) => {
    if (pickingItems.find(i => i.code === item.code)) return
    setPickingItems(prev => [...prev, { ...item, selectedQty: 1 }])
    setPickingSearch('')
  }

  const removePickingItem = (code: string) => {
    setPickingItems(prev => prev.filter(i => i.code !== code))
  }

  const updatePickingQty = (code: string, qty: number) => {
    setPickingItems(prev => prev.map(item =>
      item.code === code ? { ...item, selectedQty: Math.max(1, qty) } : item
    ))
  }

  const submitPickingRequest = () => {
    if (!pickingModal) return
    if (pickingItems.length === 0) {
      alert('请至少添加一项物料')
      return
    }
    setProgressMap(prev => ({
      ...prev,
      [pickingModal.woNo]: {
        ...prev[pickingModal.woNo],
        pickingRequested: true,
      }
    }))
    alert(`领料申请已提交！\n\n工单：${pickingModal.woNo}\n物料种类：${pickingItems.length}种\n\n已推送至仓库，等待发料。`)
    setPickingModal(null)
  }

  const handleSkipPicking = (woNo: string) => {
    if (!confirm('确认跳过领料，直接进入第一道工序？')) return
    const route = WORK_ORDER_ROUTES[woNo]
    if (!route) return
    const planQty = route.planQty || 1
    setProgressMap(prev => {
      const current = prev[woNo]
      if (!current) return prev
      const newProcessData = { ...(current.processData || {}) }
      newProcessData['0000'] = {
        outsourceQty: 0,
        reportedQty: planQty,
        outsourceType: '全部自制' as const,
        outsourceRecords: [],
        reportRecords: [{ id: `skip-${Date.now()}`, qty: planQty, type: '本厂报工' as const, createTime: new Date().toLocaleString('zh-CN'), creator: CURRENT_USER }],
      }
      return {
        ...prev,
        [woNo]: {
          ...current,
          completedUpTo: 0,
          currentActive: 1,
          pickingRequested: true,
          processData: newProcessData,
        }
      }
    })
  }

  const handleRework = (task: FieldTask) => {
    const reworkCount = visibleTasks.filter(t => t.woNo === task.woNo && t.processSeq === task.processSeq && t.isReWork).length + 1
    const newTask: FieldTask = {
      id: `${task.id}-R${reworkCount}`,
      taskNo: `${task.taskNo}-R${reworkCount}`,
      woNo: task.woNo,
      moldCode: task.moldCode,
      moldName: task.moldName,
      processName: `${task.processName.replace(/（返工\d+）/, '')}（返工${reworkCount}）`,
      processSeq: task.processSeq,
      workCenter: task.workCenter,
      planHours: 2,
      assignee: task.woIssuer,
      woIssuer: task.woIssuer,
      startTime: new Date().toLocaleString('zh-CN'),
      endTime: '',
      status: '进行中',
      isOutsource: false,
      isInspect: false,
      isReWork: true,
      actualHours: 0,
      completedQty: 0,
      remark: `返工来源：${task.taskNo}`,
      planQty: task.planQty,
      outsourceQty: 0,
      reportedQty: 0,
      outsourceType: '全部自制',
    }
    setExtraTasksMap(prev => ({
      ...prev,
      [task.woNo]: [...(prev[task.woNo] || []), newTask]
    }))
  }

  const handleAddInspect = (task: FieldTask) => {
    const inspectCount = visibleTasks.filter(t => t.woNo === task.woNo && t.processSeq === task.processSeq && t.isInspect).length + 1
    const newTask: FieldTask = {
      id: `${task.id}-IP${inspectCount}`,
      taskNo: `${task.taskNo}-IP${inspectCount}`,
      woNo: task.woNo,
      moldCode: task.moldCode,
      moldName: task.moldName,
      processName: `${task.processName.replace(/（检验\d+）/, '')}（检验${inspectCount}）`,
      processSeq: task.processSeq,
      workCenter: '质检',
      planHours: 1,
      assignee: '质检组',
      woIssuer: task.woIssuer,
      startTime: new Date().toLocaleString('zh-CN'),
      endTime: '',
      status: '待检验',
      isOutsource: false,
      isInspect: true,
      isReWork: false,
      actualHours: 0,
      completedQty: task.completedQty || 1,
      remark: `检验来源：${task.taskNo}`,
      planQty: task.planQty,
      outsourceQty: 0,
      reportedQty: task.reportedQty || 0,
      outsourceType: task.outsourceType || '全部自制',
    }
    setExtraTasksMap(prev => ({
      ...prev,
      [task.woNo]: [...(prev[task.woNo] || []), newTask]
    }))
  }

  return (
    <MainLayout>
      <div className="flex h-full bg-[#f5f6f8]">
        <div className="flex flex-col flex-1 min-w-0">
          {/* 业务说明 */}
          <div className="mx-4 mt-4 bg-[#eef4fb] border border-[#d0dff0] rounded-lg px-4 py-2.5 flex items-start gap-2 text-xs text-gray-600">
            <Clock size={14} className="text-[#1e5fa8] mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p><span className="font-medium">任务逐级产生：</span>上一道工序完成后，下一道任务才自动出现在列表中。未到的工序完全不显示。</p>
              <p><span className="font-medium">领料流程：</span>钳工点击"去领料"选择物料提交申请 → 仓库审核发料 → 领料完成后自动进入下一道工序。</p>
              <p><span className="font-medium">部分委外：</span>同一工序可多次申请委外，累计委外数量不超过工单总计划数量，系统自动计算委外类型（全部自制/部分委外/全部委外）。</p>
              <p><span className="font-medium">部分报工：</span>同一工序可多次报工，累计报工数量 = 工单总计划数量时，该工序才算全部完工，才能流转到下一道工序。</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3">
            <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-1.5 overflow-x-auto">
              {statusTabs.map(tab => {
                const active = filterStatus === tab.key
                const count = countOf(tab.key)
                return (
                  <button
                    key={tab.label}
                    onClick={() => setFilterStatus(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0',
                      active
                        ? cn(tab.activeBg, tab.color, 'ring-1', tab.activeRing)
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    )}
                  >
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full', tab.bar)} />
                    <span>{tab.label}</span>
                    <span className={cn(
                      'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                      active ? cn(tab.bar, 'text-white') : 'bg-gray-100 text-gray-500'
                    )}>{count}</span>
                  </button>
                )
              })}
              <div className="ml-auto pl-2 flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400 hidden md:inline">
                  当前用户：<span className="text-gray-700 font-medium">{CURRENT_USER}</span>
                  {mineActiveCount > 0 && <span className="ml-1 text-[#1e5fa8]">（{mineActiveCount}个进行中）</span>}
                </span>
                {IS_ADMIN && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input type="checkbox" checked={!onlyMine} onChange={e => setOnlyMine(!e.target.checked)} className="accent-[#1e5fa8]" />
                    <span className="text-gray-600">查看全部</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-9 text-sm flex-1 max-w-sm">
              <Search size={14} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索任务单号 工单 工装名称 工序名称" className="outline-none w-full text-gray-700 placeholder:text-gray-400" />
            </div>
            <button
              onClick={() => setFilterStatus(filterStatus === '待发料' ? '' : '待发料')}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 text-sm rounded border transition-colors',
                filterStatus === '待发料'
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              <ShoppingCart size={13} /> 待领料
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                filterStatus === '待发料' ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {countOf('待发料')}
              </span>
            </button>
            <button onClick={() => { setSearch(''); setFilterStatus('') }} className="flex items-center gap-1.5 h-9 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
              <RotateCcw size={13} /> 重置
            </button>
            <div className="ml-auto flex items-center gap-2">
            </div>
          </div>

          {/* Task Grid */}
          <div className="flex-1 overflow-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-sm mb-2">暂无任务</p>
                <p className="text-xs">上一道工序完成后，下一道任务会自动出现在这里</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map(task => {
                  const isPicking = task.processSeq === '0000'
                  const route = WORK_ORDER_ROUTES[task.woNo]
                  const progress = progressMap[task.woNo]
                  const totalProc = route?.processes.length || 0
                  const doneCount = progress ? progress.completedUpTo + 1 : 0
                  return (
                  <div key={task.id} onClick={() => setDetail(task)} className={cn(
                    'bg-white rounded-2xl border cursor-pointer hover:shadow-md transition-all relative overflow-hidden',
                    isPicking ? 'border-cyan-300 hover:border-cyan-400' : 'border-gray-200',
                    detail?.id === task.id ? (isPicking ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-[#1e5fa8] ring-2 ring-[#1e5fa8]/20') : ''
                  )}>
                    {isPicking && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-cyan-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                          <ShoppingCart size={9} /> 领料
                        </div>
                      </div>
                    )}
                    {task.isMergedOutsource && (
                      <div className="absolute top-0 left-0">
                        <div className="bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-br-lg flex items-center gap-1">
                          <Package size={9} /> 合并委外
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono text-sm font-medium text-[#1e5fa8]">{task.woNo}</p>
                        </div>
                        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', STATUS_STYLES[task.status].badge)}>{task.status}</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">{task.moldName} - {task.processName}</h3>
                      <div className="text-sm text-gray-500 mb-3">
                        <span>品号: <span className="font-mono text-gray-700">{task.moldCode}</span></span>
                        <span className="mx-2 text-gray-300">·</span>
                        <span className="text-gray-600">{task.processName}</span>
                      </div>
                      {/* 数量信息 */}
                      {task.planQty && task.planQty > 0 && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 bg-gray-50 rounded px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">计划:</span>
                            <span className="font-medium text-gray-700">{task.planQty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">已委外:</span>
                            <span className="font-medium text-amber-600">{task.outsourceQty || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">已报工:</span>
                            <span className="font-medium text-emerald-600">{task.reportedQty || 0}</span>
                          </div>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          进度: {doneCount}/{totalProc} 道
                        </div>
                        <div className="flex gap-2">
                          {task.status === '待领料' && task.woIssuer === CURRENT_USER && task.processSeq === '0000' && (
                            <>
                              <button onClick={e => { e.stopPropagation(); openPickingModal(task) }} className="px-4 py-1.5 text-xs bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-1">
                                <ShoppingCart size={12} /> 去领料
                              </button>
                              <button onClick={e => { e.stopPropagation(); handleSkipPicking(task.woNo) }} className="px-4 py-1.5 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1">
                                <SkipForward size={12} /> 跳过领料
                              </button>
                            </>
                          )}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && task.processSeq === '0000' && (
                            <button onClick={e => { e.stopPropagation(); openPickingModal(task) }} className="px-4 py-1.5 text-xs bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-1">
                              <ShoppingCart size={12} /> 去领料
                            </button>
                          )}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && !task.isOutsource && task.processSeq !== '0000' && (
                            <>
                              <button onClick={e => { e.stopPropagation(); setReportModal(task); setReportForm({ actualHours: String(task.actualHours), completedQty: String(task.planQty - (task.reportedQty || 0)), defectiveQty: '', remark: task.remark, reportType: '本厂报工' }) }} className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                                报工
                              </button>

                            </>
                          )}
                          {/* 委外按钮 - 统一调用连续委外弹窗（内部自动判断是否显示多工序勾选项） */}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && task.isOutsource && (
                            <button onClick={e => { e.stopPropagation(); openMultiOutsourceModal(task) }} className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1">
                              <Package size={12} /> 委外
                            </button>
                          )}
                          {task.status === '待发料' && (
                            <span className="px-3 py-1.5 text-xs bg-cyan-100 text-cyan-700 rounded-lg flex items-center gap-1">
                              <Clock size={12} /> 等待仓库发料
                            </span>
                          )}
                          {task.status === '暂停' && task.woIssuer === CURRENT_USER && (
                            <button onClick={e => { e.stopPropagation(); updateStatus(task.id, '进行中') }} className="px-4 py-1.5 text-xs bg-[#1e5fa8] text-white rounded-lg hover:bg-[#1a4f8f]">
                              恢复
                            </button>
                          )}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && !task.isOutsource && (
                            <button onClick={e => { e.stopPropagation(); updateStatus(task.id, '暂停') }} className="px-4 py-1.5 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                              暂停
                            </button>
                          )}
                          {task.status === '已完成' && task.woIssuer === CURRENT_USER && !task.isInspect && task.processSeq !== '0000' && (
                            <div className="flex gap-2">
                              <button onClick={e => { e.stopPropagation(); handleRework(task) }} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <RefreshCw size={12} className="inline mr-1" />重做
                              </button>
                              <button onClick={e => { e.stopPropagation(); handleAddInspect(task) }} className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                                <AlertTriangle size={12} className="inline mr-1" />检验
                              </button>
                            </div>
                          )}
                          {task.status === '委外中' && (
                            <span className="text-xs text-amber-600">{task.outsourceVendor} · {task.outsourceProgress}%</span>
                          )}
                          {task.status === '待检验' && (
                            <span className="text-xs text-purple-600">检验中</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {task.isInspect && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">检验</span>}
                        {task.isOutsource && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs flex items-center gap-1"><Package size={10} /> 委外</span>}
                        {task.isMergedOutsource && task.mergedOutNo && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-mono">
                            {task.mergedOutNo}
                          </span>
                        )}
                        {task.isReWork && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">返工</span>}
                        {task.outsourceType && task.outsourceType !== '全部自制' && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs">{task.outsourceType}</span>}
                        {task.processSeq !== '0000' && task.planQty > 0 && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
                            已报 {(task.reportedQty || 0)}/{task.planQty}
                            {(task.outsourceQty || 0) > 0 && <span className="text-amber-600"> · 委外{task.outsourceQty}</span>}
                          </span>
                        )}
                        {task.woIssuer === CURRENT_USER && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">我的工单</span>}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {detail && (
          <div className="w-[320px] min-w-[320px] bg-white border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800 text-sm">任务详情</p>
              <button onClick={() => setDetail(null)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {[
                ['任务单号', detail.taskNo],
                ['关联工单', detail.woNo],
                ['品号', detail.moldCode],
                ['品名', detail.moldName],
                ['工序序号', detail.processSeq],
                ['工序名称', detail.processName],
                ['工作中心', detail.workCenter],
                ['执行人', detail.assignee || '—'],
                ['工单负责人', detail.woIssuer],
                ['开始时间', detail.startTime && detail.startTime !== '-' ? detail.startTime : '—'],
                ['完成时间', detail.endTime && detail.endTime !== '-' ? detail.endTime : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 text-xs w-20 shrink-0">{label}</span>
                  <span className="text-gray-800 text-xs text-right">{value}</span>
                </div>
              ))}
              {/* 数量信息 */}
              {detail.planQty && detail.planQty > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-medium text-blue-700 mb-2">数量信息</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">工单总数量</span>
                      <span className="font-medium text-gray-800">{detail.planQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">委外数量</span>
                      <span className="font-medium text-amber-600">{detail.outsourceQty || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">自制数量</span>
                      <span className="font-medium text-gray-600">{detail.planQty - (detail.outsourceQty || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">自制已报工</span>
                      <span className="font-medium text-emerald-600">{Math.max(0, (detail.reportedQty || 0) - (detail.outsourceQty || 0))}</span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-1 border-t border-blue-100">
                      <span className="text-gray-500">累计已报工（含委外）</span>
                      <span className="font-medium text-emerald-600">{detail.reportedQty || 0}</span>
                    </div>
                  </div>
                  {detail.outsourceType && (
                    <div className="pt-2 border-t border-blue-100">
                      <span className="text-gray-500 text-xs">委外类型：</span>
                      <span className={cn(
                        'ml-1 px-2 py-0.5 rounded text-xs',
                        detail.outsourceType === '全部自制' ? 'bg-gray-100 text-gray-600' :
                        detail.outsourceType === '全部委外' ? 'bg-amber-100 text-amber-700' : 'bg-orange-50 text-orange-600'
                      )}>{detail.outsourceType}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-1 flex-wrap mt-1">
                {detail.isInspect && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">检验任务</span>}
                {detail.isOutsource && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs">委外工序</span>}
                {detail.isReWork && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">返工任务</span>}
                {detail.outsourceType && detail.outsourceType !== '全部自制' && (
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs',
                    detail.outsourceType === '全部委外' ? 'bg-amber-100 text-amber-700' : 'bg-orange-50 text-orange-600'
                  )}>{detail.outsourceType}</span>
                )}
              </div>
              {/* 委外记录 */}
              {detail.outsourceRecords && detail.outsourceRecords.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-amber-700">历次委外记录</span>
                    <button
                      onClick={() => setExpandedRecords(prev => ({ ...prev, outsource: !prev.outsource }))}
                      className="text-xs text-amber-600 hover:text-amber-800"
                    >
                      {expandedRecords.outsource ? '收起' : '展开'} ({detail.outsourceRecords!.length}条)
                    </button>
                  </div>
                  {expandedRecords.outsource && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {detail.outsourceRecords.map(record => (
                        <div key={record.id} className="bg-white rounded p-2.5 text-xs border border-amber-100">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-amber-700 font-mono">{record.outNo}</span>
                            <span className={cn(
                              'px-1.5 py-0.5 rounded text-[10px]',
                              record.status === '已到货' || record.status === '已检验' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === '委外中' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            )}>{record.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-gray-500 mb-2">
                            <div>数量：<span className="font-medium text-amber-600">{record.qty}</span></div>
                            <div>供应商：<span className="text-gray-700">{record.vendor}</span></div>
                            <div>预计下单：<span className="text-gray-700">{record.planSendDate}</span></div>
                            <div>预计交货：<span className="text-gray-700">{record.planReturnDate}</span></div>
                          </div>
                          {record.processReq && (
                            <div className="text-gray-500 mb-1">加工要求：<span className="text-gray-600">{record.processReq}</span></div>
                          )}
                          <div className="flex justify-between text-gray-400 pt-1.5 border-t border-amber-50">
                            <span>{record.creator}</span>
                            <span>{record.createTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* 报工记录 */}
              {detail.reportRecords && detail.reportRecords.length > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-emerald-700">历次报工记录</span>
                    <button
                      onClick={() => setExpandedRecords(prev => ({ ...prev, report: !prev.report }))}
                      className="text-xs text-emerald-600 hover:text-emerald-800"
                    >
                      {expandedRecords.report ? '收起' : '展开'} ({detail.reportRecords!.length}条)
                    </button>
                  </div>
                  {expandedRecords.report && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {detail.reportRecords.map(record => (
                        <div key={record.id} className="bg-white rounded p-2 text-xs border border-emerald-100">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">数量: <span className="font-medium text-emerald-600">{record.qty}</span></span>
                            <span className="text-gray-400">{record.createTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={cn(
                              'px-1.5 py-0.5 rounded',
                              record.type === '本厂报工' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            )}>{record.type}</span>
                            <span className="text-gray-400">创建人: {record.creator}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* 工单进度 */}
              {(() => {
                const route = WORK_ORDER_ROUTES[detail.woNo]
                const progress = progressMap[detail.woNo]
                if (!route || !progress) return null
                const isAllDone = progress.currentActive < 0
                const currentSeq = isAllDone ? route.processes.length : progress.currentActive + 1
                const currentProcIdx = route.processes.findIndex(p => p.code === detail.processSeq)
                return (
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium flex items-center justify-between">
                      <span>工单整体进度</span>
                      {isAllDone
                        ? <span className="text-emerald-600 font-medium">✓ 已全部完工</span>
                        : <span className="text-gray-800 font-medium">第 {currentSeq} / {route.processes.length} 道</span>
                      }
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="space-y-1">
                        {route.processes.map((p, i) => {
                          const isDone = i <= progress.completedUpTo
                          const isCurrent = i === progress.currentActive
                          const isViewing = i === currentProcIdx
                          return (
                            <div key={p.code} className={cn(
                              'flex items-center gap-2 rounded-md px-1.5 py-1 -mx-1.5',
                              isViewing && 'bg-blue-100/50 ring-1 ring-blue-200'
                            )}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isDone ? 'bg-emerald-500' : isCurrent ? 'bg-[#1e5fa8]' : 'bg-gray-200'
                              }`}>
                                {isDone ? <Check size={8} className="text-white" /> : null}
                              </div>
                              <span className={`text-xs flex-1 ${
                                isDone ? 'text-gray-500' : isCurrent ? 'text-gray-800 font-medium' : 'text-gray-400'
                              }`}>
                                {p.name}
                                {p.isOutsource && <span className="ml-1 text-amber-500">（委外）</span>}
                                {p.isInspect && <span className="ml-1 text-purple-500">（检验）</span>}
                              </span>
                              {isViewing && (
                                <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">当前查看</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
              {detail.remark && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">备注</p>
                  <p className="text-xs text-gray-700">{detail.remark}</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 space-y-2">
              <button className="w-full flex items-center justify-center gap-1.5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                <FileText size={13} /> 查看ESOP
              </button>
              {detail.status === '待领料' && detail.woIssuer === CURRENT_USER && detail.processSeq === '0000' && (
                <>
                  <button onClick={() => openPickingModal(detail)} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700">
                    <ShoppingCart size={13} /> 去领料
                  </button>
                  <button onClick={() => handleSkipPicking(detail.woNo)} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                    <SkipForward size={13} /> 跳过领料，直接开工
                  </button>
                </>
              )}
              {detail.status === '进行中' && detail.woIssuer === CURRENT_USER && detail.processSeq === '0000' && (
                <button onClick={() => openPickingModal(detail)} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700">
                  <ShoppingCart size={13} /> 去领料
                </button>
              )}
              {detail.status === '待发料' && (
                <div className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-cyan-50 text-cyan-700 rounded border border-cyan-200">
                  <Clock size={13} /> 等待仓库发料
                </div>
              )}
              {detail.status === '进行中' && detail.woIssuer === CURRENT_USER && !detail.isOutsource && detail.processSeq !== '0000' && (
                <>
                  <button onClick={() => { setReportModal(detail); setReportForm({ actualHours: String(detail.actualHours), completedQty: String(detail.planQty - (detail.reportedQty || 0)), defectiveQty: '', remark: detail.remark, reportType: '本厂报工' }) }} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">
                    <CheckCircle size={13} /> 完工报工
                  </button>
                  {/* 委外按钮 - 只有工艺路径中设置了可委外的工序才显示 */}
                  {detail.canOutsource && (!detail.outsourceType || detail.outsourceType === '全部自制' || detail.outsourceType === '部分委外') && (detail.outsourceQty || 0) < detail.planQty && (
                    <button onClick={() => { setOutsourceModal(detail); setOutsourceForm({ qty: '', vendor: '精工热处理厂' }) }} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">
                      <Package size={13} /> 申请委外
                    </button>
                  )}
                </>
              )}
              {detail.status === '已完成' && detail.woIssuer === CURRENT_USER && !detail.isInspect && detail.processSeq !== '0000' && (
                <div className="flex gap-2">
                  <button onClick={() => handleRework(detail)} className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                    <RefreshCw size={13} /> 重做
                  </button>
                  <button onClick={() => handleAddInspect(detail)} className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm bg-purple-500 text-white rounded hover:bg-purple-600">
                    <AlertTriangle size={13} /> 增加检验
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[420px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800">工序完工报告</h3>
                <button onClick={() => setReportModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{reportModal.processName}</span> · {reportModal.moldName}
                </div>
                {/* 数量信息 */}
                <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">工单总计划数量</span>
                      <span className="font-medium text-gray-800">{reportModal.planQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">本厂已累计报工</span>
                      <span className="font-medium text-emerald-600">{(reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) > 0 ? (reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">委外数量</span>
                      <span className="font-medium text-amber-600">{reportModal.outsourceQty || 0}</span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-1 border-t border-emerald-100">
                      <span className="text-gray-500">剩余自制待报工</span>
                      <span className="font-medium text-red-600">{reportModal.planQty - (reportModal.outsourceQty || 0) - ((reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) > 0 ? (reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) : 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700 flex items-start gap-2">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <p>本厂自制部分在此报工，委外部分到货后请在「委外到货登记」页面登记，系统自动完成委外报工。</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">本次报工数量</label>
                  <input type="number" value={reportForm.completedQty} onChange={e => setReportForm(f => ({ ...f, completedQty: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-[#1e5fa8]" placeholder={`最大可报工 ${reportModal.planQty - (reportModal.reportedQty || 0)}`} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">不良品数量 <span className="text-gray-400">(选填)</span></label>
                  <input type="number" value={reportForm.defectiveQty} onChange={e => setReportForm(f => ({ ...f, defectiveQty: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-[#1e5fa8]" placeholder="如有不良品请填写" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">备注</label>
                  <textarea value={reportForm.remark} onChange={e => setReportForm(f => ({ ...f, remark: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-[#1e5fa8] resize-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setReportModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
                <button onClick={submitReport} className="px-5 h-8 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">提交报工</button>
              </div>
            </div>
          </div>
        )}

        {/* Outsource Modal */}
        {outsourceModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-800">发起委外任务单</h3>
                <button onClick={() => setOutsourceModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* 基本信息 */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">工单号：</span>
                      <span className="text-gray-700 font-mono">{outsourceModal.woNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">工序号：</span>
                      <span className="text-gray-700 font-mono">{outsourceModal.processSeq}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">模具名称：</span>
                      <span className="text-gray-700">{outsourceModal.moldName} · {outsourceModal.processName}</span>
                    </div>
                  </div>
                </div>

                {/* 数量信息 */}
                <div className="bg-amber-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                    <AlertTriangle size={13} /> 数量信息
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">工单总计划数量</span>
                      <span className="font-medium text-gray-800">{outsourceModal.planQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">本工序已委外总数</span>
                      <span className="font-medium text-amber-600">{outsourceModal.outsourceQty || 0}</span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-1 border-t border-amber-100">
                      <span className="text-gray-500">剩余可委外数量</span>
                      <span className="font-medium text-orange-600">{outsourceModal.planQty - (outsourceModal.outsourceQty || 0)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">外协供应商 <span className="text-red-500">*</span></label>
                  <select value={outsourceForm.vendor} onChange={e => setOutsourceForm(f => ({ ...f, vendor: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-amber-500">
                    <option value="精工热处理厂">精工热处理厂（ERP默认）</option>
                    <option value="恒辉热处理有限公司">恒辉热处理有限公司</option>
                    <option value="东方外协中心">东方外协中心</option>
                    <option value="华强外协加工">华强外协加工</option>
                    <option value="明光电镀厂">明光电镀厂</option>
                    <option value="精达机加工厂">精达机加工厂</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">ERP默认带出，可手动更换</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">本次委外发出数量 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={outsourceForm.qty}
                    onChange={e => setOutsourceForm(f => ({ ...f, qty: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-amber-500"
                    placeholder={`最大可委外 ${outsourceModal.planQty - (outsourceModal.outsourceQty || 0)}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">预计下单日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={outsourceForm.planSendDate}
                      onChange={e => setOutsourceForm(f => ({ ...f, planSendDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">预计交货日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={outsourceForm.planReturnDate}
                      onChange={e => setOutsourceForm(f => ({ ...f, planReturnDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">加工要求</label>
                  <textarea
                    value={outsourceForm.processReq}
                    onChange={e => setOutsourceForm(f => ({ ...f, processReq: e.target.value }))}
                    placeholder="请填写加工要求、技术参数、质量标准等"
                    rows={3}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">备注说明</label>
                  <textarea
                    value={outsourceForm.remark}
                    onChange={e => setOutsourceForm(f => ({ ...f, remark: e.target.value }))}
                    placeholder="其他需要说明的事项"
                    rows={2}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-0.5">说明</p>
                    <p>提交后生成唯一委外任务单号，支持打印带二维码单据。采购下单、物流发货等线下处理，到货后在「委外到货登记」页面登记，系统自动完成委外报工。</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <button onClick={() => setOutsourceModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50">取消</button>
                  <button onClick={submitOutsource} className="px-5 h-8 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">生成委外任务单</button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 委外弹窗 */}
        {showMultiOutsourceModal && multiOutsourceTask && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Package size={18} className="text-purple-600" />
                    委外
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">将本工序委外给供应商进行加工</p>
                </div>
                <button onClick={() => { setShowMultiOutsourceModal(false); setMultiOutsourceTask(null) }}>
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* 基本信息 */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-700">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div>工单号：<span className="font-mono">{multiOutsourceTask.woNo}</span></div>
                    <div>模具：{multiOutsourceTask.moldName}</div>
                    <div>计划数量：{multiOutsourceTask.planQty} 件</div>
                  </div>
                </div>

                {/* 供应商 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">外协供应商 <span className="text-red-500">*</span></label>
                  <select
                    value={multiOutsourceForm.vendor}
                    onChange={e => setMultiOutsourceForm(f => ({ ...f, vendor: e.target.value }))}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-purple-500"
                  >
                    <option value="精工热处理厂">精工热处理厂</option>
                    <option value="恒辉热处理有限公司">恒辉热处理有限公司</option>
                    <option value="华南表面处理厂">华南表面处理厂</option>
                    <option value="鸿源热处理厂">鸿源热处理厂</option>
                    <option value="蓝光精密机加工厂">蓝光精密机加工厂</option>
                    <option value="鑫达金属加工厂">鑫达金属加工厂</option>
                  </select>
                </div>

                {/* 日期 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">预计下单日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={multiOutsourceForm.planSendDate}
                      onChange={e => setMultiOutsourceForm(f => ({ ...f, planSendDate: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">预计交货日期 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={multiOutsourceForm.planReturnDate}
                      onChange={e => setMultiOutsourceForm(f => ({ ...f, planReturnDate: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* 工序信息 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">工序信息</label>
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>工序号：<span className="font-mono text-purple-700">{multiOutsourceForm.processList[0]?.processCode}</span></div>
                      <div>工序名称：<span className="text-purple-700">{multiOutsourceForm.processList[0]?.processName}</span></div>
                      <div>计划数量：<span className="text-purple-700">{multiOutsourceForm.totalQty} 件</span></div>
                    </div>
                  </div>
                </div>

                {/* 委外数量 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">委外数量 <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={multiOutsourceForm.totalQty}
                        value={multiOutsourceForm.outsourceQty}
                        onChange={e => {
                          const val = Math.min(Number(e.target.value) || 0, multiOutsourceForm.totalQty)
                          setMultiOutsourceForm(f => ({ ...f, outsourceQty: val }))
                        }}
                        className="flex-1 h-9 px-3 text-sm border border-amber-200 rounded outline-none focus:border-amber-400 bg-amber-50"
                      />
                      <span className="text-xs text-gray-500">/ {multiOutsourceForm.totalQty} 件</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">自制数量</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-9 px-3 text-sm bg-gray-100 rounded flex items-center text-gray-600">
                        {multiOutsourceForm.totalQty - multiOutsourceForm.outsourceQty}
                      </div>
                      <span className="text-xs text-gray-500">件</span>
                    </div>
                  </div>
                </div>

                {/* 加工要求 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">加工要求</label>
                  <textarea
                    value={multiOutsourceForm.processReq}
                    onChange={e => setMultiOutsourceForm(f => ({ ...f, processReq: e.target.value }))}
                    placeholder="请输入加工要求..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">备注</label>
                  <textarea
                    value={multiOutsourceForm.remark}
                    onChange={e => setMultiOutsourceForm(f => ({ ...f, remark: e.target.value }))}
                    placeholder="备注说明..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                {/* 提示 */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                  <p className="font-medium mb-1">提示</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>委外数量不能超过计划数量</li>
                    <li>委外完成后需在「委外到货登记」页面登记到货</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowMultiOutsourceModal(false); setMultiOutsourceTask(null) }}
                    className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={submitMultiOutsource}
                    className="px-5 h-8 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    确认委外
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Picking Modal */}
        {pickingModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">领料申请</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{pickingModal.woNo} · {pickingModal.moldName}</p>
                </div>
                <button onClick={() => setPickingModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 搜索框 */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={pickingSearch}
                    onChange={e => setPickingSearch(e.target.value)}
                    placeholder="输入物料品名 / 品号 / 规格 模糊搜索"
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 h-10 text-sm outline-none focus:border-cyan-400 bg-gray-50"
                    autoFocus
                  />
                  {/* 搜索结果下拉 */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {searchResults.map(item => (
                        <div
                          key={item.code}
                          onClick={() => addPickingItem(item)}
                          className="px-3 py-2 hover:bg-cyan-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                            <span className="text-[11px] text-gray-400 font-mono">{item.code}</span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-gray-500">{item.spec}</span>
                            <span className="text-[11px] text-gray-400">{item.warehouse} · {item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 已选物料列表 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">已选物料</span>
                    <span className="text-xs text-gray-400">
                      共 <span className="text-cyan-600 font-medium">{pickingItems.length}</span> 种
                    </span>
                  </div>
                  {pickingItems.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-lg py-8 text-center text-gray-400 text-sm">
                      请在上方搜索并添加物料
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pickingItems.map(item => (
                        <div key={item.code} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                <span className="text-[11px] text-gray-400 font-mono">{item.code}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{item.spec}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.warehouse} · 单位：{item.unit}</p>
                            </div>
                            <button
                              onClick={() => removePickingItem(item.code)}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-end mt-2 gap-2">
                            <span className="text-xs text-gray-500">数量：</span>
                            <button
                              onClick={() => updatePickingQty(item.code, (item.selectedQty || 1) - 1)}
                              className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white"
                            >
                              <Minus size={10} />
                            </button>
                            <input
                              type="number"
                              value={item.selectedQty || 1}
                              onChange={e => updatePickingQty(item.code, Number(e.target.value))}
                              className="w-14 h-5 border border-gray-200 rounded text-center text-xs outline-none focus:border-cyan-400 bg-white"
                            />
                            <button
                              onClick={() => updatePickingQty(item.code, (item.selectedQty || 1) + 1)}
                              className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white"
                            >
                              <Plus size={10} />
                            </button>
                            <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setPickingModal(null)} className="px-4 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-white">取消</button>
                  <button
                    onClick={submitPickingRequest}
                    disabled={pickingItems.length === 0}
                    className="px-4 h-8 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={13} /> 提交领料申请
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
