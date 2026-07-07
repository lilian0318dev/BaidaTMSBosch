'use client'

import { useState, useMemo } from 'react'
import { Search, RotateCcw, Pause, CheckCircle, Clock, FileText, X, User, Package, RefreshCw, AlertTriangle, Plus, Minus, Check, SkipForward, Printer, QrCode, Info, Wrench, Camera, Image, AlertCircle, Send, Warehouse, Layers, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type ExecStatus = '进行中' | '暂停' | '待检验' | '已完成' | '委外中'
type ProcessOutsourceType = '全部自制' | '部分委外' | '全部委外'

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
}

// 报工记录
interface ReportRecord {
  id: string
  qty: number
  type: '本厂报工' | '委外报工'
  createTime: string
  creator: string
  repairLog?: string
  photosBefore?: number
  photosAfter?: number
}

// 入库批次记录
interface InboundRecord {
  id: string
  inboundNo: string
  qty: number
  type: '自制完工' | '委外回流'
  warehouse: string
  createTime: string
  creator: string
  inspector?: string
  inspectResult?: '合格' | '不合格' | '待检'
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

interface RepairTask {
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
  isOutsource: boolean
  canOutsource: boolean
  isInspect: boolean
  isReWork: boolean
  completedQty: number
  remark: string
  outsourceVendor?: string
  outsourceProgress?: number
  // 数量管理字段
  planQty: number
  outsourceQty: number
  reportedQty: number
  outsourceType: ProcessOutsourceType
  outsourceRecords?: OutsourceRecord[]
  reportRecords?: ReportRecord[]
  // 维修特有字段
  defectReason?: string
  defectDetail?: string
  photosBefore?: number
  photosAfter?: number
  inboundWarehouse?: string
  // 合并委外字段
  mergedOutNo?: string
  isMergedOutsource?: boolean
}

const STATUS_STYLES: Record<ExecStatus, { bar: string; badge: string }> = {
  '进行中': { bar: 'bg-[#1e5fa8]', badge: 'bg-blue-100 text-blue-700' },
  '暂停':   { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  '待检验': { bar: 'bg-purple-400', badge: 'bg-purple-100 text-purple-700' },
  '已完成': { bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  '委外中': { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700' },
}

// 维修委外供应商
const REPAIR_VENDORS = [
  '精达模具有限公司',
  '恒达精密加工',
  '瑞盛模具技术服务',
  '华鑫模具修复中心',
]

// 维修工单工艺路径
const REPAIR_WO_ROUTES: Record<string, {
  woNo: string
  moldCode: string
  moldName: string
  defectReason: string
  defectDetail: string
  processingCount: number
  applicant: string
  woIssuer: string
  createTime: string
  inboundWarehouse: string
  planQty: number
  processes: { code: string; name: string; hours: number; workCenter: string; isOutsource?: boolean; isInspect?: boolean; canOutsource?: boolean }[]
}> = {
  'WX-WO-20260629-001': {
    woNo: 'WX-WO-20260629-001',
    moldCode: '7664SO',
    moldName: '7664SO成形凸模',
    defectReason: '模具磨损 / 型腔磨损',
    defectDetail: '型腔磨损严重，产品尺寸超差0.05mm',
    processingCount: 52360,
    applicant: '张班长',
    woIssuer: '钳工A',
    createTime: '2026-06-29 10:00',
    inboundWarehouse: '模具成品仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '拆模', hours: 2, workCenter: '钳工车间' },
      { code: '0020', name: '清洗检查', hours: 1, workCenter: '清洗区' },
      { code: '0030', name: '焊补修复', hours: 4, workCenter: '焊接区', canOutsource: true },
      { code: '0040', name: '磨削加工', hours: 3, workCenter: '磨床区' },
      { code: '0050', name: '钳工研配', hours: 4, workCenter: '钳工车间' },
      { code: '0060', name: '试模验证', hours: 2, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
  'WX-WO-20260629-002': {
    woNo: 'WX-WO-20260629-002',
    moldCode: '7659SO',
    moldName: '7659SO成形凹模',
    defectReason: '崩裂破损 / 断裂',
    defectDetail: '顶针断裂，产品顶出异常',
    processingCount: 38920,
    applicant: '李班长',
    woIssuer: '钳工A',
    createTime: '2026-06-29 10:30',
    inboundWarehouse: '模具成品仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '拆模', hours: 1.5, workCenter: '钳工车间' },
      { code: '0020', name: '清洗检查', hours: 0.5, workCenter: '清洗区' },
      { code: '0030', name: '线切割', hours: 2, workCenter: '线切割区', isOutsource: true },
      { code: '0040', name: '镶件装配', hours: 3, workCenter: '钳工车间' },
      { code: '0050', name: '试模验证', hours: 2, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
  'WX-WO-20260628-001': {
    woNo: 'WX-WO-20260628-001',
    moldCode: '7658SO',
    moldName: '7658SO成形凸模',
    defectReason: '装配异常 / 卡滞动作不顺',
    defectDetail: '滑块卡顿，开合模不顺畅',
    processingCount: 45680,
    applicant: '王班长',
    woIssuer: '钳工A',
    createTime: '2026-06-28 15:00',
    inboundWarehouse: '模具备件仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '拆检查', hours: 2, workCenter: '钳工车间' },
      { code: '0020', name: '滑块研配', hours: 5, workCenter: '钳工车间' },
      { code: '0030', name: '试模验证', hours: 2, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
  'WX-WO-20260628-002': {
    woNo: 'WX-WO-20260628-002',
    moldCode: 'GJ-2024-006',
    moldName: '轮毂压铸模',
    defectReason: '崩裂破损 / 断裂',
    defectDetail: '型芯断裂，需委外加工更换',
    processingCount: 68900,
    applicant: '陈班长',
    woIssuer: '钳工B',
    createTime: '2026-06-28 09:00',
    inboundWarehouse: '模具成品仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '拆模', hours: 3, workCenter: '钳工车间' },
      { code: '0020', name: '委外加工', hours: 48, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '装配调试', hours: 6, workCenter: '钳工车间' },
      { code: '0040', name: '试模验证', hours: 3, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
  'WX-WO-20260627-001': {
    woNo: 'WX-WO-20260627-001',
    moldCode: 'GJ-2024-008',
    moldName: '仪表板热压模',
    defectReason: '外观缺陷 / 凹坑麻点',
    defectDetail: '表面出现麻点，抛光重新处理型腔',
    processingCount: 32500,
    applicant: '周班长',
    woIssuer: '钳工A',
    createTime: '2026-06-27 14:00',
    inboundWarehouse: '模具成品仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '抛光处理', hours: 4, workCenter: '抛光区' },
      { code: '0020', name: '合模检测', hours: 2, workCenter: '钳工车间' },
      { code: '0030', name: '试模验证', hours: 2, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
  'WX-WO-20260715-001': {
    woNo: 'WX-WO-20260715-001',
    moldCode: '7664SO',
    moldName: '7664SO成形凸模',
    defectReason: '模具磨损 / 型腔磨损',
    defectDetail: '型腔磨损超差，需委外精密修复',
    processingCount: 45680,
    applicant: '张班长',
    woIssuer: '钳工A',
    createTime: '2026-07-15 08:00',
    inboundWarehouse: '模具成品仓',
    planQty: 1,
    processes: [
      { code: '0010', name: '拆模检查', hours: 2, workCenter: '钳工车间' },
      { code: '0020', name: '精密修复', hours: 48, workCenter: '委外', isOutsource: true },
      { code: '0030', name: '装配调试', hours: 4, workCenter: '钳工车间' },
      { code: '0040', name: '试模验证', hours: 3, workCenter: '试模车间' },
      { code: '9999', name: '最终检验', hours: 1, workCenter: '质检', isInspect: true },
    ],
  },
}

// 每个工单的当前进度
const WO_PROGRESS: Record<string, {
  completedUpTo: number
  currentActive: number
  outsourceCreated: boolean
  paused: boolean
  extraTasks: RepairTask[]
  inboundRecords: InboundRecord[]
  processData: Record<string, {
    outsourceQty: number
    reportedQty: number
    outsourceType: ProcessOutsourceType
    outsourceRecords: OutsourceRecord[]
    reportRecords: ReportRecord[]
  }>
}> = {
  'WX-WO-20260629-001': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: false,
    paused: false,
    extraTasks: [],
    inboundRecords: [],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-06-29 11:00', creator: '钳工A', repairLog: '已完成拆模，模具分解完毕', photosBefore: 2, photosAfter: 0 }] },
      '0020': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R2', qty: 1, type: '本厂报工', createTime: '2026-06-29 13:00', creator: '钳工A', repairLog: '清洗检查完成，确认型腔磨损情况', photosBefore: 3, photosAfter: 0 }] },
    },
  },
  'WX-WO-20260629-002': {
    completedUpTo: 1,
    currentActive: 2,
    outsourceCreated: false,
    paused: false,
    extraTasks: [],
    inboundRecords: [],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-06-29 11:30', creator: '钳工A', repairLog: '拆模完成', photosBefore: 2, photosAfter: 0 }] },
      '0020': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R2', qty: 1, type: '本厂报工', createTime: '2026-06-29 14:00', creator: '钳工A', repairLog: '清洗检查，确认顶针断裂', photosBefore: 3, photosAfter: 0 }] },
    },
  },
  'WX-WO-20260628-001': {
    completedUpTo: 2,
    currentActive: 3,
    outsourceCreated: false,
    paused: false,
    extraTasks: [],
    inboundRecords: [],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-06-28 16:00', creator: '钳工A', repairLog: '拆检查完成', photosBefore: 2, photosAfter: 0 }] },
      '0020': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R2', qty: 1, type: '本厂报工', createTime: '2026-06-29 10:00', creator: '钳工A', repairLog: '滑块研配完成，动作顺畅', photosBefore: 2, photosAfter: 2 }] },
      '0030': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R3', qty: 1, type: '本厂报工', createTime: '2026-06-29 15:00', creator: '钳工A', repairLog: '试模验证通过', photosBefore: 0, photosAfter: 3 }] },
    },
  },
  'WX-WO-20260628-002': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: true,
    paused: false,
    extraTasks: [],
    inboundRecords: [],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-06-28 10:00', creator: '钳工B', repairLog: '拆模完成', photosBefore: 2, photosAfter: 0 }] },
      '0020': { outsourceQty: 1, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{ id: 'OS-001', outNo: 'WX-OUT-20260628-001', qty: 1, vendor: '精达模具有限公司', planSendDate: '2026-06-28', planReturnDate: '2026-07-05', processReq: '型芯断裂修复，精密加工更换', remark: '加急处理', createTime: '2026-06-28 14:00', creator: '钳工B', status: '委外中', arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 }], reportRecords: [] },
    },
  },
  'WX-WO-20260627-001': {
    completedUpTo: 3,
    currentActive: -1,
    outsourceCreated: false,
    paused: false,
    extraTasks: [],
    inboundRecords: [
      { id: 'IB-001', inboundNo: 'RK-20260628-001', qty: 1, type: '自制完工', warehouse: '模具成品仓', createTime: '2026-06-28 16:00', creator: '钳工A', inspector: '质检组', inspectResult: '合格' },
    ],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-06-27 15:00', creator: '钳工A', repairLog: '抛光处理完成', photosBefore: 3, photosAfter: 3 }] },
      '0020': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R2', qty: 1, type: '本厂报工', createTime: '2026-06-28 09:00', creator: '钳工A', repairLog: '合模检测通过', photosBefore: 0, photosAfter: 2 }] },
      '0030': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R3', qty: 1, type: '本厂报工', createTime: '2026-06-28 13:00', creator: '钳工A', repairLog: '试模验证通过', photosBefore: 0, photosAfter: 2 }] },
      '9999': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R4', qty: 1, type: '本厂报工', createTime: '2026-06-28 15:00', creator: '质检组', repairLog: '最终检验合格', photosBefore: 0, photosAfter: 1 }] },
    },
  },
  'WX-WO-20260715-001': {
    completedUpTo: 0,
    currentActive: 1,
    outsourceCreated: true,
    paused: false,
    extraTasks: [],
    inboundRecords: [],
    processData: {
      '0010': { outsourceQty: 0, reportedQty: 1, outsourceType: '全部自制', outsourceRecords: [], reportRecords: [{ id: 'R1', qty: 1, type: '本厂报工', createTime: '2026-07-15 10:00', creator: '钳工A', repairLog: '拆模检查完成', photosBefore: 2, photosAfter: 0 }] },
      '0020': { outsourceQty: 1, reportedQty: 0, outsourceType: '全部委外', outsourceRecords: [{ id: 'OS-002', outNo: 'WX-OUT-20260715-001', qty: 1, vendor: '瑞盛模具技术服务', planSendDate: '2026-07-15', planReturnDate: '2026-07-22', processReq: '型腔精密修复，激光熔覆', remark: '', createTime: '2026-07-15 14:00', creator: '钳工A', status: '委外中', arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0 }], reportRecords: [] },
    },
  },
}

const CURRENT_USER = '钳工A'
const IS_ADMIN = CURRENT_USER === 'ADMIN'

export default function MyRepairTasksPage() {
  const [progressMap, setProgressMap] = useState(WO_PROGRESS)
  const [extraTasksMap, setExtraTasksMap] = useState<Record<string, RepairTask[]>>(() => {
    const map: Record<string, RepairTask[]> = {}
    Object.entries(WO_PROGRESS).forEach(([woNo, prog]) => {
      map[woNo] = prog.extraTasks || []
    })
    return map
  })

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ExecStatus | ''>('')
  const [onlyMine, setOnlyMine] = useState(true)
  const [detail, setDetail] = useState<RepairTask | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'process' | 'outsource' | 'inbound'>('overview')
  const [scrapModal, setScrapModal] = useState(false)
  const [scrapForm, setScrapForm] = useState({ reason: '', partName: '', qty: 1, remark: '' })
  const [reportModal, setReportModal] = useState<RepairTask | null>(null)
  const [reportForm, setReportForm] = useState({ completedQty: '', remark: '', reportType: '本厂报工' as '本厂报工' | '委外报工', repairLog: '', photosBefore: 0, photosAfter: 0 })
  const [showMultiOutsourceModal, setShowMultiOutsourceModal] = useState(false)
  const [multiOutsourceTask, setMultiOutsourceTask] = useState<RepairTask | null>(null)
  const [multiOutsourceForm, setMultiOutsourceForm] = useState({
    vendor: REPAIR_VENDORS[0],
    planSendDate: '',
    planReturnDate: '',
    outsourceQty: 0,
    totalQty: 0,
    processReq: '',
    remark: '',
    processList: [] as { processCode: string; processName: string; totalQty: number; selected: boolean }[],
  })

  const statusTabs = [
    { label: '全部', color: 'text-gray-700', bar: 'bg-gray-400', key: '', activeBg: 'bg-gray-100', activeRing: 'ring-gray-300' },
    { label: '进行中', color: 'text-blue-700', bar: 'bg-[#1e5fa8]', key: '进行中', activeBg: 'bg-[#1e5fa8]/10', activeRing: 'ring-[#1e5fa8]/40' },
    { label: '暂停', color: 'text-yellow-700', bar: 'bg-yellow-400', key: '暂停', activeBg: 'bg-yellow-50', activeRing: 'ring-yellow-300' },
    { label: '待检验', color: 'text-purple-700', bar: 'bg-purple-400', key: '待检验', activeBg: 'bg-purple-50', activeRing: 'ring-purple-300' },
    { label: '委外中', color: 'text-amber-700', bar: 'bg-amber-400', key: '委外中', activeBg: 'bg-amber-50', activeRing: 'ring-amber-300' },
    { label: '已完成', color: 'text-emerald-700', bar: 'bg-emerald-400', key: '已完成', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-300' },
  ]

  const getProcessData = (woNo: string, processCode: string) => {
    const progress = progressMap[woNo]
    if (!progress || !progress.processData) {
      return { outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as ProcessOutsourceType, outsourceRecords: [], reportRecords: [] }
    }
    return progress.processData[processCode] || { outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as ProcessOutsourceType, outsourceRecords: [], reportRecords: [] }
  }

  const getInboundRecords = (woNo: string) => {
    return progressMap[woNo]?.inboundRecords || []
  }

  const visibleTasks = useMemo(() => {
    const result: RepairTask[] = []

    Object.entries(REPAIR_WO_ROUTES).forEach(([woNo, route]) => {
      if (onlyMine && !IS_ADMIN && route.woIssuer !== CURRENT_USER) return

      const progress = progressMap[woNo]
      const extras = extraTasksMap[woNo] || []
      const planQty = route.planQty || 1

      if (progress.currentActive < 0 && progress.completedUpTo >= 0) {
        const lastIdx = progress.completedUpTo
        const proc = route.processes[lastIdx]
        const pData = getProcessData(woNo, proc.code)
        result.push({
          id: `${woNo}-${proc.code}`,
          taskNo: `WX-TK-${woNo.replace('WX-WO-', '')}-${proc.code}`,
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
          canOutsource: proc.canOutsource || proc.isOutsource || false,
          isInspect: proc.isInspect || false,
          isReWork: false,
          completedQty: planQty,
          remark: '',
          planQty,
          outsourceQty: pData.outsourceQty,
          reportedQty: pData.reportedQty,
          outsourceType: pData.outsourceType,
          outsourceRecords: pData.outsourceRecords,
          reportRecords: pData.reportRecords,
          defectReason: route.defectReason,
          defectDetail: route.defectDetail,
          inboundWarehouse: route.inboundWarehouse,
        })
      }

      if (progress.currentActive >= 0) {
        const proc = route.processes[progress.currentActive]
        const pData = getProcessData(woNo, proc.code)
        if (proc.isOutsource && progress.outsourceCreated) {
          result.push({
            id: `${woNo}-${proc.code}-OS`,
            taskNo: `WX-TK-${woNo.replace('WX-WO-', '')}-${proc.code}-OS`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            processName: `${proc.name}（委外）`,
            processSeq: proc.code + '-O',
            workCenter: '委外',
            planHours: proc.hours,
            assignee: REPAIR_VENDORS[0],
            woIssuer: route.woIssuer,
            startTime: '-',
            endTime: '',
            status: '委外中',
            isOutsource: true,
            canOutsource: true,
            isInspect: false,
            isReWork: false,
            completedQty: 0,
            remark: '已送外加工',
            outsourceVendor: REPAIR_VENDORS[0],
            outsourceProgress: 45,
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
            defectReason: route.defectReason,
            defectDetail: route.defectDetail,
            inboundWarehouse: route.inboundWarehouse,
          })
        } else if (proc.isOutsource && !progress.outsourceCreated) {
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `WX-TK-${woNo.replace('WX-WO-', '')}-${proc.code}`,
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
            completedQty: 0,
            remark: '等待委外发起',
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
            defectReason: route.defectReason,
            defectDetail: route.defectDetail,
            inboundWarehouse: route.inboundWarehouse,
          })
        } else if (!proc.isOutsource) {
          let taskStatus: ExecStatus = progress.paused ? '暂停' : '进行中'
          if (proc.isInspect) {
            taskStatus = '待检验'
          }
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `WX-TK-${woNo.replace('WX-WO-', '')}-${proc.code}`,
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
            canOutsource: proc.canOutsource || false,
            isInspect: proc.isInspect || false,
            isReWork: false,
            completedQty: 0,
            remark: progress.paused ? '等待配件' : '',
            planQty,
            outsourceQty: pData.outsourceQty,
            reportedQty: pData.reportedQty,
            outsourceType: pData.outsourceType,
            outsourceRecords: pData.outsourceRecords,
            reportRecords: pData.reportRecords,
            defectReason: route.defectReason,
            defectDetail: route.defectDetail,
            inboundWarehouse: route.inboundWarehouse,
          })
        }
      }

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

  const openMultiOutsourceModal = (task: RepairTask) => {
    const woNo = task.woNo
    const route = REPAIR_WO_ROUTES[woNo]
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
      vendor: REPAIR_VENDORS[0],
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
      alert('请至少选择1道工序')
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

    setExtraTasksMap(prev => {
      const next = { ...prev }
      if (next[woNo]) {
        next[woNo] = next[woNo].map(t => {
          const procCode = t.processSeq.replace('-O', '')
          if (selectedProcesses.some(p => p.processCode === procCode)) {
            return {
              ...t,
              mergedOutNo,
              isMergedOutsource: true,
              status: '委外中' as ExecStatus,
              outsourceVendor: multiOutsourceForm.vendor,
              outsourceProgress: 0,
            }
          }
          return t
        })
      }
      return next
    })

    alert(`委外任务单已创建！\n\n委外单号：${mergedOutNo}\n工单号：${woNo}\n工序：${selectedProcesses.map(p => p.processName).join('、')}\n委外数量：${outsourceQty}套\n供应商：${multiOutsourceForm.vendor}\n预计交货：${multiOutsourceForm.planReturnDate}\n\n可打印单据后交由采购对接。`)
    setShowMultiOutsourceModal(false)
    setMultiOutsourceTask(null)
  }

  const submitReport = () => {
    if (!reportModal) return
    const qty = Number(reportForm.completedQty)
    if (!qty || qty <= 0) {
      alert('请输入有效的报工数量')
      return
    }

    const route = REPAIR_WO_ROUTES[reportModal.woNo]
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

    const newRecord: ReportRecord = {
      id: `R-${Date.now()}`,
      qty,
      type: '本厂报工',
      createTime: new Date().toLocaleString('zh-CN'),
      creator: CURRENT_USER,
      repairLog: reportForm.repairLog,
      photosBefore: reportForm.photosBefore,
      photosAfter: reportForm.photosAfter,
    }

    const progress = progressMap[reportModal.woNo]
    if (route && progress) {
      const procIdx = route.processes.findIndex(p => p.code === reportModal.processSeq.replace('-O', ''))
      if (procIdx === progress.currentActive && !reportModal.isReWork && !reportModal.isInspect) {
        const newTotalReportedQty = totalReportedQty + qty
        const isFullyCompleted = newTotalReportedQty === planQty

        setProgressMap(prev => {
          const prevData = prev[reportModal.woNo].processData?.[reportModal.processSeq.replace('-O', '')] || {
            outsourceQty: 0, reportedQty: 0, outsourceType: '全部自制' as const, outsourceRecords: [], reportRecords: []
          }
          const nextProgress = {
            ...prev,
            [reportModal.woNo]: {
              ...prev[reportModal.woNo],
              completedUpTo: isFullyCompleted ? procIdx : prev[reportModal.woNo].completedUpTo,
              currentActive: isFullyCompleted && procIdx + 1 < route.processes.length ? procIdx + 1 :
                isFullyCompleted ? -1 : prev[reportModal.woNo].currentActive,
              paused: false,
              processData: {
                ...prev[reportModal.woNo].processData,
                [reportModal.processSeq.replace('-O', '')]: {
                  ...prevData,
                  reportedQty: newTotalReportedQty,
                  reportRecords: [...prevData.reportRecords, newRecord],
                }
              }
            }
          }
          if (isFullyCompleted && procIdx + 1 >= route.processes.length) {
            const inboundRecord: InboundRecord = {
              id: `IB-${Date.now()}`,
              inboundNo: `RK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`,
              qty: planQty,
              type: outsourceQty > 0 ? '委外回流' : '自制完工',
              warehouse: route.inboundWarehouse,
              createTime: new Date().toLocaleString('zh-CN'),
              creator: CURRENT_USER,
              inspector: '质检组',
              inspectResult: '待检',
            }
            nextProgress[reportModal.woNo].inboundRecords = [...(prev[reportModal.woNo].inboundRecords || []), inboundRecord]
          }
          return nextProgress
        })

        if (isFullyCompleted) {
          alert(`工序已全部完工！\n\n累计报工：${newTotalReportedQty}/${planQty}套\n（自制：${selfReportedQty + qty}，委外：${outsourceQty}）\n已自动流转到下一道工序。`)
        } else {
          alert(`部分报工成功！\n\n本次报工：${qty}套\n累计报工：${newTotalReportedQty}/${planQty}套\n（自制：${selfReportedQty + qty}，委外：${outsourceQty}）\n剩余自制待报工：${remainingSelfQty - qty}套`)
        }

        setReportModal(null)
        setReportForm({ completedQty: '', remark: '', reportType: '本厂报工', repairLog: '', photosBefore: 0, photosAfter: 0 })
        return
      }
    }

    setExtraTasksMap(prev => {
      const next = { ...prev }
      if (next[reportModal.woNo]) {
        next[reportModal.woNo] = next[reportModal.woNo].map(t => t.id === reportModal.id ? {
          ...t,
          completedQty: qty,
          remark: reportForm.remark,
          status: t.isInspect ? '待检验' : '已完成',
          endTime: new Date().toLocaleString('zh-CN'),
        } : t)
      }
      return next
    })
    setReportModal(null)
    setReportForm({ completedQty: '', remark: '', reportType: '本厂报工', repairLog: '', photosBefore: 0, photosAfter: 0 })
  }

  const handleRework = (task: RepairTask) => {
    const reworkCount = visibleTasks.filter(t => t.woNo === task.woNo && t.processSeq === task.processSeq && t.isReWork).length + 1
    const newTask: RepairTask = {
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
      canOutsource: false,
      isInspect: false,
      isReWork: true,
      completedQty: 0,
      remark: `返工来源：${task.taskNo}`,
      planQty: task.planQty,
      outsourceQty: 0,
      reportedQty: 0,
      outsourceType: '全部自制',
      defectReason: task.defectReason,
      defectDetail: task.defectDetail,
      inboundWarehouse: task.inboundWarehouse,
    }
    setExtraTasksMap(prev => ({
      ...prev,
      [task.woNo]: [...(prev[task.woNo] || []), newTask]
    }))
  }

  const handleAddInspect = (task: RepairTask) => {
    const inspectCount = visibleTasks.filter(t => t.woNo === task.woNo && t.processSeq === task.processSeq && t.isInspect).length + 1
    const newTask: RepairTask = {
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
      canOutsource: false,
      isInspect: true,
      isReWork: false,
      completedQty: task.completedQty || 1,
      remark: `检验来源：${task.taskNo}`,
      planQty: task.planQty,
      outsourceQty: 0,
      reportedQty: task.reportedQty || 0,
      outsourceType: task.outsourceType || '全部自制',
      defectReason: task.defectReason,
      defectDetail: task.defectDetail,
      inboundWarehouse: task.inboundWarehouse,
    }
    setExtraTasksMap(prev => ({
      ...prev,
      [task.woNo]: [...(prev[task.woNo] || []), newTask]
    }))
  }

  const handleSubmitScrap = () => {
    if (!detail || !scrapForm.reason) {
      alert('请填写报废原因')
      return
    }
    alert(`报废申请提交成功！\n\n单号：BF-${Date.now()}\n模具：${detail.moldName}\n来源：维修任务\n\n状态：待审批，等待钳工领班审批。`)
    setScrapModal(false)
    setScrapForm({ reason: '', partName: '', qty: 1, remark: '' })
    setDetail(null)
  }

  const handlePauseResume = (task: RepairTask) => {
    if (task.status === '进行中') {
      setProgressMap(prev => ({
        ...prev,
        [task.woNo]: { ...prev[task.woNo], paused: true }
      }))
    } else if (task.status === '暂停') {
      setProgressMap(prev => ({
        ...prev,
        [task.woNo]: { ...prev[task.woNo], paused: false }
      }))
    }
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
              <p><span className="font-medium">部分委外：</span>同一工序可多次申请委外，累计委外数量不超过工单总计划数量，系统自动计算委外类型（全部自制/部分委外/全部委外）。</p>
              <p><span className="font-medium">部分报工：</span>同一工序可多次报工，累计报工数量 = 工单总计划数量时，该工序才算全部完工，才能流转到下一道工序。</p>
              <p><span className="font-medium">谁创建谁负责：</span>维修工单由谁创建，就由谁负责所有工序到底，不需要领取任务。</p>
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
                {!IS_ADMIN && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none px-2 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} className="accent-[#1e5fa8]" />
                    <span className="text-gray-600">只看我的</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-9 text-sm flex-1 max-w-sm">
              <Search size={14} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索任务单号 工单 模具名称 工序名称" className="outline-none w-full text-gray-700 placeholder:text-gray-400" />
            </div>
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
                  const route = REPAIR_WO_ROUTES[task.woNo]
                  const progress = progressMap[task.woNo]
                  const totalProc = route?.processes.length || 0
                  const doneCount = progress ? progress.completedUpTo + 1 : 0
                  return (
                  <div key={task.id} onClick={() => { setDetail(task); setDetailTab('overview') }} className={cn(
                    'bg-white rounded-2xl border cursor-pointer hover:shadow-md transition-all relative overflow-hidden',
                    'border-gray-200',
                    detail?.id === task.id ? 'border-[#1e5fa8] ring-2 ring-[#1e5fa8]/20' : ''
                  )}>
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
                        <span>模号: <span className="font-mono text-gray-700">{task.moldCode}</span></span>
                        <span className="mx-2 text-gray-300">·</span>
                        <span className="text-gray-600">{task.processName}</span>
                      </div>
                      {/* 数量信息 */}
                      {task.planQty && task.planQty > 0 && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 bg-gray-50 rounded px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">计划:</span>
                            <span className="font-medium text-gray-700">{task.planQty}套</span>
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
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && !task.isOutsource && !task.isInspect && (
                            <button onClick={e => { e.stopPropagation(); setReportModal(task); setReportForm({ completedQty: String(task.planQty - (task.reportedQty || 0)), remark: task.remark, reportType: '本厂报工', repairLog: '', photosBefore: 2, photosAfter: 0 }) }} className="px-4 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                              报工
                            </button>
                          )}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && task.isOutsource && (
                            <button onClick={e => { e.stopPropagation(); openMultiOutsourceModal(task) }} className="px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1">
                              <Package size={12} /> 委外
                            </button>
                          )}
                          {task.status === '暂停' && task.woIssuer === CURRENT_USER && (
                            <button onClick={e => { e.stopPropagation(); handlePauseResume(task) }} className="px-4 py-1.5 text-xs bg-[#1e5fa8] text-white rounded-lg hover:bg-[#1a4f8f]">
                              恢复
                            </button>
                          )}
                          {task.status === '进行中' && task.woIssuer === CURRENT_USER && !task.isOutsource && !task.isInspect && (
                            <button onClick={e => { e.stopPropagation(); handlePauseResume(task) }} className="px-4 py-1.5 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                              暂停
                            </button>
                          )}
                          {task.status === '已完成' && task.woIssuer === CURRENT_USER && !task.isInspect && (
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
                        {task.isReWork && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">返工</span>}
                        {task.outsourceType && task.outsourceType !== '全部自制' && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs">{task.outsourceType}</span>}
                        {task.planQty > 0 && (
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

            {/* Tab headers */}
            <div className="flex border-b border-gray-100 px-2">
              {[
                { key: 'overview', label: '概览' },
                { key: 'process', label: '工序' },
                { key: 'outsource', label: '委外' },
                { key: 'inbound', label: '入库' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key as typeof detailTab)}
                  className={cn(
                    'flex-1 py-2.5 text-xs font-medium transition-colors relative',
                    detailTab === tab.key
                      ? 'text-[#1e5fa8]'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                  {detailTab === tab.key && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1e5fa8] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {/* 概览Tab */}
              {detailTab === 'overview' && (
                <>
                  {/* 进度卡片 */}
                  <div className="bg-gradient-to-r from-[#1e5fa8] to-[#2a7dd1] rounded-lg p-4 text-white">
                    <div className="text-xs opacity-80 mb-1">维修进度</div>
                    <div className="text-2xl font-bold mb-2">
                      {(() => {
                        const route = REPAIR_WO_ROUTES[detail.woNo]
                        const progress = progressMap[detail.woNo]
                        if (!route || !progress) return '0/0'
                        const total = route.processes.length
                        const done = progress.completedUpTo + 1
                        const current = progress.currentActive >= 0 ? progress.currentActive + 1 : total
                        return `${current}/${total}`
                      })()}
                      <span className="text-sm font-normal opacity-70 ml-1">道工序</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className="bg-white rounded-full h-1.5 transition-all"
                        style={{
                          width: `${(() => {
                            const route = REPAIR_WO_ROUTES[detail.woNo]
                            const progress = progressMap[detail.woNo]
                            if (!route || !progress || route.processes.length === 0) return 0
                            const total = route.processes.length
                            const current = progress.currentActive >= 0 ? progress.currentActive : total
                            return Math.round((current / total) * 100)
                          })()}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* 关键指标 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">工序总数</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {REPAIR_WO_ROUTES[detail.woNo]?.processes.length || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">已完成</div>
                      <div className="text-lg font-semibold text-emerald-600">
                        {progressMap[detail.woNo]?.completedUpTo >= 0 ? progressMap[detail.woNo]!.completedUpTo + 1 : 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">委外单</div>
                      <div className="text-lg font-semibold text-amber-600">
                        {(() => {
                          const pData = getProcessData(detail.woNo, detail.processSeq.replace('-O', ''))
                          return pData.outsourceRecords?.length || 0
                        })()}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">入库批次</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {getInboundRecords(detail.woNo).length}
                      </div>
                    </div>
                  </div>

                  {/* 数量信息 */}
                  {detail.planQty && detail.planQty > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-medium text-blue-700 mb-2">数量信息</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">工单总数量</span>
                          <span className="font-medium text-gray-800">{detail.planQty}套</span>
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

                  {/* 基本信息 */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">基本信息</div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {[
                        ['任务单号', detail.taskNo],
                        ['关联工单', detail.woNo],
                        ['模具编号', detail.moldCode],
                        ['模具名称', detail.moldName],
                        ['工序名称', detail.processName],
                        ['工作中心', detail.workCenter],
                        ['执行人', detail.assignee || '—'],
                        ['工单负责人', detail.woIssuer],
                        ...(detail.mergedOutNo ? [['合并委外单号', detail.mergedOutNo] as [string, string]] : []),
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-400 text-xs w-20 shrink-0">{label}</span>
                          <span className="text-gray-800 text-xs text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 模具故障信息 */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">故障信息</div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs w-20 shrink-0">故障原因</span>
                        <span className="text-gray-800 text-xs text-right">{detail.defectReason || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs w-20 shrink-0">故障详情</span>
                        <span className="text-gray-800 text-xs text-right">{detail.defectDetail || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs w-20 shrink-0">入库仓库</span>
                        <span className="text-gray-800 text-xs text-right">{detail.inboundWarehouse || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap mt-1">
                    {detail.isInspect && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">检验任务</span>}
                    {detail.isOutsource && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-xs">委外工序</span>}
                    {detail.isMergedOutsource && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">合并委外</span>}
                    {detail.isReWork && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">返工任务</span>}
                    {detail.outsourceType && detail.outsourceType !== '全部自制' && (
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        detail.outsourceType === '全部委外' ? 'bg-amber-100 text-amber-700' : 'bg-orange-50 text-orange-600'
                      )}>{detail.outsourceType}</span>
                    )}
                  </div>
                </>
              )}

              {/* 工序Tab */}
              {detailTab === 'process' && (
                <>
                  {(() => {
                    const route = REPAIR_WO_ROUTES[detail.woNo]
                    const progress = progressMap[detail.woNo]
                    if (!route || !progress) return null
                    const isAllDone = progress.currentActive < 0
                    const currentProcIdx = route.processes.findIndex(p => p.code === detail.processSeq.replace('-O', ''))
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-2 font-medium flex items-center justify-between">
                          <span>工艺路径</span>
                          {isAllDone
                            ? <span className="text-emerald-600 font-medium">✓ 已全部完工</span>
                            : <span className="text-gray-800 font-medium">第 {progress.currentActive + 1} / {route.processes.length} 道</span>
                          }
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="space-y-2">
                            {route.processes.map((p, i) => {
                              const isDone = i <= progress.completedUpTo
                              const isCurrent = i === progress.currentActive
                              const isViewing = i === currentProcIdx
                              const pData = getProcessData(detail.woNo, p.code)
                              return (
                                <div key={p.code} className={cn(
                                  'rounded-lg px-3 py-2.5',
                                  isViewing ? 'bg-blue-100/50 ring-1 ring-blue-200' : 'bg-white border border-gray-100'
                                )}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      isDone ? 'bg-emerald-500' : isCurrent ? 'bg-[#1e5fa8]' : 'bg-gray-200'
                                    }`}>
                                      {isDone ? <Check size={10} className="text-white" /> : null}
                                    </div>
                                    <span className={`text-xs flex-1 font-medium ${
                                      isDone ? 'text-gray-500' : isCurrent ? 'text-gray-800' : 'text-gray-400'
                                    }`}>
                                      {p.name}
                                      {p.isOutsource && <span className="ml-1 text-amber-500">（委外）</span>}
                                      {p.isInspect && <span className="ml-1 text-purple-500">（检验）</span>}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{p.hours}h</span>
                                  </div>
                                  {(isDone || isCurrent) && pData.reportedQty > 0 && (
                                    <div className="mt-1.5 ml-7 text-[10px] text-gray-500">
                                      已报工: <span className="text-emerald-600 font-medium">{pData.reportedQty}</span>
                                      {pData.outsourceQty > 0 && <span className="text-amber-600 ml-2">委外: {pData.outsourceQty}</span>}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* 报工记录 */}
                  {(() => {
                    const pData = getProcessData(detail.woNo, detail.processSeq.replace('-O', ''))
                    if (!pData.reportRecords || pData.reportRecords.length === 0) return null
                    return (
                      <div>
                        <div className="text-xs text-gray-500 mb-2 font-medium">本工序报工记录</div>
                        <div className="space-y-2">
                          {pData.reportRecords.map(record => (
                            <div key={record.id} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-emerald-700">{record.type}</span>
                                <span className="text-[10px] text-gray-400">{record.createTime}</span>
                              </div>
                              <div className="text-xs text-gray-600">
                                数量: <span className="font-medium text-emerald-600">{record.qty}套</span>
                              </div>
                              {record.repairLog && (
                                <div className="text-[11px] text-gray-500 mt-1">{record.repairLog}</div>
                              )}
                              <div className="text-[10px] text-gray-400 mt-1">
                                {record.creator}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}

              {/* 委外Tab */}
              {detailTab === 'outsource' && (
                <>
                  {(() => {
                    const pData = getProcessData(detail.woNo, detail.processSeq.replace('-O', ''))
                    const allOutsourceRecords: OutsourceRecord[] = []
                    const route = REPAIR_WO_ROUTES[detail.woNo]
                    const progress = progressMap[detail.woNo]
                    if (route && progress) {
                      route.processes.forEach(p => {
                        const pd = getProcessData(detail.woNo, p.code)
                        if (pd.outsourceRecords && pd.outsourceRecords.length > 0) {
                          allOutsourceRecords.push(...pd.outsourceRecords)
                        }
                      })
                    }
                    return (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 font-medium">
                          委外记录 <span className="text-amber-600">({allOutsourceRecords.length}条)</span>
                        </div>
                        {allOutsourceRecords.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-xs">
                            暂无委外记录
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {allOutsourceRecords.map(record => (
                              <div key={record.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium text-amber-700 font-mono text-xs">{record.outNo}</span>
                                  <span className={cn(
                                    'px-1.5 py-0.5 rounded text-[10px]',
                                    record.status === '已到货' || record.status === '已检验' ? 'bg-emerald-100 text-emerald-700' :
                                    record.status === '委外中' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                  )}>{record.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500 mb-2">
                                  <div>数量：<span className="font-medium text-amber-600">{record.qty}套</span></div>
                                  <div>供应商：<span className="text-gray-700">{record.vendor}</span></div>
                                  <div>预计下单：<span className="text-gray-700">{record.planSendDate}</span></div>
                                  <div>预计交货：<span className="text-gray-700">{record.planReturnDate}</span></div>
                                </div>
                                {record.processReq && (
                                  <div className="text-xs text-gray-500 mb-1">加工要求：<span className="text-gray-600">{record.processReq}</span></div>
                                )}
                                <div className="flex justify-between text-gray-400 pt-1.5 border-t border-amber-100 text-[10px]">
                                  <span>{record.creator}</span>
                                  <span>{record.createTime}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              )}

              {/* 入库Tab */}
              {detailTab === 'inbound' && (
                <>
                  {(() => {
                    const records = getInboundRecords(detail.woNo)
                    return (
                      <div className="space-y-3">
                        <div className="text-xs text-gray-500 font-medium">
                          入库批次 <span className="text-blue-600">({records.length}条)</span>
                        </div>
                        {records.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-xs">
                            暂无入库记录
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {records.map(record => (
                              <div key={record.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <div className="flex justify-between mb-2">
                                  <span className="font-medium text-blue-700 font-mono text-xs">{record.inboundNo}</span>
                                  <span className={cn(
                                    'px-1.5 py-0.5 rounded text-[10px]',
                                    record.inspectResult === '合格' ? 'bg-emerald-100 text-emerald-700' :
                                    record.inspectResult === '不合格' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                  )}>{record.inspectResult || '待检'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500 mb-2">
                                  <div>数量：<span className="font-medium text-blue-600">{record.qty}套</span></div>
                                  <div>类型：<span className="text-gray-700">{record.type}</span></div>
                                  <div className="col-span-2">仓库：<span className="text-gray-700">{record.warehouse}</span></div>
                                </div>
                                {record.inspector && (
                                  <div className="text-xs text-gray-500">检验员：<span className="text-gray-600">{record.inspector}</span></div>
                                )}
                                <div className="flex justify-between text-gray-400 pt-1.5 border-t border-blue-100 text-[10px]">
                                  <span>{record.creator}</span>
                                  <span>{record.createTime}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              )}

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
              {detail.status === '进行中' && detail.woIssuer === CURRENT_USER && !detail.isOutsource && !detail.isInspect && (
                <button onClick={() => { setReportModal(detail); setReportForm({ completedQty: String(detail.planQty - (detail.reportedQty || 0)), remark: detail.remark, reportType: '本厂报工', repairLog: '', photosBefore: 2, photosAfter: 0 }) }} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">
                  <CheckCircle size={13} /> 完工报工
                </button>
              )}
              {detail.status === '进行中' && detail.woIssuer === CURRENT_USER && detail.isOutsource && (
                <button onClick={() => openMultiOutsourceModal(detail)} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-amber-600 text-white rounded hover:bg-amber-700">
                  <Package size={13} /> 发起委外
                </button>
              )}
              {(detail.status === '进行中' || detail.status === '暂停') && detail.woIssuer === CURRENT_USER && !detail.isInspect && (
                <button onClick={() => setScrapModal(true)} className="w-full flex items-center justify-center gap-1.5 h-8 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  <Trash2 size={13} /> 申请报废
                </button>
              )}
              {detail.status === '已完成' && detail.woIssuer === CURRENT_USER && !detail.isInspect && (
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

        {/* Scrap Modal */}
        {scrapModal && detail && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[480px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} className="text-red-500" />
                  <h3 className="text-base font-semibold text-gray-800">申请报废</h3>
                </div>
                <button onClick={() => setScrapModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span>报废申请提交后需钳工领班审批，审批通过后将转入报废仓，请谨慎操作。</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">模具编号</span>
                    <span className="text-gray-700 font-mono">{detail.moldCode}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">模具名称</span>
                    <span className="text-gray-800">{detail.moldName}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">工序名称</span>
                    <span className="text-gray-700">{detail.processName}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 text-xs w-20 shrink-0">来源单号</span>
                    <span className="text-gray-700 font-mono">{detail.woNo}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">零部件名称 <span className="text-gray-400">(选填)</span></label>
                  <input
                    value={scrapForm.partName}
                    onChange={e => setScrapForm(f => ({ ...f, partName: e.target.value }))}
                    placeholder="如：凹模镶件"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">报废数量</label>
                  <input
                    type="number"
                    value={scrapForm.qty}
                    onChange={e => setScrapForm(f => ({ ...f, qty: Number(e.target.value) }))}
                    min={1}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">报废原因 <span className="text-red-500">*</span></label>
                  <textarea
                    value={scrapForm.reason}
                    onChange={e => setScrapForm(f => ({ ...f, reason: e.target.value }))}
                    rows={3}
                    placeholder="请详细描述报废原因"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">备注</label>
                  <textarea
                    value={scrapForm.remark}
                    onChange={e => setScrapForm(f => ({ ...f, remark: e.target.value }))}
                    rows={2}
                    placeholder="选填"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setScrapModal(false)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
                <button onClick={handleSubmitScrap} className="px-5 h-8 text-sm bg-red-500 text-white rounded hover:bg-red-600">提交报废申请</button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {reportModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-orange-500" />
                  <h3 className="text-base font-semibold text-gray-800">工序完工报工</h3>
                  <span className="text-xs text-gray-400 font-mono">{reportModal.taskNo}</span>
                </div>
                <button onClick={() => setReportModal(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{reportModal.processName}</span> · {reportModal.moldName}
                </div>

                {/* 数量信息 */}
                <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">工单总计划数量</span>
                      <span className="font-medium text-gray-800">{reportModal.planQty}套</span>
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
                      <span className="font-medium text-red-600">{reportModal.planQty - (reportModal.outsourceQty || 0) - ((reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) > 0 ? (reportModal.reportedQty || 0) - (reportModal.outsourceQty || 0) : 0)}套</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700 flex items-start gap-2">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  <p>本厂自制部分在此报工，委外部分到货后请在「委外到货登记」页面登记，系统自动完成委外报工。</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">本次报工数量 <span className="text-red-500">*</span></label>
                    <input type="number" value={reportForm.completedQty} onChange={e => setReportForm(f => ({ ...f, completedQty: e.target.value }))} className="w-full border border-gray-200 rounded px-3 h-9 text-sm outline-none focus:border-emerald-500" placeholder={`最大可报工 ${reportModal.planQty - (reportModal.reportedQty || 0)}`} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">计划工时</label>
                    <div className="w-full border border-gray-200 rounded px-3 h-9 text-sm flex items-center text-gray-500 bg-gray-50">
                      {reportModal.planHours} 小时
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5"><span className="text-red-500">*</span> 维修过程记录</label>
                  <textarea
                    value={reportForm.repairLog}
                    onChange={e => setReportForm(f => ({ ...f, repairLog: e.target.value }))}
                    rows={3}
                    placeholder="请详细记录维修过程、检测结果、修复措施、注意事项..."
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* 照片上传 */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">维修前后对比照片</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] text-gray-500 mb-1.5">维修前（{reportForm.photosBefore} 张）</div>
                      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                        {Array.from({ length: reportForm.photosBefore }).map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded border border-gray-200 flex items-center justify-center relative">
                            <Camera size={14} className="text-gray-400" />
                            <button onClick={() => setReportForm(f => ({ ...f, photosBefore: f.photosBefore - 1 }))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/40 text-white rounded-full text-[10px]">×</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setReportForm(f => ({ ...f, photosBefore: f.photosBefore + 1 }))} className="w-full border border-dashed border-gray-300 rounded py-1 text-[11px] text-gray-500 hover:border-orange-400 hover:text-orange-500">
                        <Camera size={11} className="inline mr-1" /> 添加照片
                      </button>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-500 mb-1.5">维修后（{reportForm.photosAfter} 张）</div>
                      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                        {Array.from({ length: reportForm.photosAfter }).map((_, i) => (
                          <div key={i} className="aspect-square bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center relative">
                            <Camera size={14} className="text-emerald-400" />
                            <button onClick={() => setReportForm(f => ({ ...f, photosAfter: f.photosAfter - 1 }))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/40 text-white rounded-full text-[10px]">×</button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setReportForm(f => ({ ...f, photosAfter: f.photosAfter + 1 }))} className="w-full border border-dashed border-gray-300 rounded py-1 text-[11px] text-gray-500 hover:border-emerald-400 hover:text-emerald-500">
                        <Camera size={11} className="inline mr-1" /> 添加照片
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">备注</label>
                  <textarea value={reportForm.remark} onChange={e => setReportForm(f => ({ ...f, remark: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-emerald-500 resize-none" />
                </div>
              </div>
              <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <button onClick={() => setReportModal(null)} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50">取消</button>
                  <button onClick={submitReport} className="px-5 h-8 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700">提交报工</button>
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
                    <div>计划数量：{multiOutsourceTask.planQty} 套</div>
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
                    {REPAIR_VENDORS.map((v, i) => (
                      <option key={v} value={v}>{v}{i === 0 ? '（默认）' : ''}</option>
                    ))}
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
                      <div>计划数量：<span className="text-purple-700">{multiOutsourceForm.totalQty} 套</span></div>
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
                      <span className="text-xs text-gray-500">/ {multiOutsourceForm.totalQty} 套</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">自制数量</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-9 px-3 text-sm bg-gray-100 rounded flex items-center text-gray-600">
                        {multiOutsourceForm.totalQty - multiOutsourceForm.outsourceQty}
                      </div>
                      <span className="text-xs text-gray-500">套</span>
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
                    生成委外任务单
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
