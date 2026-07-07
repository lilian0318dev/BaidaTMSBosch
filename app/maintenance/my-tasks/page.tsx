'use client'

import { useState, useMemo } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, CalendarDays, AlertTriangle, ChevronDown, X, CheckCircle, XCircle,
  Wrench, FileText, Settings2, Plus, Camera, Package, ChevronRight, ClipboardList,
  CheckSquare, Square, Clock, Truck, AlertCircle, ArrowRight, AlertOctagon, Trash2,
} from 'lucide-react'

/* ============ 数据定义 ============ */

type Role = 'technician' | 'fitter'

const LEVEL1_STATUS = ['待领取', '执行中', '待验收', '已完成', '已退回']
const LEVEL2_STATUS = ['待入库', '待领取', '执行中', '待检验', '不合格整改', '已完成']

const STATUS_COLORS: Record<string, string> = {
  '待领取': 'bg-gray-100 text-gray-700',
  '执行中': 'bg-blue-100 text-blue-700',
  '待验收': 'bg-yellow-100 text-yellow-700',
  '已完成': 'bg-green-100 text-green-700',
  '已退回': 'bg-red-100 text-red-700',
  '待入库': 'bg-orange-100 text-orange-700',
  '待检验': 'bg-purple-100 text-purple-700',
  '不合格整改': 'bg-red-100 text-red-700',
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  '待领取': 'bg-gray-200 text-gray-700',
  '执行中': 'bg-blue-200 text-blue-700',
  '待验收': 'bg-yellow-200 text-yellow-700',
  '已完成': 'bg-green-200 text-green-700',
  '已退回': 'bg-red-200 text-red-700',
  '待入库': 'bg-orange-200 text-orange-700',
  '待检验': 'bg-purple-200 text-purple-700',
  '不合格整改': 'bg-red-200 text-red-700',
}

// 保养项目库
const LEVEL1_ITEMS = [
  { id: 'L1-01', name: '导柱清洁润滑', std: '导柱表面无异物，润滑脂均匀涂抹，无积碳', tools: '无纺布、专用润滑脂、毛刷' },
  { id: 'L1-02', name: '型腔检查', std: '型腔表面无划痕/裂纹/粘料，抛光面光洁度达标', tools: '内窥镜、手电筒、棉纱' },
  { id: 'L1-03', name: '紧固件检查', std: '螺栓紧固无松动，弹簧垫片完好', tools: '扭力扳手、套筒' },
  { id: 'L1-04', name: '顶针系统检查', std: '顶针动作顺畅，复位可靠，间隙≤0.02mm', tools: '游标卡尺、润滑脂、顶针拔出器' },
  { id: 'L1-05', name: '废料通道清理', std: '无废料残留，通道畅通，氮弹簧功能正常', tools: '毛刷、气枪、吸尘器' },
  { id: 'L1-06', name: '冷却水路检测', std: '水流正常无渗漏，水温在范围内', tools: '温度计、压力表' },
  { id: 'L1-07', name: '模具铭牌检查', std: '铭牌清晰，编号与档案一致', tools: '无' },
]

const LEVEL2_ITEMS = [
  { id: 'L2-01', name: '合模精度检测', std: '对角线偏差 ≤ 0.05mm，平行度 ≤ 0.03mm', tools: '百分表、磁性座、高度规' },
  { id: 'L2-02', name: '弹簧压力检测', std: '压力值 80N - 120N，弹性系数在范围内', tools: '弹簧测力计' },
  { id: 'L2-03', name: '冷却水路检测', std: '流量正常，水温 20-35℃，无渗漏', tools: '流量计、温度计、压力表' },
  { id: 'L2-04', name: '刃口磨损检查', std: '刃口磨损量 ≤ 0.1mm，R角正常', tools: '千分尺、R规' },
  { id: 'L2-05', name: '热流道检测', std: '温度控制正常，无滴漏，密封完好', tools: '热电偶、温度巡检仪' },
  { id: 'L2-06', name: '氮弹簧检测', std: '压力稳定，保压时间≥5s', tools: '氮弹簧测试仪' },
]

// 维修工艺路径
const REPAIR_ROUTES = [
  {
    id: 'R001',
    code: 'WX-GY-001',
    name: '常规维修工艺',
    processes: [
      { code: '0010', name: '拆卸检查', hours: 2 },
      { code: '0020', name: '清洗去污', hours: 1 },
      { code: '0030', name: '磨损修复', hours: 4 },
      { code: '0040', name: '研配调试', hours: 3 },
      { code: '0050', name: '组装验收', hours: 2 },
    ],
  },
  {
    id: 'R002',
    code: 'WX-GY-002',
    name: '表面修复工艺',
    processes: [
      { code: '0010', name: '拆卸检查', hours: 2 },
      { code: '0020', name: '表面处理', hours: 6 },
      { code: '0030', name: '热处理', hours: 3 },
      { code: '0040', name: '精加工', hours: 4 },
      { code: '0050', name: '组装验收', hours: 2 },
    ],
  },
  {
    id: 'R003',
    code: 'WX-GY-003',
    name: '紧急维修工艺',
    processes: [
      { code: '0010', name: '快速诊断', hours: 0.5 },
      { code: '0020', name: '应急修复', hours: 2 },
      { code: '0030', name: '简单调试', hours: 1 },
    ],
  },
]

type TaskType = 'level1' | 'level2'
interface MaintenanceTask {
  id: string
  type: TaskType
  planNo: string
  moldId: string
  moldName: string
  moldType: string
  trigger: string
  deadline: string
  status: string
  isOverdue: boolean
  items: { id: string; name: string; std: string; tools: string; checked?: boolean }[]
  issues: string
  photos: string[]
  operator: string
  createTime: string
  isOutsourcing?: boolean
  acceptResult?: 'pass' | 'fail' | null
  inspectionResult?: 'pass' | 'fail' | null
  logs: { time: string; action: string; operator: string }[]
}

const INITIAL_TASKS: MaintenanceTask[] = [
  // 一级保养 - 待领取
  {
    id: 'BT-2026-0001', type: 'level1', planNo: 'PP-2026-0001',
    moldId: 'GJ-2024-001', moldName: '冲压模A型', moldType: '冲压类',
    trigger: '时间周期（每批次）', deadline: '2026-06-22', status: '待领取', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-20 08:30', acceptResult: null,
    logs: [{ time: '2026-06-20 08:30', action: '系统自动生成一级保养任务', operator: 'system' }],
  },
  {
    id: 'BT-2026-0002', type: 'level1', planNo: 'PP-2026-0002',
    moldId: 'GJ-2024-002', moldName: '冲压模B型', moldType: '冲压类',
    trigger: '时间周期（每周）', deadline: '2026-06-18', status: '待领取', isOverdue: true,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-15 14:00', acceptResult: null,
    logs: [{ time: '2026-06-15 14:00', action: '系统自动生成一级保养任务', operator: 'system' }],
  },
  // 一级保养 - 执行中
  {
    id: 'BT-2026-0003', type: 'level1', planNo: 'PP-2026-0001',
    moldId: 'GJ-2024-003', moldName: '冲压模C型', moldType: '冲压类',
    trigger: '生产次数（每5000次）', deadline: '2026-06-25', status: '执行中', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '李师傅', createTime: '2026-06-18 09:00', acceptResult: null,
    logs: [{ time: '2026-06-18 09:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-19 08:30', action: '李师傅领取任务', operator: '李师傅' }],
  },
  {
    id: 'BT-2026-0004', type: 'level1', planNo: 'PP-2026-0003',
    moldId: 'GJ-2024-004', moldName: '拉伸模A型', moldType: '拉伸类',
    trigger: '生产次数（每3000次）', deadline: '2026-06-20', status: '执行中', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '王师傅', createTime: '2026-06-17 10:00', acceptResult: null,
    logs: [{ time: '2026-06-17 10:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-18 08:00', action: '王师傅领取任务', operator: '王师傅' }],
  },

  // 一级保养 - 待验收
  {
    id: 'BT-2026-0006', type: 'level1', planNo: 'PP-2026-0001',
    moldId: 'GJ-2024-021', moldName: '冲压模G型', moldType: '冲压类',
    trigger: '时间周期（每批次）', deadline: '2026-06-10', status: '待验收', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })),
    issues: '顶针动作轻微卡顿，已加强润滑', photos: ['photo1.jpg', 'photo2.jpg'],
    operator: '赵师傅', createTime: '2026-06-08 10:00', acceptResult: null,
    logs: [{ time: '2026-06-08 10:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-09 08:00', action: '赵师傅领取任务', operator: '赵师傅' },
           { time: '2026-06-09 11:30', action: '提交保养记录，等待验收', operator: '赵师傅' }],
  },
  // 一级保养 - 已完成
  {
    id: 'BT-2026-0007', type: 'level1', planNo: 'PP-2026-0002',
    moldId: 'GJ-2024-018', moldName: '拉伸模E型', moldType: '拉伸类',
    trigger: '生产次数（每5000次）', deadline: '2026-06-25', status: '已完成', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '孙师傅', createTime: '2026-06-18 09:00', acceptResult: 'pass',
    logs: [{ time: '2026-06-18 09:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-19 08:30', action: '孙师傅领取任务', operator: '孙师傅' },
           { time: '2026-06-19 11:00', action: '提交保养记录', operator: '孙师傅' },
           { time: '2026-06-19 15:00', action: '主管验收通过', operator: '主管' }],
  },
  {
    id: 'BT-2026-0008', type: 'level1', planNo: 'PP-2026-0003',
    moldId: 'GJ-2024-022', moldName: '弯曲模A型', moldType: '弯曲类',
    trigger: '时间周期（每月）', deadline: '2026-06-28', status: '已完成', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '周师傅', createTime: '2026-06-20 08:00', acceptResult: 'pass',
    logs: [{ time: '2026-06-20 08:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-20 09:00', action: '周师傅领取任务', operator: '周师傅' },
           { time: '2026-06-20 12:00', action: '提交保养记录', operator: '周师傅' },
           { time: '2026-06-20 14:00', action: '主管验收通过', operator: '主管' }],
  },
  // 一级保养 - 已退回
  {
    id: 'BT-2026-0009', type: 'level1', planNo: 'PP-2026-0003',
    moldId: 'GJ-2024-012', moldName: '压铸模D型', moldType: '压铸类',
    trigger: '时间周期（每周）', deadline: '2026-06-16', status: '已退回', isOverdue: true,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '刘师傅', createTime: '2026-06-12 14:30', acceptResult: 'fail',
    logs: [{ time: '2026-06-12 14:30', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-13 08:00', action: '刘师傅领取任务', operator: '刘师傅' },
           { time: '2026-06-13 10:30', action: '提交保养记录', operator: '刘师傅' },
           { time: '2026-06-15 10:00', action: '主管验收不通过：型腔清洁不彻底', operator: '主管' }],
  },
  // 一级保养 - 更多待领取
  {
    id: 'BT-2026-0010', type: 'level1', planNo: 'PP-2026-0004',
    moldId: 'GJ-2024-030', moldName: '复合模A型', moldType: '复合类',
    trigger: '生产次数（每8000次）', deadline: '2026-06-23', status: '待领取', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-21 08:00', acceptResult: null,
    logs: [{ time: '2026-06-21 08:00', action: '系统自动生成一级保养任务', operator: 'system' }],
  },
  {
    id: 'BT-2026-0011', type: 'level1', planNo: 'PP-2026-0005',
    moldId: 'GJ-2024-031', moldName: '切断模A型', moldType: '切断类',
    trigger: '时间周期（每批次）', deadline: '2026-06-24', status: '待领取', isOverdue: false,
    items: LEVEL1_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-21 09:00', acceptResult: null,
    logs: [{ time: '2026-06-21 09:00', action: '系统自动生成一级保养任务', operator: 'system' }],
  },
  // 二级保养 - 待入库
  {
    id: 'BT-2026-1001', type: 'level2', planNo: 'PP-2026-0002',
    moldId: 'GJ-2024-007', moldName: '注塑模C型', moldType: '注塑类',
    trigger: '生产次数（每10000次）', deadline: '2026-06-28', status: '待入库', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-20 08:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-20 08:00', action: '系统自动生成二级保养任务', operator: 'system' }],
  },
  {
    id: 'BT-2026-1002', type: 'level2', planNo: 'PP-2026-0002',
    moldId: 'GJ-2024-008', moldName: '注塑模D型', moldType: '注塑类',
    trigger: '生产次数（每15000次）', deadline: '2026-06-26', status: '待入库', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-19 10:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-19 10:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-19 15:30', action: '模具已入待保养库', operator: '仓库管理员' }],
  },
  // 二级保养 - 待领取
  {
    id: 'BT-2026-1003', type: 'level2', planNo: 'PP-2026-0003',
    moldId: 'GJ-2024-005', moldName: '热段模F型', moldType: '热段模',
    trigger: '生产次数（每5000次）', deadline: '2026-06-25', status: '待领取', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-19 10:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-19 10:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-19 15:30', action: '模具已入待保养库', operator: '仓库管理员' }],
  },
  // 二级保养 - 执行中
  {
    id: 'BT-2026-1004', type: 'level2', planNo: 'PP-2026-0003',
    moldId: 'GJ-2024-009', moldName: '注塑模E型', moldType: '注塑类',
    trigger: '生产次数（每12000次）', deadline: '2026-06-22', status: '执行中', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '赵钳工', createTime: '2026-06-18 09:00', isOutsourcing: true, inspectionResult: null,
    logs: [{ time: '2026-06-18 09:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-18 10:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-18 14:00', action: '赵钳工领取任务', operator: '赵钳工' },
           { time: '2026-06-18 16:00', action: '发起委外：弹簧套件更换', operator: '赵钳工' }],
  },
  {
    id: 'BT-2026-1005', type: 'level2', planNo: 'PP-2026-0004',
    moldId: 'GJ-2024-010', moldName: '压铸模B型', moldType: '压铸类',
    trigger: '时间周期（每月）', deadline: '2026-06-21', status: '执行中', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '钱钳工', createTime: '2026-06-17 11:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-17 11:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-18 08:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-18 09:00', action: '钱钳工领取任务', operator: '钱钳工' }],
  },
  // 二级保养 - 待检验
  {
    id: 'BT-2026-1007', type: 'level2', planNo: 'PP-2026-0004',
    moldId: 'GJ-2024-002', moldName: '冲压模B型', moldType: '冲压类',
    trigger: '生产次数（每5000次）', deadline: '2026-06-15', status: '待检验', isOverdue: true,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '孙钳工', createTime: '2026-06-12 11:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-12 11:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-13 09:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-13 10:00', action: '孙钳工领取任务', operator: '孙钳工' },
           { time: '2026-06-14 17:00', action: '保养完成，发起检验', operator: '孙钳工' }],
  },
  // 二级保养 - 不合格整改
  {
    id: 'BT-2026-1008', type: 'level2', planNo: 'PP-2026-0005',
    moldId: 'GJ-2024-018', moldName: '拉伸模E型', moldType: '拉伸类',
    trigger: '时间周期（每月）', deadline: '2026-06-23', status: '不合格整改', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '合模精度偏差0.08mm', photos: [],
    operator: '周钳工', createTime: '2026-06-16 13:00', isOutsourcing: false, inspectionResult: 'fail',
    logs: [{ time: '2026-06-16 13:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-16 15:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-17 09:00', action: '周钳工领取任务', operator: '周钳工' },
           { time: '2026-06-18 11:00', action: '保养完成，发起检验', operator: '周钳工' },
           { time: '2026-06-18 15:00', action: 'QMS检验：合模精度不合格', operator: '检验员' }],
  },
  // 二级保养 - 已完成
  {
    id: 'BT-2026-1009', type: 'level2', planNo: 'PP-2026-0006',
    moldId: 'GJ-2024-019', moldName: '注塑模F型', moldType: '注塑类',
    trigger: '时间周期（每月）', deadline: '2026-06-10', status: '已完成', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '吴钳工', createTime: '2026-06-06 10:00', isOutsourcing: true, inspectionResult: 'pass',
    logs: [{ time: '2026-06-06 10:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-07 09:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-07 10:00', action: '吴钳工领取任务', operator: '吴钳工' },
           { time: '2026-06-08 16:00', action: '保养完成，发起检验', operator: '吴钳工' },
           { time: '2026-06-09 10:00', action: 'QMS检验通过', operator: '检验员' }],
  },
  {
    id: 'BT-2026-1010', type: 'level2', planNo: 'PP-2026-0007',
    moldId: 'GJ-2024-025', moldName: '压铸模C型', moldType: '压铸类',
    trigger: '生产次数（每20000次）', deadline: '2026-06-18', status: '已完成', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '郑钳工', createTime: '2026-06-12 08:00', isOutsourcing: false, inspectionResult: 'pass',
    logs: [{ time: '2026-06-12 08:00', action: '系统自动生成', operator: 'system' },
           { time: '2026-06-13 09:00', action: '模具入待保养库', operator: '仓库管理员' },
           { time: '2026-06-13 10:00', action: '郑钳工领取任务', operator: '郑钳工' },
           { time: '2026-06-14 16:00', action: '保养完成，发起检验', operator: '郑钳工' },
           { time: '2026-06-15 10:00', action: 'QMS检验通过', operator: '检验员' }],
  },
  // 更多待领取
  {
    id: 'BT-2026-1011', type: 'level2', planNo: 'PP-2026-0008',
    moldId: 'GJ-2024-032', moldName: '注塑模G型', moldType: '注塑类',
    trigger: '生产次数（每18000次）', deadline: '2026-06-27', status: '待领取', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-21 08:30', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-21 08:30', action: '系统自动生成二级保养任务', operator: 'system' },
           { time: '2026-06-21 09:00', action: '模具已入待保养库', operator: '仓库管理员' }],
  },
  {
    id: 'BT-2026-1012', type: 'level2', planNo: 'PP-2026-0009',
    moldId: 'GJ-2024-033', moldName: '拉伸模F型', moldType: '拉伸类',
    trigger: '时间周期（每季度）', deadline: '2026-06-29', status: '待领取', isOverdue: false,
    items: LEVEL2_ITEMS.map((i) => ({ ...i })), issues: '', photos: [],
    operator: '-', createTime: '2026-06-21 10:00', isOutsourcing: false, inspectionResult: null,
    logs: [{ time: '2026-06-21 10:00', action: '系统自动生成二级保养任务', operator: 'system' },
           { time: '2026-06-21 10:30', action: '模具已入待保养库', operator: '仓库管理员' }],
  },
]

/* ============ 页面主体 ============ */

export default function MyMaintenanceTasksPage() {
  const [role, setRole] = useState<Role>('technician')
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [showDetail, setShowDetail] = useState<MaintenanceTask | null>(null)
  const [showExecuting, setShowExecuting] = useState<MaintenanceTask | null>(null)
  const [showInspection, setShowInspection] = useState<MaintenanceTask | null>(null)
  const [activeTab, setActiveTab] = useState<'pool' | 'ongoing' | 'completed' | 'pending'>('pool')
  const [scrapModal, setScrapModal] = useState<MaintenanceTask | null>(null)
  const [scrapForm, setScrapForm] = useState({ reason: '', partName: '', qty: 1, remark: '' })

  const statusOptions = role === 'technician' ? LEVEL1_STATUS : LEVEL2_STATUS

  const roleTasks = tasks.filter((t) => (role === 'technician' ? t.type === 'level1' : t.type === 'level2'))

  const filteredTasks = roleTasks.filter(
    (t) =>
      (!search || t.id.toLowerCase().includes(search.toLowerCase()) || t.moldId.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || t.status === filterStatus) &&
      (!dateRange || t.deadline.includes(dateRange)),
  )

  const tabTasks = useMemo(() => {
    switch (activeTab) {
      case 'pool':
        return filteredTasks.filter((t) => t.status === '待领取' || t.status === '待入库')
      case 'ongoing':
        return filteredTasks.filter((t) => t.status === '执行中')
      case 'completed':
        return filteredTasks.filter((t) => t.status === '已完成')
      case 'pending':
        return filteredTasks.filter((t) => t.status === '待验收' || t.status === '待检验' || t.status === '已退回')
      default:
        return filteredTasks
    }
  }, [activeTab, filteredTasks])

  const tabCounts = useMemo(() => ({
    pool: filteredTasks.filter((t) => t.status === '待领取' || t.status === '待入库').length,
    ongoing: filteredTasks.filter((t) => t.status === '执行中').length,
    completed: filteredTasks.filter((t) => t.status === '已完成').length,
    pending: filteredTasks.filter((t) => t.status === '待验收' || t.status === '待检验' || t.status === '已退回').length,
  }), [filteredTasks])

  // 领取任务
  const handleClaim = (task: MaintenanceTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: '执行中', operator: role === 'technician' ? '李师傅' : '赵钳工' }
          : t,
      ),
    )
  }

  // 入库登记
  const handleWarehouseIn = (task: MaintenanceTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: '待领取' } : t,
      ),
    )
  }

  // 开始执行保养
  const handleStartExecution = (task: MaintenanceTask) => {
    setShowExecuting(task)
  }

  // 完成任务（提交保养记录）
  const handleSubmitMaintenance = (task: MaintenanceTask, checkedItems: string[], issues: string) => {
    const nextStatus = role === 'technician' ? '待验收' : '待检验'
    const newLog = {
      time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      action: role === 'technician' ? '提交保养记录，等待验收' : '保养完成，发起检验',
      operator: task.operator,
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: nextStatus, issues, logs: [...t.logs, newLog] }
          : t,
      ),
    )
    setShowExecuting(null)
  }

  // 转维修
  const [transferRepairModal, setTransferRepairModal] = useState<MaintenanceTask | null>(null)
  const [transferRepairRoute, setTransferRepairRoute] = useState('')

  const handleTransferToRepair = (task: MaintenanceTask, isLevel1: boolean) => {
    if (isLevel1) {
      // 一级保养转维修，跳转到待修模具接收列表
      window.location.href = '/maintenance/repair-receive'
    } else {
      // 二级保养转维修，弹出选择工艺路径弹窗
      setTransferRepairRoute(REPAIR_ROUTES[0].id)
      setTransferRepairModal(task)
    }
    setShowExecuting(null)
  }

  const handleConfirmTransferRepair = () => {
    if (!transferRepairModal) return
    if (!transferRepairRoute) { alert('请选择维修工艺路径'); return }
    const route = REPAIR_ROUTES.find(r => r.id === transferRepairRoute)!
    const woNo = `WX-WO-${Date.now().toString().slice(-8)}`
    alert(`维修工单创建成功！\n\n工单号：${woNo}\n工艺路径：${route.name}\n工序数：${route.processes.length}道\n模具：${transferRepairModal.moldName}\n\n已推送至「我的维修任务」`)
    // 将保养任务标记为已取消或转移
    setTasks(prev => prev.map(t =>
      t.id === transferRepairModal.id ? { ...t, status: '已退回' as const } : t
    ))
    setTransferRepairModal(null)
  }

  const handleScrap = (task: MaintenanceTask) => {
    setShowExecuting(null)
    setScrapModal(task)
  }

  const handleSubmitScrap = () => {
    if (!scrapModal || !scrapForm.reason) {
      alert('请填写报废原因')
      return
    }
    alert(`报废申请提交成功！\n\n单号：BF-${Date.now()}\n模具：${scrapModal.moldName}\n来源：二级保养任务\n\n状态：待审批，等待钳工领班审批。`)
    setScrapModal(null)
    setScrapForm({ reason: '', partName: '', qty: 1, remark: '' })
  }

  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-4 h-full">
        {/* 顶部标题 + 角色切换 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="text-[#1e5fa8]" size={20} />
              <span className="text-gray-800 font-medium text-sm">我的保养任务</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">登录角色：</span>
              <button
                onClick={() => setRole('technician')}
                className={`text-[12px] px-3 py-1 rounded border transition-colors ${
                  role === 'technician' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                车间技术员（一级）
              </button>
              <button
                onClick={() => setRole('fitter')}
                className={`text-[12px] px-3 py-1 rounded border transition-colors ${
                  role === 'fitter' ? 'bg-[#1e5fa8] text-white border-[#1e5fa8]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                工装钳工（二级）
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <span>共 {roleTasks.length} 条任务</span>
            <button className="flex items-center gap-1.5 text-[#1e5fa8] border border-[#1e5fa8] rounded px-3 py-1.5 hover:bg-[#1e5fa8] hover:text-white transition-colors">
              <Plus size={13} /> 新建任务
            </button>
          </div>
        </div>

        {/* 筛选工具栏 */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1">
              <Search size={14} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="任务单号/模具编号搜索"
                className="border border-gray-200 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400"
              />
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none border border-gray-200 rounded px-3 py-1.5 text-[12px] pr-7 bg-white focus:outline-none focus:border-blue-400 cursor-pointer min-w-[100px]">
                  <option value="">全部状态</option>
                  {statusOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => { setSearch(''); setFilterStatus(''); setDateRange('') }}
              className="flex items-center gap-1 text-[12px] text-gray-600 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
              <RotateCcw size={12} /> 重置
            </button>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'pool', label: '任务池' },
            { key: 'ongoing', label: '进行中' },
            { key: 'completed', label: '已完成' },
            { key: 'pending', label: '待验收' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'pool' | 'ongoing' | 'completed' | 'pending')}
              className={`px-5 py-2.5 text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1e5fa8] text-[#1e5fa8] font-medium bg-blue-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeTab === tab.key ? 'bg-[#1e5fa8] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tabCounts[tab.key as keyof typeof tabCounts]}
              </span>
            </button>
          ))}
        </div>

        {/* 任务卡片列表 */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 gap-3">
            {tabTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg border-2 transition-all hover:shadow-md ${
                  task.status === '执行中' ? 'border-blue-300' :
                  'border-gray-200'
                }`}
              >
                <div className="p-4">
                  {/* 头部：任务单号 + 状态 */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{task.id}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{task.planNo}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${STATUS_BADGE_COLORS[task.status]}`}>
                      {task.status}
                    </span>
                  </div>

                  {/* 模具信息 */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">模具编号：</span>
                      <span className="text-[12px] text-[#1e5fa8] font-mono font-medium">{task.moldId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">型号：</span>
                      <span className="text-[12px] text-gray-700">{task.moldName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">类型：</span>
                      <span className="text-[12px] text-gray-600">{task.moldType}</span>
                    </div>
                  </div>

                  {/* 保养级别 + 计划日期 */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      task.type === 'level1' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {task.type === 'level1' ? '一级保养' : '二级保养'}
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <CalendarDays size={11} className={task.isOverdue ? 'text-red-500' : 'text-gray-400'} />
                      <span className={task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {task.deadline}
                      </span>
                    </div>
                  </div>

                  {/* 触发类型 + 执行人 */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                    <span className="truncate flex-1">{task.trigger}</span>
                    <span className="ml-2 shrink-0">执行人：{task.operator}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetail(task)}
                      className="flex-1 text-[12px] text-gray-600 border border-gray-200 rounded py-1.5 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> 详情
                    </button>
                    {task.status === '待领取' && (
                      <button
                        onClick={() => handleClaim(task)}
                        className="flex-1 text-[12px] text-white bg-[#1e5fa8] rounded py-1.5 hover:bg-[#164a85] transition-colors font-medium"
                      >
                        领取
                      </button>
                    )}
                    {task.status === '待入库' && (
                      <button
                        onClick={() => handleWarehouseIn(task)}
                        className="flex-1 text-[12px] text-orange-600 border border-orange-300 rounded py-1.5 hover:bg-orange-50 transition-colors font-medium"
                      >
                        入库登记
                      </button>
                    )}
                    {task.status === '执行中' && (
                      <button
                        onClick={() => handleStartExecution(task)}
                        className="flex-1 text-[12px] text-green-600 border border-green-300 rounded py-1.5 hover:bg-green-50 transition-colors font-medium"
                      >
                        执行保养
                      </button>
                    )}
                    {task.status === '待检验' && (
                      <button
                        onClick={() => setShowInspection(task)}
                        className="flex-1 text-[12px] text-purple-600 border border-purple-300 rounded py-1.5 hover:bg-purple-50 transition-colors font-medium"
                      >
                        发起检验
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tabTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList size={40} className="mb-3 text-gray-300" />
              <div className="text-[13px]">暂无{
                activeTab === 'pool' ? '任务池' :
                activeTab === 'ongoing' ? '进行中' :
                activeTab === 'completed' ? '已完成' : '待验收'
              }任务</div>
            </div>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetail && <DetailModal task={showDetail} onClose={() => setShowDetail(null)} />}
      {showExecuting && (
        <ExecutingModal
          task={showExecuting}
          onClose={() => setShowExecuting(null)}
          onSubmit={(checkedItems, issues) => handleSubmitMaintenance(showExecuting, checkedItems, issues)}
          onTransferToRepair={handleTransferToRepair}
          onScrap={handleScrap}
        />
      )}
      {showInspection && <InspectionModal task={showInspection} onClose={() => setShowInspection(null)} />}
      {transferRepairModal && (
        <TransferRepairModal
          task={transferRepairModal}
          selectedRoute={transferRepairRoute}
          onRouteChange={setTransferRepairRoute}
          onConfirm={handleConfirmTransferRepair}
          onClose={() => setTransferRepairModal(null)}
        />
      )}
      {scrapModal && (
        <ScrapModal
          task={scrapModal}
          form={scrapForm}
          onFormChange={setScrapForm}
          onSubmit={handleSubmitScrap}
          onClose={() => setScrapModal(null)}
        />
      )}
    </MainLayout>
  )
}

/* ============ 详情弹窗 ============ */
function DetailModal({ task, onClose }: { task: MaintenanceTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">任务详情</span>
            <span className="text-xs text-gray-500 font-mono">{task.id}</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[task.status]}`}>{task.status}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">基础信息</div>
            <div className="grid grid-cols-4 gap-3 text-[12px]">
              <div><div className="text-gray-400">关联计划</div><div className="text-gray-700 font-medium">{task.planNo}</div></div>
              <div><div className="text-gray-400">模具编号</div><div className="text-gray-700 font-mono">{task.moldId}</div></div>
              <div><div className="text-gray-400">模具名称</div><div className="text-gray-700">{task.moldName}</div></div>
              <div><div className="text-gray-400">模具类型</div><div className="text-gray-700">{task.moldType}</div></div>
              <div><div className="text-gray-400">触发类型</div><div className="text-gray-700">{task.trigger}</div></div>
              <div><div className="text-gray-400">计划截止</div><div className={task.isOverdue ? 'text-red-600' : 'text-gray-700'}>{task.deadline}</div></div>
              <div><div className="text-gray-400">执行人</div><div className="text-gray-700">{task.operator}</div></div>
              <div><div className="text-gray-400">创建时间</div><div className="text-gray-700">{task.createTime}</div></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">保养项目（共 {task.items.length} 项）</div>
            <div className="space-y-1.5">
              {task.items.map((item, idx) => (
                <div key={task.id + '-' + item.id} className="flex items-start gap-3 p-2 bg-white rounded">
                  <span className="text-[11px] text-gray-400 shrink-0 w-5">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="text-[12px] text-gray-800 font-medium">{item.name}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">标准：{item.std}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">工具：{item.tools}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">流转日志</div>
            <div className="space-y-2">
              {task.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-[12px]">
                  <span className="text-gray-400 font-mono shrink-0">{log.time}</span>
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</div>
                  <div className="flex-1 text-gray-700">{log.action}</div>
                  <div className="text-gray-500 shrink-0">{log.operator}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">关闭</button>
        </div>
      </div>
    </div>
  )
}

/* ============ 执行保养弹窗 ============ */
function ExecutingModal({
  task,
  onClose,
  onSubmit,
  onTransferToRepair,
  onScrap,
}: {
  task: MaintenanceTask
  onClose: () => void
  onSubmit: (checkedItems: string[], issues: string) => void
  onTransferToRepair: (task: MaintenanceTask, isLevel1: boolean) => void
  onScrap: (task: MaintenanceTask) => void
}) {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [issues, setIssues] = useState(task.issues || '')

  const toggleItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleSubmit = () => {
    onSubmit(checkedItems, issues)
  }

  const handleTransfer = () => {
    if (confirm(`确认将模具「${task.moldName}」从保养转为维修？\n\n${task.type === 'level1' ? '一级保养转维修将跳转至待修模具接收列表。' : '二级保养转维修将直接创建维修工单。'}`)) {
      onTransferToRepair(task, task.type === 'level1')
    }
  }

  const progress = Math.round((checkedItems.length / task.items.length) * 100)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <Wrench size={16} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">执行保养</span>
            <span className="text-xs text-gray-500 font-mono">{task.id}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${task.type === 'level1' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {task.type === 'level1' ? '一级保养' : '二级保养'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 模具信息 */}
          <div className="bg-blue-50 rounded p-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#1e5fa8] font-mono font-semibold">{task.moldId}</span>
              <span className="text-[12px] text-gray-700">{task.moldName}</span>
            </div>
            <span className="text-[11px] text-gray-500">·</span>
            <span className="text-[12px] text-gray-600">{task.moldType}</span>
            <span className="text-[11px] text-gray-500">·</span>
            <span className="text-[12px] text-gray-600">{task.trigger}</span>
          </div>

          {/* 进度条 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-gray-600 font-medium">保养进度</span>
              <span className="text-[12px] text-gray-500">
                已完成 <span className="text-[#1e5fa8] font-semibold">{checkedItems.length}</span> / {task.items.length} 项
                <span className="ml-2 text-gray-400">({progress}%)</span>
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 保养项目逐项勾选 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 font-medium">按保养标准逐项执行</div>
            <div className="space-y-2">
              {task.items.map((item, idx) => {
                const checked = checkedItems.includes(item.id)
                return (
                  <label
                    key={task.id + '-' + item.id}
                    className={`flex items-start gap-3 p-3 rounded border transition-colors cursor-pointer ${
                      checked ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <button onClick={() => toggleItem(item.id)} className="mt-0.5 shrink-0">
                      {checked ? (
                        <CheckSquare size={18} className="text-green-600" />
                      ) : (
                        <Square size={18} className="text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="text-[13px] text-gray-800 font-medium">{idx + 1}. {item.name}</div>
                      <div className="text-[11px] text-green-600 mt-1 font-medium">✓ 标准：{item.std}</div>
                      <div className="text-[11px] text-gray-500 mt-1">工具：{item.tools}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 照片上传 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-3 font-medium flex items-center gap-1">
              <Camera size={13} /> 现场照片
            </div>
            <div className="flex gap-2 flex-wrap">
              {task.photos.map((p, idx) => (
                <div key={idx} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 bg-gray-50">
                  <Camera size={20} />
                </div>
              ))}
              <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded flex items-center justify-center text-[11px] text-blue-400 bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <Camera size={18} className="mx-auto mb-1" />
                  添加照片
                </div>
              </div>
            </div>
          </div>

          {/* 问题记录 */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">问题/异常描述</div>
            <textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              rows={3}
              placeholder="记录保养过程中发现的异常情况...（无则留空）"
              className="w-full border border-gray-200 rounded p-2.5 text-[12px] focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray-500">
              已完成 <span className="text-[#1e5fa8] font-medium">{checkedItems.length}</span>/{task.items.length} 项保养
            </span>
            <button
              onClick={handleTransfer}
              className="px-3 py-1.5 text-xs text-orange-600 border border-orange-300 rounded hover:bg-orange-50 flex items-center gap-1"
            >
              <AlertOctagon size={13} /> 转维修
            </button>
            {task.type === 'level2' && (
              <button
                onClick={() => onScrap(task)}
                className="px-3 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 size={13} /> 申请报废
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
            <button
              onClick={handleSubmit}
              disabled={checkedItems.length === 0}
              className="px-4 py-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              提交保养记录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ 检验弹窗 ============ */
function InspectionModal({ task, onClose }: { task: MaintenanceTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[680px] max-w-[95vw] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <Settings2 size={16} className="text-[#1e5fa8]" />
            <span className="text-sm font-semibold text-gray-800">发起检验</span>
            <span className="text-xs text-gray-500 font-mono">{task.id}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">检验项目清单</div>
            <div className="space-y-1.5 text-[12px]">
              {task.items.map((item, idx) => (
                <div key={task.id + '-' + item.id} className="p-2.5 bg-gray-50 rounded border border-gray-200">
                  {idx + 1}. {item.name} — <span className="text-gray-500 text-[11px]">{item.std}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-2 font-medium">检验备注</div>
            <textarea
              rows={3}
              placeholder="检验说明..."
              className="w-full border border-gray-200 rounded p-2.5 text-[12px] focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50">取消</button>
          <button
            onClick={() => { alert('检验任务已推送至 QMS 系统'); onClose() }}
            className="ml-2 px-4 py-1.5 text-xs text-white bg-[#1e5fa8] hover:bg-[#164a85] rounded font-medium">
            推送 QMS 检验
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============ 转维修弹窗（二级保养转维修） ============ */
function TransferRepairModal({
  task,
  selectedRoute,
  onRouteChange,
  onConfirm,
  onClose,
}: {
  task: MaintenanceTask
  selectedRoute: string
  onRouteChange: (route: string) => void
  onConfirm: () => void
  onClose: () => void
}) {
  const route = REPAIR_ROUTES.find(r => r.id === selectedRoute)

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <AlertOctagon size={18} className="text-orange-500" />
              二级保养转维修
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{task.moldId} · {task.moldName}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-xs text-orange-700">
              当前正在执行二级保养，发现问题需要转为维修处理。确认后将创建维修工单，保养任务将标记为取消。
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5">
              <span className="text-red-500">*</span> 选择维修工艺路径
            </label>
            <select
              value={selectedRoute}
              onChange={e => onRouteChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              {REPAIR_ROUTES.map(r => (
                <option key={r.id} value={r.id}>{r.name}（{r.processes.length}道工序）</option>
              ))}
            </select>
            {route && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">工序预览：</div>
                <div className="flex flex-wrap gap-1.5">
                  {route.processes.map((p, i) => (
                    <span key={p.code} className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-700">{p.name}</span>
                      {i < route.processes.length - 1 && (
                        <span className="text-gray-300">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
          <button
            onClick={onConfirm}
            className="px-4 h-8 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
          >
            <FileText size={13} /> 创建维修工单
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============ 报废申请弹窗 ============ */
function ScrapModal({
  task,
  form,
  onFormChange,
  onSubmit,
  onClose,
}: {
  task: MaintenanceTask
  form: { reason: string; partName: string; qty: number; remark: string }
  onFormChange: (form: { reason: string; partName: string; qty: number; remark: string }) => void
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">申请报废</h3>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <p className="text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>报废申请提交后需钳工领班审批，审批通过后将转入报废仓，请谨慎操作。</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-gray-400 text-xs w-20 shrink-0">模具编号</span>
              <span className="text-gray-700 font-mono">{task.moldId}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-xs w-20 shrink-0">模具名称</span>
              <span className="text-gray-800">{task.moldName}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-xs w-20 shrink-0">保养类型</span>
              <span className="text-gray-700">二级保养</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-xs w-20 shrink-0">任务单号</span>
              <span className="text-gray-700 font-mono">{task.id}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">零部件名称 <span className="text-gray-400">(选填)</span></label>
            <input
              value={form.partName}
              onChange={e => onFormChange({ ...form, partName: e.target.value })}
              placeholder="如：凹模镶件"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">报废数量</label>
            <input
              type="number"
              value={form.qty}
              onChange={e => onFormChange({ ...form, qty: Number(e.target.value) })}
              min={1}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">报废原因 <span className="text-red-500">*</span></label>
            <textarea
              value={form.reason}
              onChange={e => onFormChange({ ...form, reason: e.target.value })}
              rows={3}
              placeholder="请详细描述报废原因"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">备注</label>
            <textarea
              value={form.remark}
              onChange={e => onFormChange({ ...form, remark: e.target.value })}
              rows={2}
              placeholder="选填"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1e5fa8] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-3.5 border-t border-gray-100">
          <button onClick={onClose} className="px-5 h-8 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">取消</button>
          <button onClick={onSubmit} className="px-5 h-8 text-sm bg-red-500 text-white rounded hover:bg-red-600">提交报废申请</button>
        </div>
      </div>
    </div>
  )
}
