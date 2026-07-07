'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, RotateCcw, ChevronDown, User, CheckCircle,
  AlertTriangle, RefreshCw, XCircle,
  Info, Package, Clock, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MainLayout } from '@/components/layout/main-layout'

type TaskStatus = '待开始' | '进行中' | '已完成' | '检验中' | '委外中'

interface TaskTicket {
  id: string
  taskNo: string
  woNo: string
  moldCode: string
  moldName: string
  itemNo: string
  processCode: string
  processName: string
  planHours: number
  assignee: string
  woIssuer: string
  genTime: string
  status: TaskStatus
  remark?: string
  isReWork?: boolean
  reWorkFrom?: string
  isInspect?: boolean
  isOutsource?: boolean
  outsourceVendor?: string
  outsourceWoNo?: string
  outsourceProgress?: number
  seq: number  // 工序顺序号，用于排序
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  '待开始': 'bg-gray-100 text-gray-500',
  '进行中': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-emerald-100 text-emerald-700',
  '检验中': 'bg-purple-100 text-purple-700',
  '委外中': 'bg-amber-100 text-amber-700',
}

const VENDORS = ['精工热处理厂', '博锐精密加工', '华鑫表面处理', '德信模具维修']

// 按工单定义完整的工艺路径（模拟ERP工艺路线）
const WORK_ORDER_ROUTES: Record<string, {
  woNo: string
  moldCode: string
  moldName: string
  itemNo: string
  woIssuer: string
  processes: { code: string; name: string; hours: number; isOutsource?: boolean; isInspect?: boolean }[]
}> = {
  'WO-2024-001': {
    woNo: 'WO-2024-001',
    moldCode: '190038',
    moldName: '7686SO三工位成形凹模',
    itemNo: '60004712402104',
    woIssuer: '钳工A',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '粗铣', hours: 8 },
      { code: '0020', name: '钳工', hours: 4 },
      { code: '0030', name: '热处理', hours: 24, isOutsource: true },
      { code: '0040', name: '精车', hours: 4 },
      { code: '0050', name: '线切割', hours: 3 },
      { code: '0060', name: '平面磨', hours: 3 },
      { code: '0070', name: '精铣', hours: 6 },
      { code: '0080', name: '抛光', hours: 2 },
      { code: '9999', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-002': {
    woNo: 'WO-2024-002',
    moldCode: '26015',
    moldName: 'Y587成形凹模',
    itemNo: '60022212402005',
    woIssuer: '钳工B',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '粗铣', hours: 8 },
      { code: '0020', name: '钳工', hours: 4 },
      { code: '0030', name: '热处理', hours: 24, isOutsource: true },
      { code: '0040', name: '线切割', hours: 3 },
      { code: '9999', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-003': {
    woNo: 'WO-2024-003',
    moldCode: '190041',
    moldName: '7686SO成形凹模',
    itemNo: '60004712402030',
    woIssuer: '钳工C',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '粗铣', hours: 8 },
      { code: '0020', name: '钳工', hours: 4 },
      { code: '0030', name: '精车', hours: 4 },
      { code: '9999', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-004': {
    woNo: 'WO-2024-004',
    moldCode: '45021',
    moldName: '1850L下模仁',
    itemNo: '60005212402108',
    woIssuer: '钳工A',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '粗铣', hours: 6 },
      { code: '0020', name: '热处理', hours: 24, isOutsource: true },
      { code: '0030', name: '精铣', hours: 4 },
      { code: '0040', name: '线切割', hours: 3 },
      { code: '0050', name: '平面磨', hours: 2 },
      { code: '0060', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-005': {
    woNo: 'WO-2024-005',
    moldCode: '33089',
    moldName: 'X200成型凸模',
    itemNo: '60003312402115',
    woIssuer: '钳工A',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '车削', hours: 5 },
      { code: '0020', name: '铣外形', hours: 4 },
      { code: '0030', name: '热处理', hours: 24, isOutsource: true },
      { code: '0040', name: '精车', hours: 3 },
      { code: '0050', name: '磨平面', hours: 2 },
      { code: '0060', name: '钳工', hours: 3 },
      { code: '0070', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-006': {
    woNo: 'WO-2024-006',
    moldCode: '51002',
    moldName: '7686斜楔机构',
    itemNo: '60005112402088',
    woIssuer: '钳工B',
    processes: [
      { code: '0000', name: '领料', hours: 0.5 },
      { code: '0010', name: '粗铣', hours: 8 },
      { code: '0020', name: '铣斜面', hours: 5 },
      { code: '0030', name: '热处理', hours: 24, isOutsource: true },
      { code: '0040', name: '精铣', hours: 6 },
      { code: '0050', name: '线切割', hours: 4 },
      { code: '0060', name: '抛光', hours: 2 },
      { code: '0070', name: '钳工', hours: 3 },
      { code: '0080', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
  'WO-2024-007': {
    woNo: 'WO-2024-007',
    moldCode: '28015',
    moldName: 'Y580下模板',
    itemNo: '60002812402102',
    woIssuer: '钳工C',
    processes: [
      { code: '0000', name: '领料', hours: 1 },
      { code: '0010', name: '粗铣', hours: 10 },
      { code: '0020', name: '铣槽', hours: 4 },
      { code: '0030', name: '钻孔', hours: 3 },
      { code: '0040', name: '热处理', hours: 24, isOutsource: true },
      { code: '0050', name: '精铣', hours: 6 },
      { code: '0060', name: '磨平面', hours: 3 },
      { code: '0070', name: '钳工', hours: 4 },
      { code: '0080', name: '最终检验', hours: 1, isInspect: true },
    ]
  },
}

// 每个工单的当前进度（已完成到第几道工序）
const WO_PROGRESS: Record<string, {
  completedUpTo: number  // 已完成到第几道（索引）
  currentActive: number // 当前进行中的工序索引（-1表示没有进行中）
  outsourceCreated: boolean  // 委外任务是否已创建
  extraTasks: TaskTicket[]  // 额外任务（返工、检验等）
}> = {
  'WO-2024-001': {
    completedUpTo: 0,   // 领料刚完成
    currentActive: 1,   // 粗铣进行中
    outsourceCreated: false,
    extraTasks: [],
  },
  'WO-2024-002': {
    completedUpTo: -1,  // 还没开始
    currentActive: 0,   // 领料进行中
    outsourceCreated: false,
    extraTasks: [],
  },
  'WO-2024-003': {
    completedUpTo: 1,   // 粗铣已完成
    currentActive: 2,   // 钳工进行中
    outsourceCreated: false,
    extraTasks: [
      {
        id: 'T003-R1', taskNo: 'TK-2024-003-R1', woNo: 'WO-2024-003',
        moldCode: '190041', moldName: '7686SO成形凹模', itemNo: '60004712402030',
        processCode: '0010', processName: '粗铣（返工1）', planHours: 2,
        assignee: '钳工C', woIssuer: '钳工C', genTime: '2024-06-22 09:00',
        status: '已完成', isReWork: true, reWorkFrom: 'TK-2024-003-0010',
        remark: '首件尺寸超差，返工', seq: 101
      },
      {
        id: 'T003-IP1', taskNo: 'TK-2024-003-IP1', woNo: 'WO-2024-003',
        moldCode: '190041', moldName: '7686SO成形凹模', itemNo: '60004712402030',
        processCode: '0010', processName: '粗铣（检验1）', planHours: 1,
        assignee: '质检组', woIssuer: '钳工C', genTime: '2024-06-22 14:00',
        status: '检验中', isInspect: true, remark: '首件检验', seq: 102
      },
    ],
  },
  // 钳工A的工单
  'WO-2024-004': {
    completedUpTo: -1,  // 刚下达，还没开始
    currentActive: 0,    // 领料即将开始
    outsourceCreated: false,
    extraTasks: [],
  },
  'WO-2024-005': {
    completedUpTo: 0,   // 领料刚完成
    currentActive: 1,   // 车削进行中
    outsourceCreated: false,
    extraTasks: [],
  },
  // 钳工B的工单
  'WO-2024-006': {
    completedUpTo: -1,  // 刚下达，还没开始
    currentActive: 0,   // 领料进行中
    outsourceCreated: false,
    extraTasks: [],
  },
  // 钳工C的工单
  'WO-2024-007': {
    completedUpTo: 2,   // 钳工刚完成
    currentActive: 3,   // 精车进行中
    outsourceCreated: false,
    extraTasks: [],
  },
}

const WORKERS = ['钳工A', '钳工B', '钳工C', '王师傅', '李师傅', '张师傅', '刘师傅']
const INSPECTORS = ['质检组', '李工', '王工']

type ExtraTaskKind = 'rework' | 'inspect' | null

export default function TaskGenerationPage() {
  const [currentUser] = useState<string>('钳工A')
  const isAdmin = currentUser === 'ADMIN'

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterWo, setFilterWo] = useState('')

  const [progressMap, setProgressMap] = useState(WO_PROGRESS)
  const [extraTasksMap, setExtraTasksMap] = useState<Record<string, TaskTicket[]>>(() => {
    const map: Record<string, TaskTicket[]> = {}
    Object.entries(WO_PROGRESS).forEach(([woNo, prog]) => {
      map[woNo] = prog.extraTasks || []
    })
    return map
  })

  const [createOutsourceModal, setCreateOutsourceModal] = useState<{ woNo: string; processIdx: number } | null>(null)
  const [outsourceVendor, setOutsourceVendor] = useState('')

  const [extraModal, setExtraModal] = useState<{ kind: ExtraTaskKind; task: TaskTicket | null }>({ kind: null, task: null })
  const [extraHours, setExtraHours] = useState('1')
  const [extraRemark, setExtraRemark] = useState('')
  const [extraWorker, setExtraWorker] = useState('')

  const woOptions = Object.keys(WORK_ORDER_ROUTES).sort()

  // 根据进度生成可见任务列表（任务逐级产生：只显示已完成的 + 当前进行中的，未到的工序完全不显示）
  const visibleTasks = useMemo(() => {
    const result: TaskTicket[] = []

    Object.entries(WORK_ORDER_ROUTES).forEach(([woNo, route]) => {
      // 非ADMIN只能看到自己的工单
      if (!isAdmin && route.woIssuer !== currentUser) return

      const progress = progressMap[woNo]
      const extras = extraTasksMap[woNo] || []

      let seqCounter = 0

      // 添加已完成的工序任务
      for (let i = 0; i <= progress.completedUpTo; i++) {
        const proc = route.processes[i]
        // 委外工序已创建委外任务才显示
        if (proc.isOutsource && i < progress.completedUpTo) {
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            itemNo: route.itemNo,
            processCode: proc.code,
            processName: proc.name,
            planHours: proc.hours,
            assignee: route.woIssuer,
            woIssuer: route.woIssuer,
            genTime: '-',
            status: '已完成',
            isOutsource: proc.isOutsource,
            isInspect: proc.isInspect,
            seq: seqCounter++,
          })
        } else if (!proc.isOutsource) {
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            itemNo: route.itemNo,
            processCode: proc.code,
            processName: proc.name,
            planHours: proc.hours,
            assignee: route.woIssuer,
            woIssuer: route.woIssuer,
            genTime: '-',
            status: '已完成',
            isOutsource: proc.isOutsource,
            isInspect: proc.isInspect,
            seq: seqCounter++,
          })
        }
      }

      // 添加进行中的工序任务
      if (progress.currentActive >= 0) {
        const proc = route.processes[progress.currentActive]
        // 委外进行中需要已创建委外任务
        if (proc.isOutsource && progress.outsourceCreated) {
          result.push({
            id: `${woNo}-${proc.code}-OS`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}-OS`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            itemNo: route.itemNo,
            processCode: proc.code + '-O',
            processName: `${proc.name}（委外）`,
            planHours: proc.hours,
            assignee: VENDORS[0],
            woIssuer: route.woIssuer,
            genTime: '-',
            status: '委外中',
            isOutsource: true,
            isInspect: proc.isInspect,
            outsourceVendor: VENDORS[0],
            outsourceWoNo: `OS-${woNo}-${proc.code}`,
            outsourceProgress: 45,
            seq: seqCounter++,
          })
        } else if (!proc.isOutsource) {
          // 普通工序，显示为进行中
          result.push({
            id: `${woNo}-${proc.code}`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            itemNo: route.itemNo,
            processCode: proc.code,
            processName: proc.name,
            planHours: proc.hours,
            assignee: route.woIssuer,
            woIssuer: route.woIssuer,
            genTime: '-',
            status: '进行中',
            isOutsource: proc.isOutsource,
            isInspect: proc.isInspect,
            seq: seqCounter++,
          })
        } else if (proc.isOutsource && !progress.outsourceCreated) {
          // 委外工序但还没创建委外任务——显示出来提示钳工创建委外任务
          result.push({
            id: `${woNo}-${proc.code}-pending`,
            taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}`,
            woNo,
            moldCode: route.moldCode,
            moldName: route.moldName,
            itemNo: route.itemNo,
            processCode: proc.code,
            processName: proc.name,
            planHours: proc.hours,
            assignee: '',
            woIssuer: route.woIssuer,
            genTime: '-',
            status: '待开始',
            isOutsource: proc.isOutsource,
            isInspect: proc.isInspect,
            seq: seqCounter++,
          })
        }
      }

      // 添加额外任务（返工、检验等）
      extras.forEach(extra => {
        result.push({ ...extra, seq: seqCounter++ })
      })
    })

    return result.sort((a, b) => {
      if (a.woNo !== b.woNo) return a.woNo.localeCompare(b.woNo)
      return a.seq - b.seq
    })
  }, [progressMap, extraTasksMap, isAdmin, currentUser])

  // 过滤
  const filtered = visibleTasks.filter(t => {
    if (search && !t.taskNo.toLowerCase().includes(search.toLowerCase())
        && !t.moldName.toLowerCase().includes(search.toLowerCase())
        && !t.woNo.toLowerCase().includes(search.toLowerCase())
        && !t.itemNo.toLowerCase().includes(search.toLowerCase())
        && !t.processName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus && t.status !== filterStatus) return false
    if (filterWo && t.woNo !== filterWo) return false
    return true
  })

  // 统计
  const stats = {
    total: filtered.length,
    pending: filtered.filter(t => t.status === '待开始').length,
    active: filtered.filter(t => t.status === '进行中' || t.status === '委外中').length,
    inspect: filtered.filter(t => t.status === '检验中').length,
    done: filtered.filter(t => t.status === '已完成').length,
    rework: filtered.filter(t => t.isReWork).length,
    outsource: filtered.filter(t => t.isOutsource).length,
  }

  // 创建委外任务
  const handleCreateOutsource = () => {
    if (!createOutsourceModal) return
    const { woNo, processIdx } = createOutsourceModal

    setProgressMap(prev => ({
      ...prev,
      [woNo]: {
        ...prev[woNo],
        outsourceCreated: true,
        currentActive: processIdx,
      }
    }))

    // 添加委外任务
    const route = WORK_ORDER_ROUTES[woNo]
    const proc = route.processes[processIdx]
    const newTask: TaskTicket = {
      id: `${woNo}-${proc.code}-OS-new`,
      taskNo: `TK-${woNo.replace('WO-', '')}-${proc.code}-OS`,
      woNo,
      moldCode: route.moldCode,
      moldName: route.moldName,
      itemNo: route.itemNo,
      processCode: proc.code + '-O',
      processName: `${proc.name}（委外）`,
      planHours: proc.hours,
      assignee: outsourceVendor,
      woIssuer: route.woIssuer,
      genTime: new Date().toLocaleString('zh-CN'),
      status: '委外中',
      isOutsource: true,
      isInspect: false,
      outsourceVendor: outsourceVendor,
      outsourceWoNo: `OS-${Date.now()}`,
      outsourceProgress: 0,
      seq: 999,
    }

    setExtraTasksMap(prev => ({
      ...prev,
      [woNo]: [...(prev[woNo] || []), newTask]
    }))

    setCreateOutsourceModal(null)
    setOutsourceVendor('')
  }

  // 完成任务
  const handleComplete = (task: TaskTicket) => {
    const route = WORK_ORDER_ROUTES[task.woNo]
    const progress = progressMap[task.woNo]

    if (!route || !progress) return

    // 找到当前进行中的工序索引
    const currentIdx = progress.currentActive
    if (currentIdx < 0) return

    setProgressMap(prev => ({
      ...prev,
      [task.woNo]: {
        ...prev[task.woNo],
        completedUpTo: currentIdx,
        currentActive: currentIdx + 1 < route.processes.length ? currentIdx + 1 : -1,
      }
    }))
  }

  // 新增返工/检验任务
  const handleCreateExtra = () => {
    if (!extraModal.kind || !extraModal.task) return
    const base = extraModal.task
    const woNo = base.woNo

    let newStatus: TaskStatus = '进行中'
    let processNameExtra = ''
    let flags: Partial<TaskTicket> = {}

    const extras = extraTasksMap[woNo] || []
    const seqNum = extras.filter(t =>
      t.processCode === base.processCode &&
      ((extraModal.kind === 'rework' && t.isReWork) || (extraModal.kind === 'inspect' && t.isInspect))
    ).length + 1

    if (extraModal.kind === 'rework') {
      processNameExtra = `${base.processName.replace(/（返工\d+）/, '').replace(/（检验\d+）/, '')}（返工${seqNum}）`
      flags = { isReWork: true, reWorkFrom: base.taskNo }
    }
    if (extraModal.kind === 'inspect') {
      newStatus = '检验中'
      processNameExtra = `${base.processName.replace(/（返工\d+）/, '').replace(/（检验\d+）/, '')}（检验${seqNum}）`
      flags = { isInspect: true }
    }

    const suffix = extraModal.kind === 'rework' ? `R${seqNum}` : `IP${seqNum}`
    const newTask: TaskTicket = {
      id: `${base.id}-${suffix}`,
      taskNo: `${base.taskNo}-${suffix}`,
      woNo,
      moldCode: base.moldCode,
      moldName: base.moldName,
      itemNo: base.itemNo,
      processCode: base.processCode,
      processName: processNameExtra,
      planHours: Number(extraHours) || 1,
      assignee: extraModal.kind === 'inspect' ? (extraWorker || '质检组') : (extraWorker || base.woIssuer),
      woIssuer: base.woIssuer,
      genTime: new Date().toLocaleString('zh-CN'),
      status: newStatus,
      remark: extraRemark,
      seq: 200 + seqNum,
      ...flags,
    }

    setExtraTasksMap(prev => ({
      ...prev,
      [woNo]: [...(prev[woNo] || []), newTask]
    }))

    setExtraModal({ kind: null, task: null })
    setExtraHours('1')
    setExtraRemark('')
    setExtraWorker('')
  }

  return (
    <MainLayout>
    <div className="flex flex-col h-full bg-[#f5f6f8]">

      {/* 顶部业务说明条 */}
      <div className="mx-4 mt-4 bg-[#eef4fb] border border-[#d0dff0] rounded-lg px-4 py-2.5 flex items-start gap-2 text-xs text-gray-600">
        <Info size={14} className="text-[#1e5fa8] mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p><span className="font-medium">任务逐级产生：</span>上一道工序完成后，下一道任务才自动出现在列表中。未到的工序完全不显示。</p>
          <p><span className="font-medium">任务来源：</span>工单由钳工下达后自动生成第一道任务（领料），下达人负责所有工序到底。</p>
          <p><span className="font-medium">委外：</span>到委外工序时，需钳工手动"创建委外任务"，默认供应商来自ERP，可修改。</p>
          <p><span className="font-medium">已完成：</span>支持"重做（返工）"或"增加检验"，由钳工逐道操作。</p>
        </div>
      </div>

      {/* 当前用户提示 */}
      <div className="mx-4 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User size={12} />
          <span>当前用户：<span className="font-medium text-gray-700">{currentUser}</span></span>
          {!isAdmin && <span className="text-gray-400">（仅显示您负责的工单任务）</span>}
          {isAdmin && <span className="text-amber-600">（ADMIN 可查看所有任务）</span>}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 p-4 pb-0">
        {[
          { label: '可见任务总数', value: stats.total, color: 'text-gray-700' },
          { label: '待开始', value: stats.pending, color: 'text-gray-500' },
          { label: '进行中', value: stats.active, color: 'text-blue-600' },
          { label: '检验中', value: stats.inspect, color: 'text-purple-600' },
          { label: '已完成', value: stats.done, color: 'text-emerald-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={cn('text-2xl font-bold', c.color)}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 次统计 */}
      {(stats.rework + stats.inspect + stats.outsource) > 0 && (
        <div className="px-4 pt-2 flex gap-2 text-xs flex-wrap">
          {stats.rework > 0 && <span className="px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">返工任务：{stats.rework}</span>}
          {stats.inspect > 0 && <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded border border-purple-100">检验任务：{stats.inspect}</span>}
          {stats.outsource > 0 && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-100">委外任务：{stats.outsource}</span>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 pt-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-3 h-8 text-sm">
          <Search size={14} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="任务单号/工单/品号/品名/工序" className="outline-none w-56 text-gray-700 placeholder:text-gray-400" />
        </div>
        <div className="relative">
          <select value={filterWo} onChange={e => setFilterWo(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
            <option value="">全部工单</option>
            {woOptions.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 pl-3 pr-8 text-sm bg-white border border-gray-200 rounded text-gray-700 outline-none appearance-none cursor-pointer">
            <option value="">全部状态</option>
            {(['待开始', '进行中', '检验中', '委外中', '已完成'] as TaskStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterWo('') }} className="flex items-center gap-1 h-8 px-3 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
          <RotateCcw size={13} /> 重置
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto m-4 bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">任务单号</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">关联工单</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品号</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">品名</th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">工序编号</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">工序名称</th>
              <th className="px-4 py-3 text-right text-gray-600 font-medium text-xs">计划工时</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">执行人</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs">负责人</th>
              <th className="px-4 py-3 text-center text-gray-600 font-medium text-xs">状态</th>
              <th className="px-4 py-3 text-left text-gray-600 font-medium text-xs w-64">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">
                  暂无任务数据
                </td>
              </tr>
            ) : filtered.map((task, idx) => {
              const route = WORK_ORDER_ROUTES[task.woNo]
              const showWoDivider = idx === 0 || filtered[idx - 1].woNo !== task.woNo
              return (
                <React.Fragment key={task.id}>
                  {showWoDivider && (
                    <tr className="bg-[#f0f5fa]">
                      <td colSpan={11} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-[#1e5fa8]">{task.woNo}</span>
                          <span className="text-xs text-gray-500">{task.moldName}</span>
                          <ChevronRight size={12} className="text-gray-300" />
                          <span className="text-xs text-gray-500">负责人：{route?.woIssuer}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr key={task.id} className={cn('border-b border-gray-100 hover:bg-gray-50', task.status === '待开始' && 'bg-gray-50/60 border-dashed')}>
                    <td className="px-4 py-3 font-mono text-xs text-[#1e5fa8] font-medium">
                      {task.status === '待开始' ? '—' : task.taskNo}
                      {task.isReWork && <span className="ml-1 inline-block px-1 py-0.5 bg-red-50 text-red-500 rounded text-[10px]">返工</span>}
                      {task.isInspect && !task.isReWork && <span className="ml-1 inline-block px-1 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">检验</span>}
                      {task.isOutsource && !task.isReWork && <span className="ml-1 inline-block px-1 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px]">委外</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{task.woNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{task.moldCode}</td>
                    <td className="px-4 py-3 text-gray-800">{task.moldName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-xs text-[#1e5fa8] font-semibold">{task.processCode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {task.status === '待开始' ? (
                        <span className="text-gray-400">{task.processName}</span>
                      ) : (
                        <>{task.processName}</>
                      )}
                      {task.reWorkFrom && <p className="text-[11px] text-gray-400">返工来源：{task.reWorkFrom}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{task.planHours} h</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">
                      {task.status === '待开始' ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : task.assignee ? (
                        <span className="flex items-center gap-1"><User size={12} className="text-gray-400" />{task.assignee}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[11px] font-medium',
                        task.woIssuer === currentUser ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      )}>
                        {task.woIssuer}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[task.status])}>{task.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2 flex-wrap">
                        {/* 待开始 + 委外工序 -> 创建委外任务 */}
                        {task.status === '待开始' && task.isOutsource && task.woIssuer === currentUser && (
                          <button
                            onClick={() => {
                              const route = WORK_ORDER_ROUTES[task.woNo]
                              const idx = route.processes.findIndex(p => p.code === task.processCode)
                              setCreateOutsourceModal({ woNo: task.woNo, processIdx: idx })
                              setOutsourceVendor(VENDORS[0])
                            }}
                            className="text-xs text-orange-600 hover:underline flex items-center gap-0.5"
                          >
                            <Package size={12} /> 创建委外
                          </button>
                        )}

                        {/* 进行中 -> 完成 */}
                        {task.status === '进行中' && task.woIssuer === currentUser && !task.isOutsource && (
                          <button
                            onClick={() => handleComplete(task)}
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            <CheckCircle size={12} /> 完成
                          </button>
                        )}

                        {/* 委外中 */}
                        {task.status === '委外中' && (
                          <div className="text-xs text-amber-600">
                            {task.outsourceVendor} · {task.outsourceProgress}%
                          </div>
                        )}

                        {/* 已完成 -> 重做 / 增加检验（领料工序不需要） */}
                        {task.status === '已完成' && task.woIssuer === currentUser && !task.isInspect && !task.isOutsource && task.processCode !== '0000' && (
                          <>
                            <button
                              onClick={() => { setExtraModal({ kind: 'rework', task }); setExtraHours('2'); setExtraRemark(''); setExtraWorker(task.assignee) }}
                              className="text-xs text-red-600 hover:underline flex items-center gap-0.5"
                            >
                              <RefreshCw size={12} /> 重做
                            </button>
                            <button
                              onClick={() => { setExtraModal({ kind: 'inspect', task }); setExtraHours('1'); setExtraRemark(''); setExtraWorker('质检组') }}
                              className="text-xs text-purple-600 hover:underline flex items-center gap-0.5"
                            >
                              <AlertTriangle size={12} /> 增加检验
                            </button>
                          </>
                        )}

                        {/* 检验中 */}
                        {task.status === '检验中' && (
                          <span className="text-xs text-gray-400 italic">检验流程中</span>
                        )}
                      </div>
                      {task.remark && <p className="text-[11px] text-gray-400 mt-1 truncate">备注：{task.remark}</p>}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* —— 创建委外任务 弹窗 —— */}
      {createOutsourceModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Package size={16} className="text-orange-500" /> 创建委外任务
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {createOutsourceModal.woNo} · 委外工序
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">委外供应商（默认来自ERP，可修改）</label>
                <select
                  value={outsourceVendor}
                  onChange={e => setOutsourceVendor(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                >
                  <option value="">选择供应商</option>
                  {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">备注（可选）</label>
                <input
                  type="text"
                  placeholder="例如：要求镀钛处理"
                  className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreateOutsourceModal(null)} className="flex-1 h-9 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleCreateOutsource} disabled={!outsourceVendor} className="flex-1 h-9 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-40">
                创建委外
              </button>
            </div>
          </div>
        </div>
      )}

      {/* —— 新增 返工 / 检验 任务 弹窗 —— */}
      {extraModal.kind && extraModal.task && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-[440px] p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
              {extraModal.kind === 'rework' && <><RefreshCw size={16} className="text-red-500" /> 新增返工任务</>}
              {extraModal.kind === 'inspect' && <><AlertTriangle size={16} className="text-purple-500" /> 新增检验任务</>}
            </h3>
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-600 space-y-0.5">
              <p>关联任务：<span className="font-mono text-[#1e5fa8]">{extraModal.task.taskNo}</span></p>
              <p>品号品名：{extraModal.task.itemNo} · {extraModal.task.moldName}</p>
              <p>原工序：{extraModal.task.processCode} {extraModal.task.processName}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">计划工时（小时）</label>
                <input type="number" value={extraHours} onChange={e => setExtraHours(e.target.value)} className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {extraModal.kind === 'inspect' ? '检验员' : '执行人'}
                </label>
                <select value={extraWorker} onChange={e => setExtraWorker(e.target.value)} className="w-full border border-gray-200 rounded px-3 h-9 text-sm text-gray-800 outline-none focus:border-[#1e5fa8]">
                  <option value="">{extraModal.kind === 'inspect' ? '质检组（默认）' : extraModal.task.woIssuer + '（工单负责人）'}</option>
                  {(extraModal.kind === 'inspect' ? INSPECTORS : WORKERS).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">原因 / 备注</label>
                <textarea value={extraRemark} onChange={e => setExtraRemark(e.target.value)} rows={3} placeholder={extraModal.kind === 'rework' ? '例如：首道钳工尺寸超差，需重新修正' : '例如：首件检验 / 过程检验'} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1e5fa8] resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setExtraModal({ kind: null, task: null })} className="flex-1 h-9 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
              <button onClick={handleCreateExtra} disabled={!extraHours} className={cn('flex-1 h-9 text-sm text-white rounded disabled:opacity-40',
                extraModal.kind === 'rework' ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'
              )}>
                确认新增
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </MainLayout>
  )
}
