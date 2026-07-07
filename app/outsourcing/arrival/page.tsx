'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  Search, RotateCcw, ChevronDown, Plus, X,
  Truck, CheckCircle, Package, AlertTriangle, Info,
  QrCode, Printer, FileText, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type OutsourceStatus = '已下达' | '委外中' | '部分到货' | '全部到货'
type SourceType = '生产' | '保养' | '维修'
type TabType = '全部' | SourceType

interface ProcessItem {
  processCode: string
  processName: string
  totalQty: number
  outsourceQty: number
  arrivedQty: number
  qualifiedQty: number
  defectiveQty: number
  processRemark?: string
}

interface ProcessAllocation {
  processCode: string
  processName: string
  arrivalQty: number
  qualifiedQty: number
  defectiveQty: number
}

interface ArrivalRecord {
  id: string
  arrivalNo: string
  arrivalDate: string
  qty: number
  qualifiedQty: number
  defectiveQty: number
  inspector: string
  remark: string
  processAllocations?: ProcessAllocation[]
}

interface OutsourceOrder {
  id: string
  outNo: string
  sourceType: SourceType
  woNo: string
  moldCode: string
  moldName: string
  processCode: string
  processName: string
  supplier: string
  processReq: string
  planSendDate: string
  planReturnDate: string
  totalQty: number
  arrivedQty: number
  qualifiedQty: number
  defectiveQty: number
  status: OutsourceStatus
  creator: string
  createTime: string
  remark: string
  arrivalRecords: ArrivalRecord[]
  maintainId?: string
  repairId?: string
}

const STATUS_STYLES: Record<OutsourceStatus, string> = {
  '已下达': 'bg-blue-100 text-blue-700',
  '委外中': 'bg-amber-100 text-amber-700',
  '部分到货': 'bg-orange-100 text-orange-700',
  '全部到货': 'bg-emerald-100 text-emerald-700',
}

const SOURCE_STYLES: Record<SourceType, string> = {
  '生产': 'bg-blue-50 text-blue-600',
  '保养': 'bg-green-50 text-green-700',
  '维修': 'bg-orange-50 text-orange-700',
}

const ORDER_TYPE_STYLES: Record<string, string> = {
  '单工序委外': 'bg-violet-100 text-violet-700',
}

const SUPPLIERS = ['精工热处理厂', '恒辉热处理有限公司', '东方外协中心', '华强外协加工', '明光电镀厂', '精达机加工厂', '龙泰表面处理']

const WORK_ORDERS = [
  { woNo: 'WO-2024-001', moldCode: '190038', moldName: '7686SO三工位成形凹模' },
  { woNo: 'WO-2024-004', moldCode: '45021', moldName: '1850L下模仁' },
  { woNo: 'WO-2024-005', moldCode: '33089', moldName: 'X200成型凸模' },
  { woNo: 'WO-2024-009', moldCode: '35012', moldName: 'X300冲头' },
  { woNo: 'WO-2024-010', moldCode: '48033', moldName: '5600T下模固定板' },
  { woNo: 'WO-2024-012', moldCode: '55021', moldName: '6300T上模垫板' },
  { woNo: 'WO-2024-014', moldCode: '77003', moldName: '5200T卸料板' },
  { woNo: 'WO-2024-015', moldCode: '91002', moldName: '7200T上模板' },
]

const MOCK_ORDERS: OutsourceOrder[] = [
  {
    id: 'O001',
    outNo: 'OUT-2024-001',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-001',
    moldCode: '190038',
    moldName: '7686SO三工位成形凹模',
    processCode: '0030',
    processName: '热处理',
    supplier: '精工热处理厂',
    processReq: '调质处理，硬度HRC28-32，需提供热处理工艺卡',
    planSendDate: '2024-06-21',
    planReturnDate: '2024-06-25',
    totalQty: 10,
    arrivedQty: 4,
    qualifiedQty: 4,
    defectiveQty: 0,
    status: '部分到货',
    creator: '钳工A',
    createTime: '2024-06-21 10:00',
    remark: '',
    arrivalRecords: [
      { id: 'A001', arrivalNo: 'ARR-2024-001-01', arrivalDate: '2024-06-23', qty: 4, qualifiedQty: 4, defectiveQty: 0, inspector: '王检验', remark: '首批到货，抽检合格' },
    ],
  },
  {
    id: 'O002',
    outNo: 'OUT-2024-002',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-005',
    moldCode: '33089',
    moldName: 'X200成型凸模',
    processCode: '0030',
    processName: '热处理',
    supplier: '恒辉热处理有限公司',
    processReq: '真空淬火，硬度HRC58-62',
    planSendDate: '2024-06-22',
    planReturnDate: '2024-06-28',
    totalQty: 5,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '已下达',
    creator: '钳工A',
    createTime: '2024-06-22 14:00',
    remark: '',
    arrivalRecords: [],
  },
  {
    id: 'O003',
    outNo: 'OUT-2024-003',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-009',
    moldCode: '35012',
    moldName: 'X300冲头',
    processCode: '0020',
    processName: '热处理',
    supplier: '精工热处理厂',
    processReq: '淬火+回火，硬度HRC60-64',
    planSendDate: '2024-06-25',
    planReturnDate: '2024-07-02',
    totalQty: 20,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '已下达',
    creator: '钳工A',
    createTime: '2024-06-25 09:00',
    remark: '',
    arrivalRecords: [],
  },
  {
    id: 'O004',
    outNo: 'OUT-2024-004',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-014',
    moldCode: '77003',
    moldName: '5200T卸料板',
    processCode: '0020',
    processName: '热处理',
    supplier: '恒辉热处理有限公司',
    processReq: '调质处理HB260-290',
    planSendDate: '2024-06-27',
    planReturnDate: '2024-07-03',
    totalQty: 2,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '已下达',
    creator: '钳工A',
    createTime: '2024-06-27 10:00',
    remark: '',
    arrivalRecords: [],
  },
  {
    id: 'O005',
    outNo: 'OUT-2024-005',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-010',
    moldCode: '48033',
    moldName: '5600T下模固定板',
    processCode: '0020',
    processName: '热处理',
    supplier: '精工热处理厂',
    processReq: '淬火+低温回火，硬度HRC45-50',
    planSendDate: '2024-06-20',
    planReturnDate: '2024-06-26',
    totalQty: 2,
    arrivedQty: 2,
    qualifiedQty: 2,
    defectiveQty: 0,
    status: '全部到货',
    creator: '钳工A',
    createTime: '2024-06-20 16:00',
    remark: '',
    arrivalRecords: [
      { id: 'A002', arrivalNo: 'ARR-2024-005-01', arrivalDate: '2024-06-26', qty: 2, qualifiedQty: 2, defectiveQty: 0, inspector: '李检验', remark: '全部合格' },
    ],
  },
  {
    id: 'O006',
    outNo: 'OUT-2024-006',
    sourceType: '生产',
    orderType: '单工序委外',
    woNo: 'WO-2024-012',
    moldCode: '55021',
    moldName: '6300T上模垫板',
    processCode: '0020',
    processName: '热处理',
    supplier: '东方外协中心',
    processReq: '正火处理',
    planSendDate: '2024-06-18',
    planReturnDate: '2024-06-23',
    totalQty: 6,
    arrivedQty: 6,
    qualifiedQty: 5,
    defectiveQty: 1,
    status: '全部到货',
    creator: '钳工A',
    createTime: '2024-06-18 11:00',
    remark: '1件硬度不达标，返工中',
    arrivalRecords: [
      { id: 'A003', arrivalNo: 'ARR-2024-006-01', arrivalDate: '2024-06-23', qty: 6, qualifiedQty: 5, defectiveQty: 1, inspector: '王检验', remark: '其中1件硬度偏低，已退回供应商返工' },
    ],
  },
  {
    id: 'OM001',
    outNo: 'OUT-MTN-001',
    sourceType: '保养',
    orderType: '单工序委外',
    woNo: '',
    moldCode: '190038',
    moldName: '7686SO三工位成形凹模',
    processCode: '',
    processName: '电镀修复',
    supplier: '明光电镀厂',
    processReq: '镀铬修复分型面磨损区域，厚度0.05-0.08mm',
    planSendDate: '2024-07-10',
    planReturnDate: '2024-07-14',
    totalQty: 1,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '已下达',
    creator: '钳工A',
    createTime: '2024-07-09 10:00',
    remark: '保养计划 MTN-2024-005 发起',
    arrivalRecords: [],
    maintainId: 'MTN-2024-005',
  },
  {
    id: 'OM002',
    outNo: 'OUT-MTN-002',
    sourceType: '保养',
    orderType: '单工序委外',
    woNo: '',
    moldCode: '26015',
    moldName: 'Y587成形凹模',
    processCode: '',
    processName: '氮化处理',
    supplier: '精工热处理厂',
    processReq: '气体氮化，深度0.3-0.5mm，硬度HV900以上',
    planSendDate: '2024-07-08',
    planReturnDate: '2024-07-18',
    totalQty: 1,
    arrivedQty: 1,
    qualifiedQty: 1,
    defectiveQty: 0,
    status: '全部到货',
    creator: '钳工A',
    createTime: '2024-07-08 09:00',
    remark: '',
    arrivalRecords: [
      { id: 'AM001', arrivalNo: 'ARR-MTN-002-01', arrivalDate: '2024-07-18', qty: 1, qualifiedQty: 1, defectiveQty: 0, inspector: '质检组', remark: '检验合格' },
    ],
    maintainId: 'MTN-2024-003',
  },
  {
    id: 'OR001',
    outNo: 'OUT-RPR-001',
    sourceType: '维修',
    orderType: '单工序委外',
    woNo: '',
    moldCode: '190041',
    moldName: '7686SO成形凹模',
    processCode: '',
    processName: '精密修复',
    supplier: '精达机加工厂',
    processReq: '型腔局部崩缺修复，补焊后精铣至尺寸',
    planSendDate: '2024-07-12',
    planReturnDate: '2024-07-20',
    totalQty: 1,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '已下达',
    creator: '钳工A',
    createTime: '2024-07-11 14:00',
    remark: '维修单 RPR-2024-008 发起',
    arrivalRecords: [],
    repairId: 'RPR-2024-008',
  },
  {
    id: 'OR002',
    outNo: 'OUT-RPR-002',
    sourceType: '维修',
    orderType: '单工序委外',
    woNo: '',
    moldCode: '26088',
    moldName: '695反挤冲头芯',
    processCode: '',
    processName: '外圆磨修复',
    supplier: '华强外协加工',
    processReq: '外圆磨损修复，磨削至原尺寸Ra0.8',
    planSendDate: '2024-07-05',
    planReturnDate: '2024-07-09',
    totalQty: 2,
    arrivedQty: 2,
    qualifiedQty: 2,
    defectiveQty: 0,
    status: '全部到货',
    creator: '钳工A',
    createTime: '2024-07-05 08:00',
    remark: '',
    arrivalRecords: [
      { id: 'AR001', arrivalNo: 'ARR-RPR-002-01', arrivalDate: '2024-07-09', qty: 2, qualifiedQty: 2, defectiveQty: 0, inspector: '质检组', remark: '尺寸合格' },
    ],
    repairId: 'RPR-2024-004',
  },
  {
    id: 'OR003',
    outNo: 'OUT-RPR-003',
    sourceType: '维修',
    orderType: '单工序委外',
    woNo: '',
    moldCode: '7664SO',
    moldName: '7664SO成形凸模',
    processCode: '',
    processName: '精密修复',
    supplier: '精达机加工厂',
    processReq: '型腔磨损区域补焊修复，精铣至尺寸Ra0.8',
    planSendDate: '2024-07-15',
    planReturnDate: '2024-07-22',
    totalQty: 1,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '委外中',
    creator: '钳工A',
    createTime: '2024-07-15 09:00',
    remark: '维修单 RPR-2024-010 发起，件已送供应商处加工',
    arrivalRecords: [],
    repairId: 'RPR-2024-010',
  },
  {
    id: 'OC001',
    outNo: 'OUT-MERGE-001',
    sourceType: '生产',
    orderType: '多工序合并委外',
    woNo: 'WO-2024-004',
    moldCode: '45021',
    moldName: '1850L下模仁',
    processCode: '0020-0040',
    processName: '粗加工→热处理→精加工',
    supplier: '东方外协中心',
    processReq: '三道工序连续委外，完成后返回',
    planSendDate: '2024-06-20',
    planReturnDate: '2024-07-05',
    totalQty: 8,
    arrivedQty: 0,
    qualifiedQty: 0,
    defectiveQty: 0,
    status: '委外中',
    creator: '钳工A',
    createTime: '2024-06-20 09:30',
    remark: '合并委外：粗加工、热处理、精加工三道工序',
    arrivalRecords: [],
    processList: [
      { processCode: '0020', processName: '粗加工', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0, processRemark: '粗加工留余量0.3mm' },
      { processCode: '0030', processName: '热处理', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0, processRemark: '真空淬火HRC58-62' },
      { processCode: '0040', processName: '精加工', totalQty: 8, outsourceQty: 8, arrivedQty: 0, qualifiedQty: 0, defectiveQty: 0, processRemark: '精磨至尺寸，Ra0.8' },
    ],
  },
  {
    id: 'OC002',
    outNo: 'OUT-MERGE-002',
    sourceType: '生产',
    orderType: '多工序合并委外',
    woNo: 'WO-2024-015',
    moldCode: '91002',
    moldName: '7200T上模板',
    processCode: '0010-0030',
    processName: '下料→热处理→表面处理',
    supplier: '龙泰表面处理',
    processReq: '三道工序合并委外',
    planSendDate: '2024-06-25',
    planReturnDate: '2024-07-10',
    totalQty: 4,
    arrivedQty: 2,
    qualifiedQty: 2,
    defectiveQty: 0,
    status: '部分到货',
    creator: '钳工A',
    createTime: '2024-06-25 11:00',
    remark: '合并委外：下料、热处理、表面处理',
    arrivalRecords: [
      {
        id: 'AC001',
        arrivalNo: 'ARR-MERGE-002-01',
        arrivalDate: '2024-07-02',
        qty: 2,
        qualifiedQty: 2,
        defectiveQty: 0,
        inspector: '李检验',
        remark: '首批2件到货，全部合格',
        processAllocations: [
          { processCode: '0010', processName: '下料', arrivalQty: 2, qualifiedQty: 2, defectiveQty: 0 },
          { processCode: '0020', processName: '热处理', arrivalQty: 2, qualifiedQty: 2, defectiveQty: 0 },
          { processCode: '0030', processName: '表面处理', arrivalQty: 2, qualifiedQty: 2, defectiveQty: 0 },
        ],
      },
    ],
    processList: [
      { processCode: '0010', processName: '下料', totalQty: 4, outsourceQty: 4, arrivedQty: 2, qualifiedQty: 2, defectiveQty: 0, processRemark: '按图下料，留加工余量' },
      { processCode: '0020', processName: '热处理', totalQty: 4, outsourceQty: 4, arrivedQty: 2, qualifiedQty: 2, defectiveQty: 0, processRemark: '调质处理HB260-290' },
      { processCode: '0030', processName: '表面处理', totalQty: 4, outsourceQty: 4, arrivedQty: 2, qualifiedQty: 2, defectiveQty: 0, processRemark: '发黑处理' },
    ],
  },
  {
    id: 'OC003',
    outNo: 'OUT-MERGE-003',
    sourceType: '生产',
    orderType: '多工序合并委外',
    woNo: 'WO-2024-004',
    moldCode: '45021',
    moldName: '1850L下模仁',
    processCode: '0050-0060',
    processName: '电火花→线切割',
    supplier: '华强外协加工',
    processReq: '两道工序连续委外加工',
    planSendDate: '2024-06-28',
    planReturnDate: '2024-07-08',
    totalQty: 6,
    arrivedQty: 6,
    qualifiedQty: 5,
    defectiveQty: 1,
    status: '全部到货',
    creator: '钳工A',
    createTime: '2024-06-28 14:00',
    remark: '合并委外：电火花、线切割',
    arrivalRecords: [
      {
        id: 'AC002',
        arrivalNo: 'ARR-MERGE-003-01',
        arrivalDate: '2024-07-08',
        qty: 6,
        qualifiedQty: 5,
        defectiveQty: 1,
        inspector: '王检验',
        remark: '线切割1件尺寸超差',
        processAllocations: [
          { processCode: '0050', processName: '电火花', arrivalQty: 6, qualifiedQty: 6, defectiveQty: 0 },
          { processCode: '0060', processName: '线切割', arrivalQty: 6, qualifiedQty: 5, defectiveQty: 1 },
        ],
      },
    ],
    processList: [
      { processCode: '0050', processName: '电火花', totalQty: 6, outsourceQty: 6, arrivedQty: 6, qualifiedQty: 6, defectiveQty: 0, processRemark: '型腔电火花加工' },
      { processCode: '0060', processName: '线切割', totalQty: 6, outsourceQty: 6, arrivedQty: 6, qualifiedQty: 5, defectiveQty: 1, processRemark: '慢走丝线切割' },
    ],
  },
]

export default function OutsourceManagePage() {
  const [orders, setOrders] = useState<OutsourceOrder[]>(MOCK_ORDERS)
  const [activeTab, setActiveTab] = useState<TabType>('全部')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OutsourceStatus | ''>('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [selected, setSelected] = useState<OutsourceOrder | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const [showNewModal, setShowNewModal] = useState(false)
  const [newForm, setNewForm] = useState({
    sourceType: '生产' as SourceType,
    woNo: '',
    moldCode: '',
    moldName: '',
    processName: '',
    supplier: '',
    processReq: '',
    planSendDate: '',
    planReturnDate: '',
    qty: '1',
    remark: '',
  })

  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [arrivalForm, setArrivalForm] = useState({
    arrivalDate: '',
    qty: '',
    qualifiedQty: '',
    defectiveQty: '0',
    inspector: '',
    remark: '',
  })
  const [processAllocations, setProcessAllocations] = useState<ProcessAllocation[]>([])

  const [showQrModal, setShowQrModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const printRef = useRef<HTMLDivElement>(null)

  const generateQR = async (content: string) => {
    try {
      const url = await QRCode.toDataURL(content, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      setQrDataUrl(url)
    } catch (err) {
      console.error('QR generate error:', err)
    }
  }

  const openQrModal = (order: OutsourceOrder) => {
    setSelected(order)
    const qrContent = JSON.stringify({
      outNo: order.outNo,
      woNo: order.woNo,
      moldCode: order.moldCode,
      moldName: order.moldName,
      processName: order.processName,
      supplier: order.supplier,
      totalQty: order.totalQty,
    })
    generateQR(qrContent)
    setShowQrModal(true)
  }

  const handlePrint = async () => {
    if (!printRef.current || !selected) return

    const qrContent = JSON.stringify({
      outNo: selected.outNo,
      woNo: selected.woNo,
      moldCode: selected.moldCode,
      moldName: selected.moldName,
      processName: selected.processName,
      supplier: selected.supplier,
      totalQty: selected.totalQty,
    })
    try {
      await generateQR(qrContent)
    } catch (e) {
      console.error(e)
    }

    setTimeout(() => {
      if (!printRef.current) return
      const printContent = printRef.current.innerHTML
      const printWindow = window.open('', '_blank', 'width=800,height=900')
      if (!printWindow) return
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8" />
          <title>委外单 - ${selected.outNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: "Microsoft YaHei", sans-serif; padding: 30px; font-size: 14px; color: #333; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .print-header h1 { font-size: 24px; margin-bottom: 8px; }
            .print-header .subtitle { font-size: 13px; color: #666; }
            .info-section { margin-bottom: 20px; }
            .info-title { font-size: 15px; font-weight: bold; margin-bottom: 10px; padding-left: 8px; border-left: 4px solid #1e5fa8; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
            .info-item { display: flex; border-bottom: 1px dotted #ccc; padding: 4px 0; }
            .info-label { color: #666; min-width: 90px; }
            .info-value { flex: 1; }
            .qty-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .qty-table th, .qty-table td { border: 1px solid #333; padding: 8px 12px; text-align: center; }
            .qty-table th { background: #f5f5f5; font-weight: bold; }
            .remark-section { margin-top: 10px; }
            .remark-box { border: 1px solid #ccc; padding: 10px; min-height: 60px; margin-top: 5px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .footer-item { text-align: center; }
            .footer-label { margin-bottom: 30px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-section img { width: 120px; height: 120px; }
            .qr-section p { font-size: 12px; color: #666; margin-top: 5px; }
            @media print {
              body { padding: 15px; }
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
    }, 200)
  }

  const handlePrintOutbound = () => {
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id))
    if (selectedOrders.length === 0) return

    const groupedBySupplier = selectedOrders.reduce((acc, o) => {
      if (!acc[o.supplier]) acc[o.supplier] = []
      acc[o.supplier].push(o)
      return acc
    }, {} as Record<string, OutsourceOrder[]>)

    const printContents: string[] = []
    let docIndex = 1

    for (const [supplier, orderList] of Object.entries(groupedBySupplier)) {
      const today = new Date().toLocaleDateString('zh-CN')
      const printNo = `3504-${today.replace(/-/g, '')}${String(docIndex).padStart(4, '0')}`

      let tableRows = ''
      orderList.forEach((o, idx) => {
        tableRows += `
          <tr>
            <td>${idx + 1}</td>
            <td>${o.woNo || '-'}</td>
            <td>${o.sourceType === '生产' ? o.moldName.split('模')[0] : o.sourceType}</td>
            <td>${o.moldName}</td>
            <td>${o.moldCode}</td>
            <td>NO.${String(idx + 1).padStart(4, '0')}</td>
            <td>${o.totalQty}</td>
            <td>件</td>
            <td>${o.processName}</td>
            <td>${o.remark || '-'}</td>
          </tr>
        `
      })

      printContents.push(`
        <div class="page-break">
          <div class="bill-header">
            <h1>台州市百达电器有限公司</h1>
            <h2>模具出库单</h2>
            <div class="bill-info">
              <span>单号：${printNo}</span>
              <span>供应商全称：${supplier}</span>
              <span>车牌号：___________</span>
              <span>订单日期：${today}</span>
            </div>
          </div>
          <table class="bill-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>工单单号</th>
                <th>适用产品</th>
                <th>品名</th>
                <th>规格型号</th>
                <th>批号</th>
                <th>数量</th>
                <th>单位</th>
                <th>工艺</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="bill-footer">
            <div class="footer-left">
              <span>统计员：___________</span>
              <span>经办人：___________</span>
            </div>
            <div class="footer-right">
              <span>打印日期：${today}</span>
            </div>
          </div>
          <div class="bill-copies">
            <span>白联：存根</span>
            <span>蓝联：财务</span>
            <span>红联：仓库</span>
            <span>黄联：备用</span>
          </div>
        </div>
      `)
      docIndex++
    }

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>模具出库单</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Microsoft YaHei", "SimHei", sans-serif; font-size: 12px; color: #333; }
          .page-break { page-break-after: always; padding: 20px; }
          .page-break:last-child { page-break-after: avoid; }
          .bill-header { text-align: center; margin-bottom: 15px; }
          .bill-header h1 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
          .bill-header h2 { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          .bill-info { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 5px; }
          .bill-info span { font-size: 11px; }
          .bill-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .bill-table th, .bill-table td { border: 1px solid #333; padding: 6px 4px; text-align: center; font-size: 11px; }
          .bill-table th { background: #f5f5f5; font-weight: bold; }
          .bill-footer { display: flex; justify-content: space-between; margin-top: 20px; }
          .bill-footer span { font-size: 11px; }
          .footer-left { display: flex; gap: 30px; }
          .bill-copies { display: flex; justify-content: space-around; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #ccc; }
          .bill-copies span { font-size: 10px; color: #666; }
          @media print {
            body { padding: 0; }
            .page-break { padding: 15px; }
          }
        </style>
      </head>
      <body>
        ${printContents.join('')}
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

  const handlePrintInbound = () => {
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id))
    if (selectedOrders.length === 0) return

    const groupedBySupplier = selectedOrders.reduce((acc, o) => {
      if (!acc[o.supplier]) acc[o.supplier] = []
      acc[o.supplier].push(o)
      return acc
    }, {} as Record<string, OutsourceOrder[]>)

    const printContents: string[] = []
    let docIndex = 1

    for (const [supplier, orderList] of Object.entries(groupedBySupplier)) {
      const today = new Date().toLocaleDateString('zh-CN')
      const printNo = `3702-${today.replace(/-/g, '')}${String(docIndex).padStart(4, '0')}`

      let tableRows = ''
      orderList.forEach((o, idx) => {
        tableRows += `
          <tr>
            <td>${idx + 1}</td>
            <td>${o.woNo || '-'}</td>
            <td>${o.sourceType === '生产' ? o.moldName.split('模')[0] : o.sourceType}</td>
            <td>${o.moldName}</td>
            <td>${o.moldCode}</td>
            <td>NO.${String(idx + 1).padStart(4, '0')}</td>
            <td>${o.arrivedQty > 0 ? o.arrivedQty : o.totalQty}</td>
            <td>件</td>
            <td>${o.processName}</td>
            <td>${o.remark || '-'}</td>
          </tr>
        `
      })

      printContents.push(`
        <div class="page-break">
          <div class="bill-header">
            <h1>台州市百达电器有限公司</h1>
            <h2>模具入库单</h2>
            <div class="bill-info">
              <span>供应商：${supplier}</span>
              <span>单号：${printNo}</span>
              <span>制单日期：${today}</span>
            </div>
          </div>
          <table class="bill-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>工单单号</th>
                <th>适用产品</th>
                <th>品名</th>
                <th>规格型号</th>
                <th>批号</th>
                <th>数量</th>
                <th>单位</th>
                <th>工艺</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="bill-footer">
            <div class="footer-left">
              <span>统计员：___________</span>
              <span>仓库名称：电器模具仓</span>
            </div>
            <div class="footer-right">
              <span>打印日期：${today}</span>
            </div>
          </div>
        </div>
      `)
      docIndex++
    }

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>模具入库单</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Microsoft YaHei", "SimHei", sans-serif; font-size: 12px; color: #333; }
          .page-break { page-break-after: always; padding: 20px; }
          .page-break:last-child { page-break-after: avoid; }
          .bill-header { text-align: center; margin-bottom: 15px; }
          .bill-header h1 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
          .bill-header h2 { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
          .bill-info { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 5px; }
          .bill-info span { font-size: 11px; }
          .bill-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .bill-table th, .bill-table td { border: 1px solid #333; padding: 6px 4px; text-align: center; font-size: 11px; }
          .bill-table th { background: #f5f5f5; font-weight: bold; }
          .bill-footer { display: flex; justify-content: space-between; margin-top: 20px; }
          .bill-footer span { font-size: 11px; }
          .footer-left { display: flex; gap: 30px; }
          @media print {
            body { padding: 0; }
            .page-break { padding: 15px; }
          }
        </style>
      </head>
      <body>
        ${printContents.join('')}
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

  const tabs: { label: string; value: TabType; color: string }[] = [
    { label: '全部', value: '全部', color: 'text-gray-700' },
    { label: '生产', value: '生产', color: 'text-blue-700' },
    { label: '保养', value: '保养', color: 'text-green-700' },
    { label: '维修', value: '维修', color: 'text-orange-700' },
  ]

  const statusOptions: OutsourceStatus[] = ['已下达', '委外中', '部分到货', '全部到货']

  const tabCounts = useMemo(() => ({
    '全部': orders.length,
    '生产': orders.filter(t => t.sourceType === '生产').length,
    '保养': orders.filter(t => t.sourceType === '保养').length,
    '维修': orders.filter(t => t.sourceType === '维修').length,
  }), [orders])

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (activeTab !== '全部' && o.sourceType !== activeTab) return false
      if (search && !o.outNo.includes(search) && !o.woNo.includes(search) && !o.moldName.includes(search) && !o.moldCode.includes(search)) return false
      if (filterStatus && o.status !== filterStatus) return false
      if (filterSupplier && o.supplier !== filterSupplier) return false
      return true
    })
  }, [orders, activeTab, search, filterStatus, filterSupplier])

  const countOf = (key: OutsourceStatus | '') => {
    if (key === '') return filtered.length
    return filtered.filter(o => o.status === key).length
  }

  const handleCreate = () => {
    if (!newForm.supplier || !newForm.processName) {
      alert('请填写供应商和委外工序')
      return
    }
    if (newForm.sourceType === '生产' && !newForm.woNo) {
      alert('生产委外请选择关联工单')
      return
    }

    const sourcePrefix = newForm.sourceType === '保养' ? 'MTN' : newForm.sourceType === '维修' ? 'RPR' : '2024'
    const id = `O${newForm.sourceType[0]}-${Date.now()}`
    const newOrder: OutsourceOrder = {
      id,
      outNo: `OUT-${sourcePrefix}-${String(orders.filter(o => o.sourceType === newForm.sourceType).length + 1).padStart(3, '0')}`,
      sourceType: newForm.sourceType,
      orderType: '单工序委外',
      woNo: newForm.sourceType === '生产' ? newForm.woNo : '',
      moldCode: newForm.moldCode || WORK_ORDERS.find(w => w.woNo === newForm.woNo)?.moldCode || '',
      moldName: newForm.moldName || WORK_ORDERS.find(w => w.woNo === newForm.woNo)?.moldName || '',
      processCode: '',
      processName: newForm.processName,
      supplier: newForm.supplier,
      processReq: newForm.processReq,
      planSendDate: newForm.planSendDate,
      planReturnDate: newForm.planReturnDate,
      totalQty: Number(newForm.qty) || 1,
      arrivedQty: 0,
      qualifiedQty: 0,
      defectiveQty: 0,
      status: '已下达',
      creator: '钳工A',
      createTime: new Date().toLocaleString('zh-CN'),
      remark: newForm.remark,
      arrivalRecords: [],
      maintainId: newForm.sourceType === '保养' ? `MTN-${Date.now()}` : undefined,
      repairId: newForm.sourceType === '维修' ? `RPR-${Date.now()}` : undefined,
    }

    setOrders(prev => [...prev, newOrder])
    setShowNewModal(false)
    setNewForm({
      sourceType: '生产',
      woNo: '',
      moldCode: '',
      moldName: '',
      processName: '',
      supplier: '',
      processReq: '',
      planSendDate: '',
      planReturnDate: '',
      qty: '1',
      remark: '',
    })
    alert(`委外单创建成功！\n\n单号：${newOrder.outNo}\n来源：${newOrder.sourceType}\n模具：${newOrder.moldName}\n工序：${newOrder.processName}`)
  }

  const handleWoChange = (woNo: string) => {
    const wo = WORK_ORDERS.find(w => w.woNo === woNo)
    if (wo) {
      setNewForm(f => ({ ...f, woNo, moldCode: wo.moldCode, moldName: wo.moldName }))
    } else {
      setNewForm(f => ({ ...f, woNo, moldCode: '', moldName: '' }))
    }
  }

  const autoAllocate = (totalQty: number, totalQualified: number, totalDefective: number, order: OutsourceOrder) => {
    if (!order.processList || order.processList.length === 0) return []
    const remainingList = order.processList.map(p => ({
      ...p,
      remaining: p.outsourceQty - p.arrivedQty,
    }))
    const totalRemaining = remainingList.reduce((sum, p) => sum + p.remaining, 0)
    if (totalRemaining <= 0) return remainingList.map(p => ({
      processCode: p.processCode,
      processName: p.processName,
      arrivalQty: 0,
      qualifiedQty: 0,
      defectiveQty: 0,
    }))

    const allocations: ProcessAllocation[] = []
    let allocatedQty = 0
    let allocatedQualified = 0
    let allocatedDefective = 0

    for (let i = 0; i < remainingList.length; i++) {
      const p = remainingList[i]
      const isLast = i === remainingList.length - 1
      const ratio = p.remaining / totalRemaining
      let qty: number
      let qualified: number
      let defective: number

      if (isLast) {
        qty = totalQty - allocatedQty
        qualified = totalQualified - allocatedQualified
        defective = totalDefective - allocatedDefective
      } else {
        qty = Math.floor(totalQty * ratio)
        const qualRatio = totalQty > 0 ? totalQualified / totalQty : 0
        const defRatio = totalQty > 0 ? totalDefective / totalQty : 0
        qualified = Math.floor(qty * qualRatio)
        defective = qty - qualified
      }

      qty = Math.min(qty, p.remaining)
      qualified = Math.min(qualified, qty)
      defective = qty - qualified

      allocatedQty += qty
      allocatedQualified += qualified
      allocatedDefective += defective

      allocations.push({
        processCode: p.processCode,
        processName: p.processName,
        arrivalQty: qty,
        qualifiedQty: qualified,
        defectiveQty: defective,
      })
    }

    return allocations
  }

  const openArrivalModal = (order: OutsourceOrder) => {
    const remaining = order.totalQty - order.arrivedQty
    const today = new Date().toISOString().split('T')[0]
    setArrivalForm({
      arrivalDate: today,
      qty: String(remaining),
      qualifiedQty: String(remaining),
      defectiveQty: '0',
      inspector: '',
      remark: '',
    })

    if (order.orderType === '多工序合并委外' && order.processList) {
      setProcessAllocations(autoAllocate(remaining, remaining, 0, order))
    } else {
      setProcessAllocations([])
    }

    setSelected(order)
    setShowArrivalModal(true)
  }

  const handleAllocationChange = (index: number, field: 'arrivalQty' | 'qualifiedQty', value: string) => {
    const numVal = Number(value) || 0
    setProcessAllocations(prev => {
      const newAlloc = [...prev]
      const item = { ...newAlloc[index] }
      if (field === 'arrivalQty') {
        item.arrivalQty = numVal
        if (item.qualifiedQty > numVal) {
          item.qualifiedQty = numVal
        }
        item.defectiveQty = item.arrivalQty - item.qualifiedQty
      } else if (field === 'qualifiedQty') {
        item.qualifiedQty = Math.min(numVal, item.arrivalQty)
        item.defectiveQty = item.arrivalQty - item.qualifiedQty
      }
      newAlloc[index] = item
      return newAlloc
    })
  }

  const handleAutoAllocate = () => {
    if (!selected) return
    const qty = Number(arrivalForm.qty) || 0
    const qualified = Number(arrivalForm.qualifiedQty) || 0
    const defective = Number(arrivalForm.defectiveQty) || 0
    setProcessAllocations(autoAllocate(qty, qualified, defective, selected))
  }

  const handleSubmitArrival = () => {
    if (!selected) return
    const qty = Number(arrivalForm.qty) || 0
    const qualifiedQty = Number(arrivalForm.qualifiedQty) || 0
    const defectiveQty = Number(arrivalForm.defectiveQty) || 0

    if (qty <= 0) {
      alert('请输入到货数量')
      return
    }
    if (qty !== qualifiedQty + defectiveQty) {
      alert('合格数量 + 不合格数量 必须等于到货总数')
      return
    }
    const remaining = selected.totalQty - selected.arrivedQty
    if (qty > remaining) {
      alert(`到货数量不能超过剩余未到货数量（${remaining}）`)
      return
    }

    if (selected.orderType === '多工序合并委外' && selected.processList) {
      const totalAllocQty = processAllocations.reduce((sum, p) => sum + p.arrivalQty, 0)
      const totalAllocQual = processAllocations.reduce((sum, p) => sum + p.qualifiedQty, 0)
      const totalAllocDef = processAllocations.reduce((sum, p) => sum + p.defectiveQty, 0)

      if (totalAllocQty !== qty) {
        alert(`各工序到货分摊之和（${totalAllocQty}）不等于总到货数（${qty}）`)
        return
      }
      if (totalAllocQual !== qualifiedQty) {
        alert(`各工序合格分摊之和（${totalAllocQual}）不等于总合格数（${qualifiedQty}）`)
        return
      }
      if (totalAllocDef !== defectiveQty) {
        alert(`各工序不良分摊之和（${totalAllocDef}）不等于总不良数（${defectiveQty}）`)
        return
      }

      for (let i = 0; i < processAllocations.length; i++) {
        const alloc = processAllocations[i]
        const proc = selected.processList[i]
        const procRemaining = proc.outsourceQty - proc.arrivedQty
        if (alloc.arrivalQty > procRemaining) {
          alert(`工序「${alloc.processName}」到货数量（${alloc.arrivalQty}）超过剩余未到货数量（${procRemaining}）`)
          return
        }
      }

      const newProcessList = selected.processList.map((p, i) => ({
        ...p,
        arrivedQty: p.arrivedQty + processAllocations[i].arrivalQty,
        qualifiedQty: p.qualifiedQty + processAllocations[i].qualifiedQty,
        defectiveQty: p.defectiveQty + processAllocations[i].defectiveQty,
      }))

      const newRecord: ArrivalRecord = {
        id: 'A' + Date.now(),
        arrivalNo: `ARR-${selected.outNo.replace('OUT-', '')}-${String(selected.arrivalRecords.length + 1).padStart(2, '0')}`,
        arrivalDate: arrivalForm.arrivalDate,
        qty,
        qualifiedQty,
        defectiveQty,
        inspector: arrivalForm.inspector,
        remark: arrivalForm.remark,
        processAllocations: [...processAllocations],
      }

      const newArrived = selected.arrivedQty + qty
      const newQualified = selected.qualifiedQty + qualifiedQty
      const newDefective = selected.defectiveQty + defectiveQty
      let newStatus: OutsourceStatus = selected.status
      if (newArrived >= selected.totalQty) {
        newStatus = '全部到货'
      } else if (newArrived > 0) {
        newStatus = '部分到货'
      }

      setOrders(prev => prev.map(o => o.id === selected.id ? {
        ...o,
        arrivedQty: newArrived,
        qualifiedQty: newQualified,
        defectiveQty: newDefective,
        status: newStatus,
        arrivalRecords: [...o.arrivalRecords, newRecord],
        processList: newProcessList,
      } : o))

      setSelected(prev => prev && prev.id === selected.id ? {
        ...prev,
        arrivedQty: newArrived,
        qualifiedQty: newQualified,
        defectiveQty: newDefective,
        status: newStatus,
        arrivalRecords: [...prev.arrivalRecords, newRecord],
        processList: newProcessList,
      } : prev)
    } else {
      const newRecord: ArrivalRecord = {
        id: 'A' + Date.now(),
        arrivalNo: `ARR-${selected.outNo.replace('OUT-', '')}-${String(selected.arrivalRecords.length + 1).padStart(2, '0')}`,
        arrivalDate: arrivalForm.arrivalDate,
        qty,
        qualifiedQty,
        defectiveQty,
        inspector: arrivalForm.inspector,
        remark: arrivalForm.remark,
      }

      const newArrived = selected.arrivedQty + qty
      const newQualified = selected.qualifiedQty + qualifiedQty
      const newDefective = selected.defectiveQty + defectiveQty
      let newStatus: OutsourceStatus = selected.status
      if (newArrived >= selected.totalQty) {
        newStatus = '全部到货'
      } else if (newArrived > 0) {
        newStatus = '部分到货'
      }

      setOrders(prev => prev.map(o => o.id === selected.id ? {
        ...o,
        arrivedQty: newArrived,
        qualifiedQty: newQualified,
        defectiveQty: newDefective,
        status: newStatus,
        arrivalRecords: [...o.arrivalRecords, newRecord],
      } : o))

      setSelected(prev => prev && prev.id === selected.id ? {
        ...prev,
        arrivedQty: newArrived,
        qualifiedQty: newQualified,
        defectiveQty: newDefective,
        status: newStatus,
        arrivalRecords: [...prev.arrivalRecords, newRecord],
      } : prev)
    }

    setShowArrivalModal(false)
    alert(`到货登记成功！\n\n委外单号：${selected.outNo}\n本次到货：${qty}件（合格${qualifiedQty}件，不良${defectiveQty}件）\n\n系统已自动完成委外报工，解锁下游工序产能。`)
  }

  const getProcessDisplay = (order: OutsourceOrder) => {
    if (order.orderType === '多工序合并委外' && order.processList) {
      return `${order.processList.length}道工序合并`
    }
    return `${order.processCode} ${order.processName}`
  }

  return (
    <MainLayout>
      <div className="flex h-full overflow-hidden bg-[#f5f6f8]">
        <div className="flex flex-col flex-1 min-w-0 overflow-auto">
          <div className="mx-4 mt-4 bg-[#eef4fb] border border-[#d0dff0] rounded-lg px-4 py-2.5 flex items-start gap-2 text-xs text-gray-600">
            <Info size={14} className="text-[#1e5fa8] mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p><span className="font-medium text-blue-700">生产委外：</span>由生产工序中发起，关联工单和工序，到货后自动完成委外报工。</p>
              <p><span className="font-medium text-green-700">保养/维修委外：</span>钳工在保养或维修过程中发起委外，填写委外内容后生成委外单；外协件返回后进行到货登记。</p>
              <p><span className="font-medium text-pink-700">合并委外：</span>多道工序连续委外，到货时按工序分摊数量。</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 p-4 pb-0">
            {[
              { label: '委外单据总数', value: orders.length, color: 'text-gray-700' },
              { label: '已下达', value: orders.filter(o => o.status === '已下达').length, color: 'text-blue-600' },
              { label: '委外中', value: orders.filter(o => o.status === '委外中').length, color: 'text-amber-600' },
              { label: '部分到货', value: orders.filter(o => o.status === '部分到货').length, color: 'text-orange-600' },
              { label: '全部到货', value: orders.filter(o => o.status === '全部到货').length, color: 'text-emerald-600' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                <p className={cn('text-2xl font-bold', c.color)}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="px-4 pt-3">
            <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-1.5 overflow-x-auto">
              {tabs.map(tab => {
                const active = activeTab === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => { setActiveTab(tab.value); setSelected(null) }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                      active
                        ? cn(tab.color, 'bg-gray-100 ring-1 ring-inset ring-gray-300')
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full',
                      tab.value === '全部' ? 'bg-gray-400' :
                      tab.value === '生产' ? 'bg-blue-500' :
                      tab.value === '保养' ? 'bg-green-500' :
                      'bg-orange-500'
                    )} />
                    {tab.label}
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      active ? 'bg-white/80 text-gray-600' : 'bg-gray-100 text-gray-500'
                    )}>{tabCounts[tab.value]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 pt-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-9 text-sm">
              <Search size={14} className="text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="委外单号/工单号/模具名称"
                className="outline-none w-48 text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as OutsourceStatus | '')}
                className="h-9 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer"
              >
                <option value="">全部状态</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterSupplier}
                onChange={e => setFilterSupplier(e.target.value)}
                className="h-9 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer"
              >
                <option value="">全部供应商</option>
                {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => { setSearch(''); setFilterStatus(''); setFilterSupplier(''); setActiveTab('全部') }}
              className="flex items-center gap-1 h-9 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"
            >
              <RotateCcw size={13} /> 重置
            </button>
            <div className="flex-1" />
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">已选 {selectedIds.length} 条</span>
                <button
                  onClick={() => handlePrintOutbound()}
                  className="flex items-center gap-1 h-9 px-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Printer size={13} /> 打印出库单
                </button>
                <button
                  onClick={() => handlePrintInbound()}
                  className="flex items-center gap-1 h-9 px-3 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  <Printer size={13} /> 打印入库单
                </button>
              </div>
            )}
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 h-9 px-4 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]"
            >
              <Plus size={14} /> 新建委外单
            </button>
          </div>

          <div className="flex-1 overflow-auto m-4 bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs w-12">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={toggleSelectAll}
                      className="rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">委外单号</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">来源</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">单据类型</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工单号</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">模具名称</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工序</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">供应商</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">外发数量</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">已到货</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">合格</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">不良</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">预计交货</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">状态</th>
                  <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, idx) => (
                  <tr
                    key={o.id}
                    className={cn('border-b border-gray-100 hover:bg-gray-50 cursor-pointer', idx % 2 === 1 && 'bg-gray-50/50', selected?.id === o.id && 'bg-blue-50/40')}
                    onClick={() => setSelected(o)}
                  >
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(o.id)}
                        onChange={() => toggleSelect(o.id)}
                        className="rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#1e5fa8] font-medium">{o.outNo}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', SOURCE_STYLES[o.sourceType])}>{o.sourceType}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', ORDER_TYPE_STYLES[o.orderType])}>{o.orderType}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{o.woNo || '—'}</td>
                    <td className="px-4 py-3 text-gray-800">{o.moldName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{getProcessDisplay(o)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{o.supplier}</td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{o.totalQty}</td>
                    <td className="px-4 py-3 text-center text-blue-600 font-medium">{o.arrivedQty}</td>
                    <td className="px-4 py-3 text-center text-emerald-600 font-medium">{o.qualifiedQty}</td>
                    <td className="px-4 py-3 text-center text-red-500 font-medium">{o.defectiveQty}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{o.planReturnDate}</td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[o.status])}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {(o.status === '已下达' || o.status === '委外中' || o.status === '部分到货') && (
                          <button
                            onClick={() => openArrivalModal(o)}
                            className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            到货登记
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={15} className="px-4 py-16 text-center text-gray-400 text-sm">
                      暂无匹配的委外单据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="w-[420px] min-w-[420px] shrink-0 bg-white border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', SOURCE_STYLES[selected.sourceType])}>{selected.sourceType}</span>
                <p className="font-semibold text-gray-800 text-sm">{selected.outNo}</p>
              </div>
              <button onClick={() => setSelected(null)}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <FileText size={13} /> 委外单信息
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">来源</span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', SOURCE_STYLES[selected.sourceType])}>{selected.sourceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">单据类型</span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', ORDER_TYPE_STYLES[selected.orderType])}>{selected.orderType}</span>
                  </div>
                  {selected.woNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">工单号</span>
                      <span className="text-gray-700 font-mono">{selected.woNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">模具编号</span>
                    <span className="text-gray-700 font-mono">{selected.moldCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">模具名称</span>
                    <span className="text-gray-700">{selected.moldName}</span>
                  </div>
                  {selected.orderType === '单工序委外' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">工序</span>
                      <span className="text-gray-700">{selected.processName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">供应商</span>
                    <span className="text-gray-700">{selected.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">创建人</span>
                    <span className="text-gray-700">{selected.creator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">创建时间</span>
                    <span className="text-gray-700">{selected.createTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">预计下单</span>
                    <span className="text-gray-700">{selected.planSendDate || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">预计交货</span>
                    <span className="text-gray-700">{selected.planReturnDate || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">状态</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[selected.status])}>{selected.status}</span>
                  </div>
                  {selected.maintainId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">来源单据</span>
                      <span className="text-gray-700 font-mono">{selected.maintainId}</span>
                    </div>
                  )}
                  {selected.repairId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">来源单据</span>
                      <span className="text-gray-700 font-mono">{selected.repairId}</span>
                    </div>
                  )}
                </div>
              </div>

              {selected.orderType === '多工序合并委外' && selected.processList && (
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                    <Package size={13} /> 工序明细
                  </p>
                  <div className="space-y-3">
                    {selected.processList.map((p, idx) => (
                      <div key={p.processCode} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#1e5fa8] text-white text-[10px] flex items-center justify-center font-medium">{idx + 1}</span>
                            <span className="text-xs font-medium text-gray-700">{p.processCode} {p.processName}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">外发 {p.outsourceQty}件</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div>
                            <p className="text-gray-400">已到货</p>
                            <p className="font-medium text-blue-600">{p.arrivedQty}件</p>
                          </div>
                          <div>
                            <p className="text-gray-400">合格</p>
                            <p className="font-medium text-emerald-600">{p.qualifiedQty}件</p>
                          </div>
                          <div>
                            <p className="text-gray-400">不良</p>
                            <p className="font-medium text-red-500">{p.defectiveQty}件</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>进度</span>
                            <span>{p.arrivedQty}/{p.outsourceQty}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${p.outsourceQty > 0 ? (p.arrivedQty / p.outsourceQty) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        {p.processRemark && (
                          <p className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            备注：{p.processRemark}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-3">数量统计</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">外发总数</p>
                    <p className="text-xl font-bold text-gray-700">{selected.totalQty}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">已到货</p>
                    <p className="text-xl font-bold text-blue-600">{selected.arrivedQty}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">合格</p>
                    <p className="text-xl font-bold text-emerald-600">{selected.qualifiedQty}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">不良</p>
                    <p className="text-xl font-bold text-red-500">{selected.defectiveQty}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>到货进度</span>
                    <span>{selected.arrivedQty}/{selected.totalQty}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${(selected.arrivedQty / selected.totalQty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {selected.processReq && (
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">加工要求</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{selected.processReq}</p>
                </div>
              )}

              {selected.remark && (
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2">备注</p>
                  <p className="text-xs text-gray-500">{selected.remark}</p>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <CheckCircle size={13} /> 到货记录 ({selected.arrivalRecords.length})
                  </p>
                  {(selected.status === '已下达' || selected.status === '委外中' || selected.status === '部分到货') && (
                    <button
                      onClick={() => openArrivalModal(selected)}
                      className="text-xs text-emerald-600 hover:text-emerald-700"
                    >
                      + 新增到货
                    </button>
                  )}
                </div>
                {selected.arrivalRecords.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    暂无到货记录
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selected.arrivalRecords.map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">{r.arrivalNo}</span>
                          <span className="text-xs text-gray-500">{r.arrivalDate}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div>
                            <p className="text-gray-400">到货</p>
                            <p className="font-medium text-gray-700">{r.qty}件</p>
                          </div>
                          <div>
                            <p className="text-gray-400">合格</p>
                            <p className="font-medium text-emerald-600">{r.qualifiedQty}件</p>
                          </div>
                          <div>
                            <p className="text-gray-400">不良</p>
                            <p className="font-medium text-red-500">{r.defectiveQty}件</p>
                          </div>
                        </div>
                        {r.processAllocations && r.processAllocations.length > 0 && (
                          <div className="mb-2 pt-2 border-t border-gray-100">
                            <p className="text-[10px] text-gray-500 mb-1">工序分摊：</p>
                            <div className="space-y-0.5">
                              {r.processAllocations.map(pa => (
                                <div key={pa.processCode} className="flex justify-between text-[10px] text-gray-600">
                                  <span>{pa.processName}</span>
                                  <span>到{pa.arrivalQty} / 合{pa.qualifiedQty} / 不{pa.defectiveQty}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>验收人：{r.inspector}</span>
                        </div>
                        {r.remark && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">{r.remark}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div ref={printRef} style={{ display: 'none' }}>
              {selected && (
                <div>
                  <div className="print-header">
                    <h1>委外加工单</h1>
                    <div className="subtitle">单号：{selected.outNo} &nbsp;&nbsp; 来源：{selected.sourceType} &nbsp;&nbsp; 类型：{selected.orderType}</div>
                  </div>

                  <div className="info-section">
                    <div className="info-title">基本信息</div>
                    <div className="info-grid">
                      <div className="info-item"><span className="info-label">工单号：</span><span className="info-value">{selected.woNo || '—'}</span></div>
                      <div className="info-item"><span className="info-label">模具编号：</span><span className="info-value">{selected.moldCode}</span></div>
                      <div className="info-item"><span className="info-label">模具名称：</span><span className="info-value">{selected.moldName}</span></div>
                      <div className="info-item"><span className="info-label">单据类型：</span><span className="info-value">{selected.orderType}</span></div>
                      <div className="info-item"><span className="info-label">委外工序：</span><span className="info-value">{selected.processName}</span></div>
                      <div className="info-item"><span className="info-label">供应商：</span><span className="info-value">{selected.supplier}</span></div>
                      <div className="info-item"><span className="info-label">创建人：</span><span className="info-value">{selected.creator}</span></div>
                      <div className="info-item"><span className="info-label">创建时间：</span><span className="info-value">{selected.createTime}</span></div>
                      <div className="info-item"><span className="info-label">单据状态：</span><span className="info-value">{selected.status}</span></div>
                    </div>
                  </div>

                  {selected.orderType === '多工序合并委外' && selected.processList && (
                    <div className="info-section">
                      <div className="info-title">工序明细</div>
                      <table className="qty-table">
                        <thead>
                          <tr>
                            <th>序号</th>
                            <th>工序号</th>
                            <th>工序名称</th>
                            <th>外发数量</th>
                            <th>已到货</th>
                            <th>合格</th>
                            <th>不良</th>
                            <th>备注</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.processList.map((p, idx) => (
                            <tr key={p.processCode}>
                              <td>{idx + 1}</td>
                              <td>{p.processCode}</td>
                              <td>{p.processName}</td>
                              <td>{p.outsourceQty}</td>
                              <td>{p.arrivedQty}</td>
                              <td>{p.qualifiedQty}</td>
                              <td>{p.defectiveQty}</td>
                              <td>{p.processRemark || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="info-section">
                    <div className="info-title">数量信息</div>
                    <table className="qty-table">
                      <thead>
                        <tr>
                          <th>外发总数</th>
                          <th>已到货</th>
                          <th>合格</th>
                          <th>不良</th>
                          <th>剩余未到</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{selected.totalQty}</td>
                          <td>{selected.arrivedQty}</td>
                          <td>{selected.qualifiedQty}</td>
                          <td>{selected.defectiveQty}</td>
                          <td>{selected.totalQty - selected.arrivedQty}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="info-section">
                    <div className="info-title">交期信息</div>
                    <div className="info-grid">
                      <div className="info-item"><span className="info-label">预计送外：</span><span className="info-value">{selected.planSendDate || '—'}</span></div>
                      <div className="info-item"><span className="info-label">预计返回：</span><span className="info-value">{selected.planReturnDate || '—'}</span></div>
                    </div>
                  </div>

                  <div className="info-section">
                    <div className="info-title">加工要求</div>
                    <div className="remark-box">{selected.processReq || '无'}</div>
                  </div>

                  <div className="info-section">
                    <div className="info-title">备注</div>
                    <div className="remark-box">{selected.remark || '无'}</div>
                  </div>

                  {selected.arrivalRecords.length > 0 && (
                    <div className="info-section">
                      <div className="info-title">到货记录</div>
                      <table className="qty-table">
                        <thead>
                          <tr>
                            <th>到货单号</th>
                            <th>到货日期</th>
                            <th>到货数量</th>
                            <th>合格</th>
                            <th>不良</th>
                            <th>验收人</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.arrivalRecords.map(r => (
                            <tr key={r.id}>
                              <td>{r.arrivalNo}</td>
                              <td>{r.arrivalDate}</td>
                              <td>{r.qty}</td>
                              <td>{r.qualifiedQty}</td>
                              <td>{r.defectiveQty}</td>
                              <td>{r.inspector}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="qr-section">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="二维码" />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        二维码
                      </div>
                    )}
                    <p>扫码查看委外单详情</p>
                  </div>

                  <div className="footer">
                    <div className="footer-item">
                      <div className="footer-label">制单人：</div>
                      <div>___________</div>
                    </div>
                    <div className="footer-item">
                      <div className="footer-label">供应商签收：</div>
                      <div>___________</div>
                    </div>
                    <div className="footer-item">
                      <div className="footer-label">质检：</div>
                      <div>___________</div>
                    </div>
                    <div className="footer-item">
                      <div className="footer-label">仓库：</div>
                      <div>___________</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => openQrModal(selected!)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50"
                >
                  <QrCode size={13} /> 二维码
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50"
                >
                  <Printer size={13} /> 打印
                </button>
              </div>
              {(selected.status === '已下达' || selected.status === '委外中' || selected.status === '部分到货') && (
                <button
                  onClick={() => openArrivalModal(selected)}
                  className="w-full flex items-center justify-center gap-1.5 h-9 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  <CheckCircle size={14} /> 到货登记
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Plus size={16} className="text-[#1e5fa8]" />
                新建委外单
              </h3>
              <button onClick={() => setShowNewModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 text-xs text-blue-700">
                委外件送出后在供应商处完成加工，返回时在本页面执行「到货登记」，系统自动完成委外报工。
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5">委外来源 <span className="text-red-500">*</span></label>
                <select
                  value={newForm.sourceType}
                  onChange={e => setNewForm(f => ({ ...f, sourceType: e.target.value as SourceType }))}
                  className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                >
                  <option value="生产">生产委外</option>
                  <option value="保养">保养委外</option>
                  <option value="维修">维修委外</option>
                </select>
              </div>

              {newForm.sourceType === '生产' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">关联工单 <span className="text-red-500">*</span></label>
                    <select
                      value={newForm.woNo}
                      onChange={e => handleWoChange(e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                    >
                      <option value="">请选择工单</option>
                      {WORK_ORDERS.map(w => (
                        <option key={w.woNo} value={w.woNo}>{w.woNo} - {w.moldName}</option>
                      ))}
                    </select>
                  </div>
                  {newForm.moldCode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">模具编号</label>
                        <input value={newForm.moldCode} disabled className="w-full border border-gray-200 rounded px-3 h-9 text-sm bg-gray-50 text-gray-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">模具名称</label>
                        <input value={newForm.moldName} disabled className="w-full border border-gray-200 rounded px-3 h-9 text-sm bg-gray-50 text-gray-500" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {newForm.sourceType !== '生产' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">模具编号</label>
                    <input
                      value={newForm.moldCode}
                      onChange={e => setNewForm(f => ({ ...f, moldCode: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                      placeholder="品号"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">模具名称</label>
                    <input
                      value={newForm.moldName}
                      onChange={e => setNewForm(f => ({ ...f, moldName: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                      placeholder="品名"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">供应商 <span className="text-red-500">*</span></label>
                  <select
                    value={newForm.supplier}
                    onChange={e => setNewForm(f => ({ ...f, supplier: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                  >
                    <option value="">请选择供应商</option>
                    {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">委外工序 <span className="text-red-500">*</span></label>
                  <input
                    value={newForm.processName}
                    onChange={e => setNewForm(f => ({ ...f, processName: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                    placeholder="如：热处理、镀铬、精密修复"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">数量</label>
                  <input
                    type="number"
                    value={newForm.qty}
                    onChange={e => setNewForm(f => ({ ...f, qty: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">预计送外</label>
                  <input
                    type="date"
                    value={newForm.planSendDate}
                    onChange={e => setNewForm(f => ({ ...f, planSendDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5">预计返回</label>
                  <input
                    type="date"
                    value={newForm.planReturnDate}
                    onChange={e => setNewForm(f => ({ ...f, planReturnDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5">加工要求</label>
                <textarea
                  value={newForm.processReq}
                  onChange={e => setNewForm(f => ({ ...f, processReq: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1e5fa8] resize-none"
                  placeholder="请详细描述加工要求、精度要求等..."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1.5">备注</label>
                <input
                  value={newForm.remark}
                  onChange={e => setNewForm(f => ({ ...f, remark: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                  placeholder="其他说明"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowNewModal(false)} className="px-5 h-9 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleCreate} className="px-5 h-9 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]">创建委外单</button>
            </div>
          </div>
        </div>
      )}

      {showArrivalModal && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className={cn("bg-white rounded-xl shadow-xl", selected.orderType === '多工序合并委外' ? 'w-[720px]' : 'w-[480px]')}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">
                {selected.orderType === '多工序合并委外' ? '合并委外到货登记' : '委外到货登记'}
              </h3>
              <button onClick={() => setShowArrivalModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-xs text-cyan-700">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={13} />
                  <span className="font-medium">委外单信息</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>委外单号：<span className="font-mono">{selected.outNo}</span></div>
                  <div>工单号：<span className="font-mono">{selected.woNo || '—'}</span></div>
                  <div>单据类型：{selected.orderType}</div>
                  <div>供应商：{selected.supplier}</div>
                  <div>外发总数：{selected.totalQty}件</div>
                  <div>剩余未到：{selected.totalQty - selected.arrivedQty}件</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">到货日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={arrivalForm.arrivalDate}
                    onChange={e => setArrivalForm({ ...arrivalForm, arrivalDate: e.target.value })}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">验收人 <span className="text-red-500">*</span></label>
                  <input
                    value={arrivalForm.inspector}
                    onChange={e => setArrivalForm({ ...arrivalForm, inspector: e.target.value })}
                    placeholder="请输入验收人"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">本次到货总数 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={arrivalForm.qty}
                    onChange={e => {
                      const qty = e.target.value
                      const qtyNum = Number(qty) || 0
                      const defNum = Number(arrivalForm.defectiveQty) || 0
                      const qualNum = Math.max(qtyNum - defNum, 0)
                      setArrivalForm({ ...arrivalForm, qty, qualifiedQty: String(qualNum) })
                      if (selected.orderType === '多工序合并委外' && selected.processList) {
                        setProcessAllocations(autoAllocate(qtyNum, qualNum, defNum, selected))
                      }
                    }}
                    placeholder="数量"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">合格数量 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={arrivalForm.qualifiedQty}
                    onChange={e => {
                      const qual = e.target.value
                      const qualNum = Number(qual) || 0
                      const qtyNum = Number(arrivalForm.qty) || 0
                      const defNum = Math.max(qtyNum - qualNum, 0)
                      setArrivalForm({ ...arrivalForm, qualifiedQty: qual, defectiveQty: String(defNum) })
                      if (selected.orderType === '多工序合并委外' && selected.processList) {
                        setProcessAllocations(autoAllocate(qtyNum, qualNum, defNum, selected))
                      }
                    }}
                    placeholder="合格"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">不良数量</label>
                  <input
                    type="number"
                    value={arrivalForm.defectiveQty}
                    onChange={e => {
                      const def = e.target.value
                      const defNum = Number(def) || 0
                      const qtyNum = Number(arrivalForm.qty) || 0
                      const qualNum = Math.max(qtyNum - defNum, 0)
                      setArrivalForm({ ...arrivalForm, defectiveQty: def, qualifiedQty: String(qualNum) })
                      if (selected.orderType === '多工序合并委外' && selected.processList) {
                        setProcessAllocations(autoAllocate(qtyNum, qualNum, defNum, selected))
                      }
                    }}
                    placeholder="不良"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                  />
                </div>
              </div>

              {selected.orderType === '多工序合并委外' && selected.processList && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <Package size={13} /> 工序分摊明细
                  </span>
                  <button
                    onClick={handleAutoAllocate}
                    className="flex items-center gap-1 text-xs text-[#1e5fa8] hover:text-[#1a4f8f]"
                  >
                    <RefreshCw size={11} /> 自动分摊
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">工序号</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">工序名称</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">委外发出</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">已到货</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">剩余未到</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">本次到货分摊</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">本次合格分摊</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">本次不良分摊</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.processList.map((p, idx) => (
                        <tr key={p.processCode} className="border-b border-gray-100">
                          <td className="px-3 py-2 font-mono text-gray-600">{p.processCode}</td>
                          <td className="px-3 py-2 text-gray-700">{p.processName}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{p.outsourceQty}</td>
                          <td className="px-3 py-2 text-center text-blue-600">{p.arrivedQty}</td>
                          <td className="px-3 py-2 text-center text-gray-500">{p.outsourceQty - p.arrivedQty}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              value={processAllocations[idx]?.arrivalQty || 0}
                              onChange={e => handleAllocationChange(idx, 'arrivalQty', e.target.value)}
                              className="w-16 h-7 px-2 text-center text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8]"
                              min="0"
                              max={p.outsourceQty - p.arrivedQty}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              value={processAllocations[idx]?.qualifiedQty || 0}
                              onChange={e => handleAllocationChange(idx, 'qualifiedQty', e.target.value)}
                              className="w-16 h-7 px-2 text-center text-sm border border-gray-200 rounded outline-none focus:border-emerald-500"
                              min="0"
                            />
                          </td>
                          <td className="px-3 py-2 text-center text-red-500">
                            {processAllocations[idx]?.defectiveQty || 0}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-3 py-2 text-gray-600" colSpan={5}>合计</td>
                        <td className="px-3 py-2 text-center text-blue-600">
                          {processAllocations.reduce((sum, p) => sum + p.arrivalQty, 0)}
                        </td>
                        <td className="px-3 py-2 text-center text-emerald-600">
                          {processAllocations.reduce((sum, p) => sum + p.qualifiedQty, 0)}
                        </td>
                        <td className="px-3 py-2 text-center text-red-500">
                          {processAllocations.reduce((sum, p) => sum + p.defectiveQty, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-[10px] text-amber-700">
                  <AlertTriangle size={12} className="inline mr-1 align-middle" />
                  提示：默认按各工序剩余未到货占比自动分摊，可手动调整。各工序分摊之和需等于总数量。
                </div>
              </div>
              )}

              <div>
                <label className="text-xs text-gray-600 block mb-1.5">现场验收备注</label>
                <textarea
                  value={arrivalForm.remark}
                  onChange={e => setArrivalForm({ ...arrivalForm, remark: e.target.value })}
                  placeholder="请填写验收情况、异常说明等"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-[#1e5fa8] resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-0.5">温馨提示</p>
                  <p>到货登记审核保存后，系统将自动完成委外部分报工，并同步解锁下游对应数量的产能。</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowArrivalModal(false)}
                className="px-4 h-9 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmitArrival}
                className="px-4 h-9 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}

      {showQrModal && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[360px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <QrCode size={18} className="text-[#1e5fa8]" />
                委外单二维码
              </h3>
              <button onClick={() => setShowQrModal(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="二维码" className="w-[220px] h-[220px]" />
                ) : (
                  <div className="w-[220px] h-[220px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    生成中...
                  </div>
                )}
              </div>
              <div className="w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">委外单号</span>
                  <span className="text-gray-800 font-mono font-medium">{selected.outNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">模具名称</span>
                  <span className="text-gray-800">{selected.moldName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">工序</span>
                  <span className="text-gray-800">{selected.processName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">供应商</span>
                  <span className="text-gray-800">{selected.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">外发数量</span>
                  <span className="text-gray-800 font-medium">{selected.totalQty}件</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-center gap-2">
              <button
                onClick={() => {
                  if (!qrDataUrl) return
                  const link = document.createElement('a')
                  link.download = `${selected.outNo}-二维码.png`
                  link.href = qrDataUrl
                  link.click()
                }}
                className="px-4 h-8 text-sm border border-gray-200 rounded text-gray-600 bg-white hover:bg-gray-50"
              >
                下载二维码
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 h-8 text-sm bg-[#1e5fa8] text-white rounded hover:bg-[#1a4f8f]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
