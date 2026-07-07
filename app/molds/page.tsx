'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Filter, RotateCcw, Save, Trash2, MinusCircle,
  Download, Upload, Settings2, Plus, ChevronDown,
  Pencil, PowerOff, Power, AlertTriangle, X, Eye,
} from 'lucide-react'

// 状态配色（在用/在库/维修中/保养中/委外中/报废）
const STATUS_COLORS: Record<string, string> = {
  '在用': 'bg-green-500',
  '在库': 'bg-blue-500',
  '维修中': 'bg-red-500',
  '保养中': 'bg-yellow-500',
  '委外中': 'bg-purple-500',
  '报废': 'bg-gray-600',
}

const STATUS_LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '在用': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  '在库': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  '维修中': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  '保养中': { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  '委外中': { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  '报废': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '通用件': { bg: 'bg-slate-100', text: 'text-slate-600' },
  '易损件': { bg: 'bg-red-100', text: 'text-red-600' },
  '标准件': { bg: 'bg-blue-100', text: 'text-blue-600' },
  '技术开发类': { bg: 'bg-violet-100', text: 'text-violet-600' },
}

type ToolRecord = {
  id: string
  department: string
  itemNo: string
  itemName: string
  spec: string
  type: string
  category: string
  status: string
  location: string
  processCount: number
  manufactureDate: string
  responsiblePerson: string
}

const INITIAL_TOOLS: ToolRecord[] = [
  { id: '190038', department: '一车间卡钳活塞', itemNo: '60004712402104', itemName: '7686SO三工位成形凹模', spec: '32327686SO', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 7300, manufactureDate: '2024-01-15', responsiblePerson: '张三' },
  { id: '190018', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 1800, manufactureDate: '2023-06-20', responsiblePerson: '李四' },
  { id: '190140', department: '一车间卡钳活塞', itemNo: '60004712402030', itemName: '7686SO成形凹模', spec: '32327686SO', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・15号工位', processCount: 9000, manufactureDate: '2023-11-05', responsiblePerson: '王五' },
  { id: '190654', department: '一车间动铁芯', itemNo: '60008412402030', itemName: '695反挤冲头芯', spec: 'GD326695-2', type: '冲头芯', category: '易损件', status: '在用', location: '一车间・20号工位', processCount: 51000, manufactureDate: '2022-03-10', responsiblePerson: '赵六' },
  { id: '190032', department: '一车间动铁芯', itemNo: '60008412402060', itemName: '695反挤成形凹模', spec: 'GD326695-2', type: '成形凹模', category: '易损件', status: '维修中', location: '模具车间・待修仓', processCount: 10450, manufactureDate: '2024-05-12', responsiblePerson: '钱七' },
  { id: '190003', department: '一车间法兰衬套', itemNo: '60010712401040', itemName: '3020镦粗凹模', spec: '2410.363.013', type: '镦粗凹模', category: '易损件', status: '在用', location: '一车间・保养仓', processCount: 27740, manufactureDate: '2025-02-28', responsiblePerson: '孙八' },
  { id: '190014', department: '一车间磁极', itemNo: '60010112104000', itemName: '1250冲孔、切边成套', spec: '201250D', type: '冲孔切边成套', category: '通用件', status: '在用', location: '一车间・25号工位', processCount: 120500, manufactureDate: '2021-08-20', responsiblePerson: '周九' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60022012403030', itemName: '6969压齿冲头', spec: '32336969', type: '压齿冲头', category: '易损件', status: '保养中', location: '一车间・保养仓', processCount: 31700, manufactureDate: '2023-04-15', responsiblePerson: '吴十' },
  { id: '190004', department: '一车间静铁芯', itemNo: '60008612203000', itemName: '671冲孔成套', spec: '188671L', type: '冲孔成套', category: '通用件', status: '在用', location: '一车间・18号工位', processCount: 48000, manufactureDate: '2022-11-30', responsiblePerson: '张三' },
  { id: '190015', department: '一车间静铁芯', itemNo: '60013112103000', itemName: '4026切边切槽成套', spec: '214026', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・22号工位', processCount: 20500, manufactureDate: '2023-09-18', responsiblePerson: '李四' },
  { id: '190028', department: '一车间爪极', itemNo: '60026601202002', itemName: '0212精锻上模', spec: 'A2730212', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 16800, manufactureDate: '2024-06-22', responsiblePerson: '王五' },
  { id: '190030', department: '一车间爪极', itemNo: '60024901201002', itemName: '2COT粗锻上模', spec: 'F000BL2C0T', type: '粗锻上模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-10', responsiblePerson: '赵六' },
  { id: '190042', department: '一车间爪极', itemNo: '60024901201003', itemName: '2COT粗锻下模', spec: 'F000BL2C0T', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・06号工位', processCount: 6000, manufactureDate: '2024-03-08', responsiblePerson: '钱七' },
  { id: '190025', department: '一车间爪极', itemNo: '60024901201002', itemName: '2COT粗锻上模', spec: 'F000BL2C0T', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・07号工位', processCount: 18000, manufactureDate: '2023-12-15', responsiblePerson: '孙八' },
  { id: '190332', department: '一车间爪极', itemNo: '60003201201010', itemName: '2466粗锻上模', spec: '2712466', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 18320, manufactureDate: '2024-02-20', responsiblePerson: '周九' },
  { id: '190411', department: '一车间爪极', itemNo: '60003201202010', itemName: '2466精锻上模', spec: '2712466', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 25520, manufactureDate: '2024-04-05', responsiblePerson: '吴十' },
  { id: '190036', department: '一车间爪极', itemNo: '60019501202010', itemName: '5639精锻上模', spec: 'A2725639', type: '精锻上模', category: '易损件', status: '维修中', location: '模具车间・待修仓', processCount: 6960, manufactureDate: '2024-07-12', responsiblePerson: '张三' },
  { id: '190103', department: '一车间爪极', itemNo: '60023301202010', itemName: '11WT精锻上模', spec: 'F000BL11WT', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 16400, manufactureDate: '2023-10-28', responsiblePerson: '李四' },
  { id: '190029', department: '一车间爪极', itemNo: '60026601201002', itemName: '0212粗锻上模', spec: 'A2730212', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・03号工位', processCount: 10800, manufactureDate: '2024-08-15', responsiblePerson: '王五' },
  { id: '190074', department: '一车间爪极', itemNo: '60026601201003', itemName: '0212粗锻下模', spec: 'A2730212', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・04号工位', processCount: 10800, manufactureDate: '2024-08-15', responsiblePerson: '赵六' },
  { id: '190044', department: '一车间爪极', itemNo: '60026601202003', itemName: '0212精锻下模', spec: 'A2730212', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 16800, manufactureDate: '2024-06-22', responsiblePerson: '钱七' },
  { id: '190295', department: '一车间爪极', itemNo: '60000801201010', itemName: '7708粗锻上模', spec: '2717708', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 9200, manufactureDate: '2024-01-30', responsiblePerson: '孙八' },
  { id: '190498', department: '一车间爪极', itemNo: '60000801201020', itemName: '7708粗锻下模', spec: '2717708', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 3200, manufactureDate: '2025-03-12', responsiblePerson: '周九' },
  { id: '190297', department: '一车间爪极', itemNo: '60000801202020', itemName: '7708精锻下模', spec: '2717708', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 23420, manufactureDate: '2023-11-05', responsiblePerson: '吴十' },
  { id: '190006', department: '一车间爪极', itemNo: '60000801607003', itemName: '7708四工位热切边凹模', spec: '2717708', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・16号工位', processCount: 33420, manufactureDate: '2022-05-20', responsiblePerson: '张三' },
  { id: '190037', department: '一车间爪极', itemNo: '60004212404030', itemName: '4891挤槽凹模', spec: '2624891', type: '挤槽凹模', category: '易损件', status: '保养中', location: '一车间・保养仓', processCount: 7310, manufactureDate: '2024-09-08', responsiblePerson: '李四' },
  { id: '190002', department: '一车间爪极', itemNo: '60003201607003', itemName: '2466四工位热切边凹模', spec: '2712466', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・17号工位', processCount: 32180, manufactureDate: '2022-07-14', responsiblePerson: '王五' },
  { id: '190120', department: '一车间爪极', itemNo: '60025001603002', itemName: '4606反切冲头', spec: 'A2714606', type: '反切冲头', category: '易损件', status: '在用', location: '一车间・19号工位', processCount: 41320, manufactureDate: '2023-03-25', responsiblePerson: '赵六' },
  { id: '190197', department: '一车间爪极', itemNo: '60025001603003', itemName: '4606反切凹模', spec: 'A2714606', type: '反切凹模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-15', responsiblePerson: '钱七' },
  { id: '190119', department: '一车间爪极', itemNo: '60025001603002', itemName: '4606反切冲头', spec: 'A2714606', type: '反切冲头', category: '易损件', status: '在用', location: '一车间・20号工位', processCount: 37440, manufactureDate: '2023-05-18', responsiblePerson: '孙八' },
  { id: '190222', department: '一车间爪极', itemNo: '60025101201002', itemName: '4608粗锻上模', spec: 'A2714608', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・21号工位', processCount: 11520, manufactureDate: '2024-04-22', responsiblePerson: '周九' },
  { id: '190061', department: '一车间爪极', itemNo: '60024901201003', itemName: '2COT粗锻下模', spec: 'F000BL2C0T', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・06号工位', processCount: 5500, manufactureDate: '2024-10-05', responsiblePerson: '吴十' },
  { id: '190039', department: '一车间爪极', itemNo: '60024901202002', itemName: '2COT精锻上模', spec: 'F000BL2C0T', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・07号工位', processCount: 6000, manufactureDate: '2024-03-08', responsiblePerson: '张三' },
  { id: '190043', department: '一车间爪极', itemNo: '60024901202003', itemName: '2COT精锻下模', spec: 'F000BL2C0T', type: '精锻下模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-12', responsiblePerson: '李四' },
  { id: '190112', department: '一车间爪极', itemNo: '60023301201020', itemName: '11WT粗锻下模', spec: 'F000BL11WT', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 13600, manufactureDate: '2024-01-18', responsiblePerson: '王五' },
  { id: '190113', department: '一车间爪极', itemNo: '60023301201010', itemName: '11WT精锻上模', spec: 'F000BL11WT', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 14000, manufactureDate: '2023-10-28', responsiblePerson: '赵六' },
  { id: '190131', department: '一车间爪极', itemNo: '60026601202002', itemName: '0212精锻上模', spec: 'A2730212', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 15840, manufactureDate: '2024-06-22', responsiblePerson: '钱七' },
  { id: '190058', department: '一车间爪极', itemNo: '60026601202003', itemName: '0212精锻下模', spec: 'A2730212', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 9840, manufactureDate: '2024-08-30', responsiblePerson: '孙八' },
  { id: '190059', department: '一车间爪极', itemNo: '60021201202020', itemName: '6064精锻下模', spec: 'A2726064', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・23号工位', processCount: 16380, manufactureDate: '2024-02-14', responsiblePerson: '周九' },
  { id: '190067', department: '一车间爪极', itemNo: '60023301201010', itemName: '11WT粗锻上模', spec: 'F000BL11WT', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 23406, manufactureDate: '2023-08-22', responsiblePerson: '吴十' },
  { id: '190095', department: '一车间爪极', itemNo: '60023301201020', itemName: '11WT粗锻下模', spec: 'F000BL11WT', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 10000, manufactureDate: '2024-01-18', responsiblePerson: '张三' },
  { id: '190115', department: '一车间爪极', itemNo: '60023301202010', itemName: '11WT精锻上模', spec: 'F000BL11WT', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 6800, manufactureDate: '2024-06-10', responsiblePerson: '李四' },
  { id: '190060', department: '一车间爪极', itemNo: '60023301202020', itemName: '11WT精锻下模', spec: 'F000BL11WT', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 19400, manufactureDate: '2023-12-05', responsiblePerson: '王五' },
  { id: '190027', department: '一车间爪极', itemNo: '60023301603020', itemName: '11WT热切边凹模', spec: 'F000BL11WT', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・15号工位', processCount: 19200, manufactureDate: '2023-09-30', responsiblePerson: '赵六' },
  { id: '190022', department: '一车间爪极', itemNo: '60023301603020', itemName: '11WT热切边凹模', spec: 'F000BL11WT', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・15号工位', processCount: 11900, manufactureDate: '2024-05-12', responsiblePerson: '钱七' },
  { id: '190001', department: '一车间爪极', itemNo: '60025001607003', itemName: '4606四工位热切边凹模', spec: 'A2714606', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・18号工位', processCount: 33280, manufactureDate: '2022-11-08', responsiblePerson: '孙八' },
  { id: '190229', department: '一车间爪极', itemNo: '60025101201002', itemName: '4608粗锻上模', spec: 'A2714608', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・21号工位', processCount: 13700, manufactureDate: '2024-02-28', responsiblePerson: '周九' },
  { id: '190543', department: '一车间爪极', itemNo: '60025101201003', itemName: '4608粗锻下模', spec: 'A2714608', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・22号工位', processCount: 12580, manufactureDate: '2024-05-15', responsiblePerson: '吴十' },
  { id: '190159', department: '一车间爪极', itemNo: '60025101202002', itemName: '4608精锻上模', spec: 'A2714608', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・23号工位', processCount: 9980, manufactureDate: '2024-07-20', responsiblePerson: '张三' },
  { id: '190472', department: '一车间爪极', itemNo: '60025101201003', itemName: '4608粗锻下模', spec: 'A2714608', type: '粗锻下模', category: '易损件', status: '维修中', location: '模具车间・待修仓', processCount: 13700, manufactureDate: '2024-05-15', responsiblePerson: '李四' },
  { id: '190166', department: '一车间爪极', itemNo: '60025101202002', itemName: '4608精锻上模', spec: 'A2714608', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・24号工位', processCount: 5500, manufactureDate: '2024-09-10', responsiblePerson: '王五' },
  { id: '190312', department: '一车间爪极', itemNo: '60000901201010', itemName: '7709粗锻上模', spec: '2717709', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・26号工位', processCount: 11800, manufactureDate: '2024-03-05', responsiblePerson: '赵六' },
  { id: '190595', department: '一车间爪极', itemNo: '60000901201020', itemName: '7709粗锻下模', spec: '2717709', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・27号工位', processCount: 17600, manufactureDate: '2023-12-18', responsiblePerson: '钱七' },
  { id: '190522', department: '一车间爪极', itemNo: '60000901202010', itemName: '7709精锻上模', spec: '2717709', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 5800, manufactureDate: '2024-08-25', responsiblePerson: '孙八' },
  { id: '190013', department: '一车间爪极', itemNo: '60001201201010', itemName: '7016粗锻上模', spec: '2627016', type: '粗锻上模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-18', responsiblePerson: '周九' },
  { id: '190020', department: '一车间爪极', itemNo: '60001312405040', itemName: '7017整形2全整形凹模', spec: '2627017', type: '整形凹模', category: '易损件', status: '在用', location: '一车间・29号工位', processCount: 39330, manufactureDate: '2022-06-30', responsiblePerson: '吴十' },
  { id: '190024', department: '一车间爪极', itemNo: '60001301201010', itemName: '7017粗锻上模', spec: '2627017', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・30号工位', processCount: 18020, manufactureDate: '2023-07-15', responsiblePerson: '张三' },
  { id: '190018', department: '一车间爪极', itemNo: '60001301201020', itemName: '7017粗锻下模', spec: '2627017', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・30号工位', processCount: 12500, manufactureDate: '2024-01-22', responsiblePerson: '李四' },
  { id: '190521', department: '一车间爪极', itemNo: '60000901202010', itemName: '7709精锻上模', spec: '2717709', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 6000, manufactureDate: '2024-08-25', responsiblePerson: '王五' },
  { id: '190035', department: '一车间爪极', itemNo: '60026601201002', itemName: '0212粗锻上模', spec: 'A2730212', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・03号工位', processCount: 11040, manufactureDate: '2024-04-18', responsiblePerson: '赵六' },
  { id: '190069', department: '一车间爪极', itemNo: '60026601201003', itemName: '0212粗锻下模', spec: 'A2730212', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・04号工位', processCount: 11040, manufactureDate: '2024-04-18', responsiblePerson: '钱七' },
  { id: '190040', department: '一车间爪极', itemNo: '60019501201010', itemName: '5639粗锻上模', spec: 'A2725639', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・02号工位', processCount: 18000, manufactureDate: '2023-10-08', responsiblePerson: '孙八' },
  { id: '190080', department: '一车间爪极', itemNo: '60019501201020', itemName: '5639粗锻下模', spec: 'A2725639', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・02号工位', processCount: 18000, manufactureDate: '2023-10-08', responsiblePerson: '周九' },
  { id: '190132', department: '一车间爪极', itemNo: '60019501202010', itemName: '5639精锻上模', spec: 'A2725639', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・02号工位', processCount: 12240, manufactureDate: '2024-06-12', responsiblePerson: '吴十' },
  { id: '190048', department: '一车间爪极', itemNo: '60019501202020', itemName: '5639精锻下模', spec: 'A2725639', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・02号工位', processCount: 15480, manufactureDate: '2024-02-28', responsiblePerson: '张三' },
  { id: '190001', department: '一车间爪极', itemNo: '60019501607003', itemName: '5639四工位热切边凹模', spec: 'A2725639', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・03号工位', processCount: 18000, manufactureDate: '2022-09-15', responsiblePerson: '李四' },
  { id: '190004', department: '一车间爪极', itemNo: '60026601607003', itemName: '0212四工位热切边凹模', spec: 'A2730212', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・06号工位', processCount: 26640, manufactureDate: '2022-12-20', responsiblePerson: '王五' },
  { id: '190012', department: '一车间平衡块', itemNo: '60057501204010', itemName: 'P02A粗锻上模', spec: '5321191P02A', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・31号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '赵六' },
  { id: '190011', department: '一车间平衡块', itemNo: '60057501204020', itemName: 'P02A粗锻下模', spec: '5321191P02A', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・31号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '赵六' },
  { id: '190024', department: '一车间平衡块', itemNo: '60057501205010', itemName: 'P02A精锻精锻上模', spec: '5321191P02A', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・31号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '赵六' },
  { id: '190009', department: '一车间平衡块', itemNo: '60057501205020', itemName: 'P02A精锻精锻下模', spec: '5321191P02A', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・31号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '赵六' },
  { id: '190001', department: '一车间平衡块', itemNo: '60057501606040', itemName: 'P02A热切边热切边上模芯', spec: '5321191P02A', type: '热切边上模芯', status: '在用', location: '一车间・32号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '钱七' },
  { id: '190009', department: '一车间平衡块', itemNo: '60057501606050', itemName: 'P02A热切边热切边凹模', spec: '5321191P02A', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・32号工位', processCount: 3000, manufactureDate: '2024-07-08', responsiblePerson: '钱七' },
  { id: '190047', department: '一车间静铁芯', itemNo: '60008612402050', itemName: '671成形凹模', spec: '188671L', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・16号工位', processCount: 70000, manufactureDate: '2022-08-10', responsiblePerson: '孙八' },
  { id: '190046', department: '一车间静铁芯', itemNo: '60008612402050', itemName: '671成形凹模', spec: '188671L', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・16号工位', processCount: 75000, manufactureDate: '2022-08-10', responsiblePerson: '孙八' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 4800, manufactureDate: '2024-05-20', responsiblePerson: '周九' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 3500, manufactureDate: '2024-03-15', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 6600, manufactureDate: '2024-03-15', responsiblePerson: '吴十' },
  { id: '190024', department: '一车间卡钳活塞', itemNo: '60022012402020', itemName: '6969成形冲头', spec: '32336969', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 37400, manufactureDate: '2023-02-28', responsiblePerson: '张三' },
  { id: '190005', department: '一车间卡钳活塞', itemNo: '60022012402030', itemName: '6969成形凹模', spec: '32336969', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 2200, manufactureDate: '2024-08-05', responsiblePerson: '张三' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60021612401020', itemName: '1705镦粗冲头', spec: '32331705', type: '镦粗冲头', status: '在用', location: '一车间・13号工位', processCount: 80000, manufactureDate: '2021-12-10', responsiblePerson: '李四' },
  { id: '190057', department: '一车间开关壳', itemNo: '60007812206060', itemName: '817B冲3孔冲头固定座', spec: '199817B', type: '冲头固定座', category: '标准件', status: '在用', location: '一车间・33号工位', processCount: 18900, manufactureDate: '2023-11-18', responsiblePerson: '王五' },
  { id: '193117', department: '一车间开关壳', itemNo: '60007812404030', itemName: '817B成形冲头', spec: '199817B', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・34号工位', processCount: 21800, manufactureDate: '2023-09-25', responsiblePerson: '赵六' },
  { id: '190023', department: '一车间磁极', itemNo: '60010212104000', itemName: '4437冲孔、切边成套', spec: 'A1214437', type: '冲孔切边成套', category: '通用件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-20', responsiblePerson: '钱七' },
  { id: '190020', department: '一车间磁极', itemNo: '60010212104000', itemName: '4437冲孔、切边成套', spec: 'A1214437', type: '冲孔切边成套', category: '通用件', status: '在用', location: '一车间・24号工位', processCount: 249000, manufactureDate: '2020-05-15', responsiblePerson: '钱七' },
  { id: '190063', department: '一车间轴叉', itemNo: '60029101201002', itemName: '1270粗锻上模', spec: '1001270', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・35号工位', processCount: 6000, manufactureDate: '2024-02-10', responsiblePerson: '孙八' },
  { id: '190041', department: '一车间轴叉', itemNo: '60029101201003', itemName: '1270粗锻下模', spec: '1001270', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・35号工位', processCount: 6000, manufactureDate: '2024-02-10', responsiblePerson: '孙八' },
  { id: '190039', department: '一车间轴叉', itemNo: '60029101202002', itemName: '1270精锻上模', spec: '1001270', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・36号工位', processCount: 6000, manufactureDate: '2024-02-10', responsiblePerson: '孙八' },
  { id: '190043', department: '一车间轴叉', itemNo: '60029101202003', itemName: '1270精锻下模', spec: '1001270', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・36号工位', processCount: 6000, manufactureDate: '2024-02-10', responsiblePerson: '孙八' },
  { id: '190036', department: '一车间轴叉', itemNo: '60029101603004', itemName: '1270热切边凹模', spec: '1001270', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・37号工位', processCount: 4000, manufactureDate: '2024-04-22', responsiblePerson: '周九' },
  { id: '190008', department: '一车间平衡块', itemNo: '60057301201010', itemName: 'P04A粗锻上模', spec: '5321191P04A', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 1900, manufactureDate: '2024-09-12', responsiblePerson: '吴十' },
  { id: '190005', department: '一车间平衡块', itemNo: '60057301201010', itemName: 'P04A粗锻上模', spec: '5321191P04A', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 17, manufactureDate: '2025-04-08', responsiblePerson: '吴十' },
  { id: '190004', department: '一车间静铁芯', itemNo: '60013112103000', itemName: '4026切边切槽成套', spec: '214026', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・22号工位', processCount: 55000, manufactureDate: '2022-04-15', responsiblePerson: '张三' },
  { id: '190005', department: '一车间静铁芯', itemNo: '60013112103000', itemName: '4026切边切槽成套', spec: '214026', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・22号工位', processCount: 5000, manufactureDate: '2024-01-20', responsiblePerson: '张三' },
  { id: '190002', department: '一车间卡钳活塞', itemNo: '60020412401044', itemName: '3241三工位成形凹模', spec: '32343241', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 12600, manufactureDate: '2023-06-28', responsiblePerson: '李四' },
  { id: '190011', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 2700, manufactureDate: '2024-03-15', responsiblePerson: '李四' },
  { id: '190037', department: '一车间卡钳活塞', itemNo: '60012812402030', itemName: '4919成形凹模', spec: '32334919', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 3200, manufactureDate: '2024-06-05', responsiblePerson: '王五' },
  { id: '190035', department: '一车间卡钳活塞', itemNo: '60012812402030', itemName: '4919成形凹模', spec: '32334919', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 2300, manufactureDate: '2024-06-05', responsiblePerson: '王五' },
  { id: '190024', department: '一车间卡钳活塞', itemNo: '60012812402030', itemName: '4919成形凹模', spec: '32334919', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 3000, manufactureDate: '2024-06-05', responsiblePerson: '王五' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60022012402030', itemName: '6969成形凹模', spec: '32336969', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 3800, manufactureDate: '2024-08-05', responsiblePerson: '张三' },
  { id: '190034', department: '一车间卡钳活塞', itemNo: '60017112402030', itemName: '5582成形凹模', spec: 'A5582-12200', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 4800, manufactureDate: '2024-07-18', responsiblePerson: '赵六' },
  { id: '190055', department: '一车间卡钳活塞', itemNo: '60014912403030', itemName: '4028SO压齿冲头', spec: '32324028SO', type: '压齿冲头', category: '易损件', status: '保养中', location: '一车间・保养仓', processCount: 28300, manufactureDate: '2023-04-20', responsiblePerson: '钱七' },
  { id: '190052', department: '一车间卡钳活塞', itemNo: '60014912403030', itemName: '4028SO压齿冲头', spec: '32324028SO', type: '压齿冲头', category: '易损件', status: '保养中', location: '一车间・保养仓', processCount: 36000, manufactureDate: '2023-04-20', responsiblePerson: '钱七' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60020412401041', itemName: '3241三工位成形冲头', spec: '32343241', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 95600, manufactureDate: '2022-09-15', responsiblePerson: '李四' },
  { id: '190063', department: '一车间卡钳活塞', itemNo: '60017112402020', itemName: '5582成形冲头', spec: 'A5582-12200', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 228500, manufactureDate: '2020-11-08', responsiblePerson: '赵六' },
  { id: '190021', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 5960, manufactureDate: '2024-02-25', responsiblePerson: '孙八' },
  { id: '190014', department: '一车间卡钳活塞', itemNo: '60021612403030', itemName: '1705压齿下冲头', spec: '32331705', type: '压齿下冲头', status: '在用', location: '一车间・13号工位', processCount: 300000, manufactureDate: '2019-08-22', responsiblePerson: '李四' },
  { id: '190124', department: '一车间爪极', itemNo: '60021801201010', itemName: '0891粗锻上模', spec: 'A2710891', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・39号工位', processCount: 13460, manufactureDate: '2024-01-28', responsiblePerson: '周九' },
  { id: '190270', department: '一车间爪极', itemNo: '60021801201020', itemName: '0891粗锻下模', spec: 'A2710891', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・39号工位', processCount: 13460, manufactureDate: '2024-01-28', responsiblePerson: '周九' },
  { id: '190112', department: '一车间爪极', itemNo: '60021801202010', itemName: '0891精锻上模', spec: 'A2710891', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 13460, manufactureDate: '2024-01-28', responsiblePerson: '周九' },
  { id: '190294', department: '一车间爪极', itemNo: '60021801202020', itemName: '0891精锻下模', spec: 'A2710891', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 13460, manufactureDate: '2024-01-28', responsiblePerson: '周九' },
  { id: '190333', department: '一车间爪极', itemNo: '60003201201010', itemName: '2466粗锻上模', spec: '2712466', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 11520, manufactureDate: '2024-05-30', responsiblePerson: '吴十' },
  { id: '190413', department: '一车间爪极', itemNo: '60003201202010', itemName: '2466精锻上模', spec: '2712466', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 11520, manufactureDate: '2024-05-30', responsiblePerson: '吴十' },
  { id: '190428', department: '一车间爪极', itemNo: '60003201202020', itemName: '2466精锻下模', spec: '2712466', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 11520, manufactureDate: '2024-05-30', responsiblePerson: '吴十' },
  { id: '190598', department: '一车间爪极', itemNo: '60000901201020', itemName: '7709粗锻下模', spec: '2717709', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・27号工位', processCount: 12000, manufactureDate: '2024-08-18', responsiblePerson: '张三' },
  { id: '190524', department: '一车间爪极', itemNo: '60000901202010', itemName: '7709精锻上模', spec: '2717709', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 12000, manufactureDate: '2024-08-18', responsiblePerson: '张三' },
  { id: '190343', department: '一车间爪极', itemNo: '60000901202020', itemName: '7709精锻下模', spec: '2717709', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 23800, manufactureDate: '2023-11-12', responsiblePerson: '张三' },
  { id: '190449', department: '一车间爪极', itemNo: '60003201202020', itemName: '2466精锻下模', spec: '2712466', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 10100, manufactureDate: '2024-09-05', responsiblePerson: '李四' },
  { id: '190103', department: '一车间爪极', itemNo: '60016101201010', itemName: '2C04粗锻上模', spec: 'F000BL2C04', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・41号工位', processCount: 13200, manufactureDate: '2023-12-20', responsiblePerson: '王五' },
  { id: '190130', department: '一车间爪极', itemNo: '60016101202010', itemName: '2C04精锻上模', spec: 'F000BL2C04', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・42号工位', processCount: 8640, manufactureDate: '2024-04-15', responsiblePerson: '赵六' },
  { id: '190003', department: '一车间爪极', itemNo: '60016101607003', itemName: '2C04热切边凹模（四工位）', spec: 'F000BL2C04', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・43号工位', processCount: 13200, manufactureDate: '2023-12-20', responsiblePerson: '钱七' },
  { id: '190006', department: '一车间十字环', itemNo: '60023601201002', itemName: '1201热锻上模', spec: '6S3J1201-01', type: '热锻上模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 0, manufactureDate: '2026-06-22', responsiblePerson: '孙八' },
  { id: '190006', department: '一车间十字环', itemNo: '60023612401002', itemName: '1201整形冲头', spec: '6S3J1201-01', type: '整形冲头', category: '标准件', status: '在用', location: '一车间・44号工位', processCount: 19200, manufactureDate: '2023-05-18', responsiblePerson: '周九' },
  { id: '190006', department: '一车间十字环', itemNo: '60023612401003', itemName: '1201整形凹模', spec: '6S3J1201-01', type: '整形凹模', category: '易损件', status: '在用', location: '一车间・44号工位', processCount: 19200, manufactureDate: '2023-05-18', responsiblePerson: '周九' },
  { id: '190004', department: '一车间十字环', itemNo: '60023612401002', itemName: '1201整形冲头', spec: '6S3J1201-01', type: '整形冲头', category: '标准件', status: '在用', location: '一车间・44号工位', processCount: 19200, manufactureDate: '2023-05-18', responsiblePerson: '周九' },
  { id: '190003', department: '一车间铝机壳', itemNo: '60035712403010', itemName: '6529机壳一次成型模下冲头', spec: 'G26529', type: '成型模下冲头', status: '在用', location: '一车间・45号工位', processCount: 45060, manufactureDate: '2022-10-08', responsiblePerson: '吴十' },
  { id: '190013', department: '一车间爪极', itemNo: '60019301202010', itemName: '3314精锻精锻上模', spec: 'A2723314', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・46号工位', processCount: 11040, manufactureDate: '2024-03-22', responsiblePerson: '张三' },
  { id: '190012', department: '一车间爪极', itemNo: '60019301202020', itemName: '3314精锻精锻下模', spec: 'A2723314', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・46号工位', processCount: 11040, manufactureDate: '2024-03-22', responsiblePerson: '张三' },
  { id: '190006', department: '一车间爪极', itemNo: '60019301603010', itemName: '3314热切边热切边凹模', spec: 'A2723314', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・47号工位', processCount: 11040, manufactureDate: '2024-03-22', responsiblePerson: '李四' },
  { id: '190001', department: '一车间爪极', itemNo: '60019201603010', itemName: '3313热切边热切边冲头', spec: 'A2723313', type: '热切边冲头', status: '在用', location: '一车间・48号工位', processCount: 11040, manufactureDate: '2024-03-22', responsiblePerson: '王五' },
  { id: '190007', department: '一车间活塞帽', itemNo: '60027912403003', itemName: 'M483成形冲头-M02', spec: 'A011M483', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・49号工位', processCount: 35000, manufactureDate: '2023-08-15', responsiblePerson: '赵六' },
  { id: '190001', department: '一车间卡钳活塞', itemNo: '60004812403090', itemName: '2887压齿固定板', spec: '32332887', type: '压齿固定板', status: '在用', location: '一车间・50号工位', processCount: 4000000, manufactureDate: '2018-05-10', responsiblePerson: '钱七' },
  { id: '190013', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 4500, manufactureDate: '2024-05-20', responsiblePerson: '周九' },
  { id: '190014', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 3200, manufactureDate: '2024-03-15', responsiblePerson: '吴十' },
  { id: '190003', department: '一车间卡钳活塞', itemNo: '60022712402030', itemName: '5463成形凹模', spec: '32355463', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 4700, manufactureDate: '2024-06-05', responsiblePerson: '张三' },
  { id: '190032', department: '一车间卡钳活塞', itemNo: '60022312402030', itemName: 'F724成形凹模', spec: 'A006F724', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 5200, manufactureDate: '2024-04-18', responsiblePerson: '李四' },
  { id: '190018', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 1500, manufactureDate: '2024-02-25', responsiblePerson: '王五' },
  { id: '190002', department: '一车间十字环', itemNo: '60023612001000', itemName: '1201冷切边冲孔成套', spec: '6S3J1201-01', type: '冷切边冲孔成套', status: '在用', location: '一车间・44号工位', processCount: 38500, manufactureDate: '2022-12-08', responsiblePerson: '赵六' },
  { id: '190014', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 4600, manufactureDate: '2024-05-20', responsiblePerson: '钱七' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 5200, manufactureDate: '2024-05-20', responsiblePerson: '钱七' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 3500, manufactureDate: '2024-03-15', responsiblePerson: '孙八' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 2800, manufactureDate: '2024-03-15', responsiblePerson: '孙八' },
  { id: '190064', department: '一车间卡钳活塞', itemNo: '60014912402031', itemName: '4028SO成形凹模', spec: '32324028SO', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 19100, manufactureDate: '2023-09-28', responsiblePerson: '周九' },
  { id: '190010', department: '一车间卡钳活塞', itemNo: '60020412401044', itemName: '3241三工位成形凹模', spec: '32343241', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 15100, manufactureDate: '2023-06-28', responsiblePerson: '吴十' },
  { id: '190126', department: '一车间爪极', itemNo: '60021801201010', itemName: '0891粗锻上模', spec: 'A2710891', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・39号工位', processCount: 13460, manufactureDate: '2024-01-28', responsiblePerson: '张三' },
  { id: '190124', department: '一车间爪极', itemNo: '60021801201010', itemName: '0891粗锻上模', spec: 'A2710891', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・39号工位', processCount: 13220, manufactureDate: '2024-01-28', responsiblePerson: '张三' },
  { id: '190269', department: '一车间爪极', itemNo: '60021801201020', itemName: '0891粗锻下模', spec: 'A2710891', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・39号工位', processCount: 13220, manufactureDate: '2024-01-28', responsiblePerson: '张三' },
  { id: '190112', department: '一车间爪极', itemNo: '60021801202010', itemName: '0891精锻上模', spec: 'A2710891', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 13220, manufactureDate: '2024-01-28', responsiblePerson: '张三' },
  { id: '190294', department: '一车间爪极', itemNo: '60021801202020', itemName: '0891精锻下模', spec: 'A2710891', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 5000, manufactureDate: '2024-06-15', responsiblePerson: '李四' },
  { id: '190308', department: '一车间爪极', itemNo: '60021801202020', itemName: '0891精锻下模', spec: 'A2710891', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 6500, manufactureDate: '2024-06-15', responsiblePerson: '李四' },
  { id: '190304', department: '一车间爪极', itemNo: '60021801202020', itemName: '0891精锻下模', spec: 'A2710891', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・40号工位', processCount: 8500, manufactureDate: '2024-06-15', responsiblePerson: '李四' },
  { id: '190137', department: '一车间爪极', itemNo: '60016101202020', itemName: '2C04精锻下模', spec: 'F000BL2C04', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・42号工位', processCount: 8640, manufactureDate: '2024-04-15', responsiblePerson: '王五' },
  { id: '190026', department: '一车间爪极', itemNo: '60004101201010', itemName: '4852粗锻上模', spec: '2624852', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・51号工位', processCount: 19600, manufactureDate: '2023-10-05', responsiblePerson: '赵六' },
  { id: '190026', department: '一车间爪极', itemNo: '60004101202010', itemName: '4852精锻上模', spec: '2624852', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・52号工位', processCount: 196600, manufactureDate: '2021-06-18', responsiblePerson: '赵六' },
  { id: '190008', department: '一车间爪极', itemNo: '60004101603050', itemName: '4852热切边凹模', spec: '2624852', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・53号工位', processCount: 3200, manufactureDate: '2024-07-25', responsiblePerson: '钱七' },
  { id: '190333', department: '一车间爪极', itemNo: '60000901201010', itemName: '7709粗锻上模', spec: '2717709', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・26号工位', processCount: 11300, manufactureDate: '2024-09-08', responsiblePerson: '孙八' },
  { id: '190026', department: '一车间爪极', itemNo: '60025012006003', itemName: '4606冷切边凹模', spec: 'A2714606', type: '冷切边凹模', category: '易损件', status: '在用', location: '一车间・54号工位', processCount: 27860, manufactureDate: '2022-08-30', responsiblePerson: '周九' },
  { id: '190019', department: '一车间爪极', itemNo: '60026612404003', itemName: '0212挤槽凹模', spec: 'A2730212', type: '挤槽凹模', category: '易损件', status: '在用', location: '一车间・55号工位', processCount: 25880, manufactureDate: '2022-11-15', responsiblePerson: '吴十' },
  { id: '190007', department: '一车间爪极', itemNo: '60034801201002', itemName: '6930粗锻上模', spec: 'A536930', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・56号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '张三' },
  { id: '190010', department: '一车间爪极', itemNo: '60034801201003', itemName: '6930粗锻下模', spec: 'A536930', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・56号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '张三' },
  { id: '190004', department: '一车间爪极', itemNo: '60034801202002', itemName: '6930精锻上模', spec: 'A536930', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・57号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '张三' },
  { id: '190003', department: '一车间爪极', itemNo: '60034801202003', itemName: '6930精锻下模', spec: 'A536930', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・57号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '张三' },
  { id: '190002', department: '一车间爪极', itemNo: '60034801603002', itemName: '6930热切边冲头', spec: 'A536930', type: '热切边冲头', status: '在用', location: '一车间・58号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '李四' },
  { id: '190005', department: '一车间爪极', itemNo: '60034801603003', itemName: '6930热切边凹模', spec: 'A536930', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・58号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '李四' },
  { id: '190597', department: '一车间爪极', itemNo: '60000901201020', itemName: '7709粗锻下模', spec: '2717709', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・27号工位', processCount: 11300, manufactureDate: '2024-08-18', responsiblePerson: '王五' },
  { id: '190528', department: '一车间爪极', itemNo: '60000901202010', itemName: '7709精锻上模', spec: '2717709', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 12000, manufactureDate: '2024-08-18', responsiblePerson: '王五' },
  { id: '190345', department: '一车间爪极', itemNo: '60000901202020', itemName: '7709精锻下模', spec: '2717709', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・28号工位', processCount: 11300, manufactureDate: '2024-09-20', responsiblePerson: '赵六' },
  { id: '190381', department: '一车间爪极', itemNo: '60016101201020', itemName: '2C04粗锻下模', spec: 'F000BL2C04', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・41号工位', processCount: 4500, manufactureDate: '2024-10-12', responsiblePerson: '钱七' },
  { id: '190379', department: '一车间爪极', itemNo: '60016101201020', itemName: '2C04粗锻下模', spec: 'F000BL2C04', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・41号工位', processCount: 6720, manufactureDate: '2024-10-12', responsiblePerson: '钱七' },
  { id: '190127', department: '一车间爪极', itemNo: '60016101202010', itemName: '2C04精锻上模', spec: 'F000BL2C04', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・42号工位', processCount: 4560, manufactureDate: '2024-11-08', responsiblePerson: '孙八' },
  { id: '190043', department: '一车间轴叉', itemNo: '60029101201002', itemName: '1270粗锻上模', spec: '1001270', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・35号工位', processCount: 5500, manufactureDate: '2024-02-10', responsiblePerson: '周九' },
  { id: '190042', department: '一车间轴叉', itemNo: '60029101201003', itemName: '1270粗锻下模', spec: '1001270', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・35号工位', processCount: 5500, manufactureDate: '2024-02-10', responsiblePerson: '周九' },
  { id: '190041', department: '一车间轴叉', itemNo: '60029101202002', itemName: '1270精锻上模', spec: '1001270', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・36号工位', processCount: 5500, manufactureDate: '2024-02-10', responsiblePerson: '周九' },
  { id: '190041', department: '一车间轴叉', itemNo: '60029101202003', itemName: '1270精锻下模', spec: '1001270', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・36号工位', processCount: 5500, manufactureDate: '2024-02-10', responsiblePerson: '周九' },
  { id: '190002', department: '一车间平衡块', itemNo: '60057301201010', itemName: 'P04A粗锻上模', spec: '5321191P04A', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 800, manufactureDate: '2024-09-12', responsiblePerson: '吴十' },
  { id: '190004', department: '一车间平衡块', itemNo: '60057301201020', itemName: 'P04A粗锻下模', spec: '5321191P04A', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 2700, manufactureDate: '2024-09-12', responsiblePerson: '吴十' },
  { id: '190018', department: '一车间平衡块', itemNo: '60057301202010', itemName: 'P04A精锻精锻上模', spec: '5321191P04A', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 270, manufactureDate: '2025-01-15', responsiblePerson: '吴十' },
  { id: '190006', department: '一车间平衡块', itemNo: '60057301202020', itemName: 'P04A精锻精锻下模', spec: '5321191P04A', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 2700, manufactureDate: '2024-09-12', responsiblePerson: '张三' },
  { id: '190005', department: '一车间平衡块', itemNo: '60057301603040', itemName: 'P04A热切边热切边上模芯', spec: '5321191P04A', type: '热切边上模芯', status: '在用', location: '一车间・38号工位', processCount: 2700, manufactureDate: '2024-09-12', responsiblePerson: '张三' },
  { id: '190010', department: '一车间平衡块', itemNo: '60057301603050', itemName: 'P04A热切边热切边凹模', spec: '5321191P04A', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・38号工位', processCount: 2700, manufactureDate: '2024-09-12', responsiblePerson: '张三' },
  { id: '190035', department: '一车间卡钳活塞', itemNo: '60005012402030', itemName: '7383成形凹模', spec: '32337383', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 3600, manufactureDate: '2024-06-28', responsiblePerson: '李四' },
  { id: '190023', department: '一车间卡钳活塞', itemNo: '60017112402030', itemName: '5582成形凹模', spec: 'A5582-12200', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 3300, manufactureDate: '2024-07-18', responsiblePerson: '王五' },
  { id: '190007', department: '一车间卡钳活塞', itemNo: '60022012402030', itemName: '6969成形凹模', spec: '32336969', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 660, manufactureDate: '2025-03-10', responsiblePerson: '赵六' },
  { id: '190010', department: '一车间卡钳活塞', itemNo: '60033512402003', itemName: 'B832成形冲头', spec: 'A007B832', type: '成形冲头', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 139500, manufactureDate: '2019-12-05', responsiblePerson: '钱七' },
  { id: '190001', department: '一车间电机轴', itemNo: '60037201201001', itemName: '1386X楔横轧模具成套', spec: 'DKBA8.013.1386', type: '楔横轧模具', status: '在用', location: '一车间・59号工位', processCount: 8988, manufactureDate: '2023-08-12', responsiblePerson: '孙八' },
  { id: '190001', department: '一车间电机轴', itemNo: '60037201201008', itemName: '1386X楔横轧挡板1', spec: 'DKBA8.013.1386', type: '楔横轧挡板', status: '在用', location: '一车间・59号工位', processCount: 8988, manufactureDate: '2023-08-12', responsiblePerson: '孙八' },
  { id: '190001', department: '一车间电机轴', itemNo: '60037201201009', itemName: '1386X楔横轧挡板2', spec: 'DKBA8.013.1386', type: '楔横轧挡板', status: '在用', location: '一车间・59号工位', processCount: 8988, manufactureDate: '2023-08-12', responsiblePerson: '孙八' },
  { id: '190003', department: '一车间电机轴', itemNo: '60037201202004', itemName: '1386X校直模成套', spec: 'DKBA8.013.1386', type: '校直模', status: '在用', location: '一车间・60号工位', processCount: 8988, manufactureDate: '2023-08-12', responsiblePerson: '周九' },
  { id: '190002', department: '一车间电机轴', itemNo: '60037101201001', itemName: '1191楔横轧模具成套', spec: 'DKBA8.013.1191', type: '楔横轧模具', status: '在用', location: '一车间・61号工位', processCount: 8998, manufactureDate: '2023-08-12', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间电机轴', itemNo: '60037101201008', itemName: '1191楔横轧挡板1', spec: 'DKBA8.013.1191', type: '楔横轧挡板', status: '在用', location: '一车间・61号工位', processCount: 8998, manufactureDate: '2023-08-12', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间电机轴', itemNo: '60037101201009', itemName: '1191楔横轧挡板2', spec: 'DKBA8.013.1191', type: '楔横轧挡板', status: '在用', location: '一车间・61号工位', processCount: 8998, manufactureDate: '2023-08-12', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间电机轴', itemNo: '60037101202004', itemName: '1191校直模成套', spec: 'DKBA8.013.1191', type: '校直模', status: '在用', location: '一车间・62号工位', processCount: 8998, manufactureDate: '2023-08-12', responsiblePerson: '张三' },
  { id: '190014', department: '一车间磁极', itemNo: '60010212408002', itemName: '4437自动化成形凹模', spec: 'A1214437', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・25号工位', processCount: 79000, manufactureDate: '2022-04-20', responsiblePerson: '李四' },
  { id: '190617', department: '一车间动铁芯', itemNo: '60008412402130', itemName: '695反挤冲头', spec: 'GD326695-2', type: '反挤冲头', status: '在用', location: '一车间・20号工位', processCount: 12400, manufactureDate: '2024-05-10', responsiblePerson: '王五' },
  { id: '190037', department: '一车间卡钳活塞', itemNo: '60017112402030', itemName: '5582成形凹模', spec: 'A5582-12200', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 3500, manufactureDate: '2024-07-18', responsiblePerson: '赵六' },
  { id: '190043', department: '一车间卡钳活塞', itemNo: '60012812402030', itemName: '4919成形凹模', spec: '32334919', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 9400, manufactureDate: '2024-06-05', responsiblePerson: '钱七' },
  { id: '190030', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 930, manufactureDate: '2024-10-20', responsiblePerson: '孙八' },
  { id: '190009', department: '一车间锁环', itemNo: '60025812401014', itemName: '5151整形凹模', spec: '7046.035.151', type: '整形凹模', category: '易损件', status: '在用', location: '一车间・63号工位', processCount: 19840, manufactureDate: '2023-07-08', responsiblePerson: '周九' },
  { id: '190028', department: '一车间爪极', itemNo: '60026901201003', itemName: '2676粗锻下模', spec: 'F00M632676', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・64号工位', processCount: 13800, manufactureDate: '2024-02-15', responsiblePerson: '吴十' },
  { id: '190007', department: '一车间爪极', itemNo: '60034701201002', itemName: '6904粗锻上模', spec: 'A536904', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・65号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '张三' },
  { id: '190025', department: '一车间爪极', itemNo: '60004301201020', itemName: '2529粗锻下模', spec: '2712529', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・66号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '李四' },
  { id: '190005', department: '一车间爪极', itemNo: '60034701202002', itemName: '6904精锻上模', spec: 'A536904', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・67号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '王五' },
  { id: '190003', department: '一车间爪极', itemNo: '60034701202003', itemName: '6904精锻下模', spec: 'A536904', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・67号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '王五' },
  { id: '190003', department: '一车间爪极', itemNo: '60034701603002', itemName: '6904热切边冲头', spec: 'A536904', type: '热切边冲头', status: '在用', location: '一车间・68号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '赵六' },
  { id: '190007', department: '一车间爪极', itemNo: '60034701603003', itemName: '6904热切边凹模', spec: 'A536904', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・68号工位', processCount: 6000, manufactureDate: '2024-05-22', responsiblePerson: '赵六' },
  { id: '190038', department: '一车间爪极', itemNo: '60026601201002', itemName: '0212粗锻上模', spec: 'A2730212', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・03号工位', processCount: 13200, manufactureDate: '2024-04-18', responsiblePerson: '钱七' },
  { id: '190067', department: '一车间爪极', itemNo: '60026601201003', itemName: '0212粗锻下模', spec: 'A2730212', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・04号工位', processCount: 6960, manufactureDate: '2024-08-15', responsiblePerson: '孙八' },
  { id: '190033', department: '一车间爪极', itemNo: '60026601202002', itemName: '0212精锻上模', spec: 'A2730212', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 13200, manufactureDate: '2024-06-22', responsiblePerson: '周九' },
  { id: '190059', department: '一车间爪极', itemNo: '60026601202003', itemName: '0212精锻下模', spec: 'A2730212', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・05号工位', processCount: 13200, manufactureDate: '2024-06-22', responsiblePerson: '周九' },
  { id: '190003', department: '一车间爪极', itemNo: '60026612404002', itemName: '0212挤槽冲头', spec: 'A2730212', type: '挤槽冲头', status: '在用', location: '一车间・69号工位', processCount: 38100, manufactureDate: '2022-10-25', responsiblePerson: '吴十' },
  { id: '190032', department: '一车间爪极', itemNo: '60026601201002', itemName: '0212粗锻上模', spec: 'A2730212', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・03号工位', processCount: 12960, manufactureDate: '2024-04-18', responsiblePerson: '张三' },
  { id: '190066', department: '一车间爪极', itemNo: '60026601201003', itemName: '0212粗锻下模', spec: 'A2730212', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・04号工位', processCount: 13200, manufactureDate: '2024-04-18', responsiblePerson: '张三' },
  { id: '190010', department: '一车间爪极', itemNo: '60019201201010', itemName: '3313粗锻上模', spec: 'A2723313', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・70号工位', processCount: 12100, manufactureDate: '2024-03-22', responsiblePerson: '李四' },
  { id: '190023', department: '一车间爪极', itemNo: '60019201201020', itemName: '3313粗锻下模', spec: 'A2723313', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・70号工位', processCount: 4600, manufactureDate: '2024-03-22', responsiblePerson: '李四' },
  { id: '190011', department: '一车间爪极', itemNo: '60019201202010', itemName: '3313精锻精锻上模', spec: 'A2723313', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・71号工位', processCount: 12100, manufactureDate: '2024-03-22', responsiblePerson: '王五' },
  { id: '190012', department: '一车间爪极', itemNo: '60019201202020', itemName: '3313精锻精锻下模', spec: 'A2723313', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・71号工位', processCount: 4600, manufactureDate: '2024-03-22', responsiblePerson: '王五' },
  { id: '190004', department: '一车间爪极', itemNo: '60019201603020', itemName: '3313热切边热切边凹模', spec: 'A2723313', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・72号工位', processCount: 12500, manufactureDate: '2024-03-22', responsiblePerson: '赵六' },
  { id: '190011', department: '一车间爪极', itemNo: '60019201202020', itemName: '3313精锻精锻下模', spec: 'A2723313', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・71号工位', processCount: 8600, manufactureDate: '2024-03-22', responsiblePerson: '赵六' },
  { id: '190344', department: '一车间爪极', itemNo: '60016001201020', itemName: '2C03粗锻下模', spec: 'F000BL2C03', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・73号工位', processCount: 5520, manufactureDate: '2024-04-15', responsiblePerson: '钱七' },
  { id: '190134', department: '一车间爪极', itemNo: '60016001202010', itemName: '2C03精锻上模', spec: 'F000BL2C03', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・74号工位', processCount: 10560, manufactureDate: '2024-04-15', responsiblePerson: '孙八' },
  { id: '190009', department: '一车间爪极', itemNo: '60026612006003', itemName: '0212冷切边凹模', spec: 'A2730212', type: '冷切边凹模', category: '易损件', status: '在用', location: '一车间・75号工位', processCount: 55775, manufactureDate: '2021-11-30', responsiblePerson: '周九' },
  { id: '190002', department: '一车间爪极', itemNo: '60026612006003', itemName: '0212冷切边凹模', spec: 'A2730212', type: '冷切边凹模', category: '易损件', status: '在库', location: '模具仓・A区', processCount: 150, manufactureDate: '2026-06-15', responsiblePerson: '周九' },
  { id: '190021', department: '一车间爪极', itemNo: '60019201201020', itemName: '3313粗锻下模', spec: 'A2723313', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・70号工位', processCount: 8600, manufactureDate: '2024-03-22', responsiblePerson: '吴十' },
  { id: '190037', department: '一车间轴叉', itemNo: '60029101603004', itemName: '1270热切边凹模', spec: '1001270', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・37号工位', processCount: 4000, manufactureDate: '2024-04-22', responsiblePerson: '张三' },
  { id: '190034', department: '一车间轴叉', itemNo: '60029101603004', itemName: '1270热切边凹模', spec: '1001270', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・37号工位', processCount: 4000, manufactureDate: '2024-04-22', responsiblePerson: '张三' },
  { id: '190120', department: '一车间轴叉', itemNo: '60028101202002', itemName: '2250精锻上模', spec: '2002250', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・76号工位', processCount: 900, manufactureDate: '2024-11-05', responsiblePerson: '李四' },
  { id: '190081', department: '一车间轴叉', itemNo: '60028101202003', itemName: '2250精锻下模', spec: '2002250', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・76号工位', processCount: 1500, manufactureDate: '2024-11-05', responsiblePerson: '李四' },
  { id: '190004', department: '一车间静铁芯', itemNo: '60013512202000', itemName: '309冲孔成套', spec: 'A1199309', type: '冲孔成套', category: '通用件', status: '在用', location: '一车间・77号工位', processCount: 300, manufactureDate: '2025-02-18', responsiblePerson: '王五' },
  { id: '190012', department: '一车间静铁芯', itemNo: '60013512202000', itemName: '309冲孔成套', spec: 'A1199309', type: '冲孔成套', category: '通用件', status: '在用', location: '一车间・77号工位', processCount: 20400, manufactureDate: '2023-10-22', responsiblePerson: '王五' },
  { id: '190016', department: '一车间静铁芯', itemNo: '60013512202000', itemName: '309冲孔成套', spec: 'A1199309', type: '冲孔成套', category: '通用件', status: '在用', location: '一车间・77号工位', processCount: 1500, manufactureDate: '2024-08-10', responsiblePerson: '王五' },
  { id: '190013', department: '一车间静铁芯', itemNo: '60008912103000', itemName: '274切边切槽成套', spec: 'A1202274', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・78号工位', processCount: 3, manufactureDate: '2025-05-28', responsiblePerson: '赵六' },
  { id: '190008', department: '一车间静铁芯', itemNo: '60008912103000', itemName: '274切边切槽成套', spec: 'A1202274', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・78号工位', processCount: 100, manufactureDate: '2025-04-15', responsiblePerson: '赵六' },
  { id: '190001', department: '一车间静铁芯', itemNo: '60008912103000', itemName: '274切边切槽成套', spec: 'A1202274', type: '切边切槽成套', category: '通用件', status: '在用', location: '一车间・78号工位', processCount: 2, manufactureDate: '2025-06-01', responsiblePerson: '赵六' },
  { id: '190096', department: '一车间卡钳活塞', itemNo: '60004712402030', itemName: '7686SO成形凹模', spec: '32327686SO', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・15号工位', processCount: 3200, manufactureDate: '2024-11-28', responsiblePerson: '钱七' },
  { id: '190033', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 5400, manufactureDate: '2024-02-25', responsiblePerson: '孙八' },
  { id: '190015', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 19200, manufactureDate: '2023-12-18', responsiblePerson: '周九' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60020412401044', itemName: '3241三工位成形凹模', spec: '32343241', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 28000, manufactureDate: '2023-06-28', responsiblePerson: '吴十' },
  { id: '190001', department: '一车间开关壳', itemNo: '60007812203000', itemName: '817B冲孔成套', spec: '199817B', type: '冲孔成套', category: '通用件', status: '在用', location: '一车间・79号工位', processCount: 57100, manufactureDate: '2021-09-12', responsiblePerson: '张三' },
  { id: '190002', department: '一车间开关壳', itemNo: '60008312402005', itemName: '562反挤凹模', spec: 'GD222562-1', type: '反挤凹模', status: '在用', location: '一车间・80号工位', processCount: 337000, manufactureDate: '2018-03-28', responsiblePerson: '李四' },
  { id: '190629', department: '一车间动铁芯', itemNo: '60008412402130', itemName: '695反挤冲头', spec: 'GD326695-2', type: '反挤冲头', status: '在用', location: '一车间・20号工位', processCount: 1500, manufactureDate: '2025-03-15', responsiblePerson: '王五' },
  { id: '190029', department: '一车间卡钳活塞', itemNo: '60022312402030', itemName: 'F724成形凹模', spec: 'A006F724', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 4000, manufactureDate: '2024-04-18', responsiblePerson: '赵六' },
  { id: '190021', department: '一车间卡钳活塞', itemNo: '60022312402030', itemName: 'F724成形凹模', spec: 'A006F724', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 5100, manufactureDate: '2024-04-18', responsiblePerson: '赵六' },
  { id: '190032', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 10380, manufactureDate: '2024-02-25', responsiblePerson: '钱七' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60022712402030', itemName: '5463成形凹模', spec: '32355463', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 1640, manufactureDate: '2024-09-10', responsiblePerson: '孙八' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60022712402030', itemName: '5463成形凹模', spec: '32355463', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 2200, manufactureDate: '2024-09-10', responsiblePerson: '孙八' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 6600, manufactureDate: '2024-05-20', responsiblePerson: '周九' },
  { id: '190585', department: '一车间动铁芯', itemNo: '60008412402130', itemName: '695反挤冲头', spec: 'GD326695-2', type: '反挤冲头', status: '在用', location: '一车间・20号工位', processCount: 1500, manufactureDate: '2025-03-15', responsiblePerson: '吴十' },
  { id: '190570', department: '一车间动铁芯', itemNo: '60008412402130', itemName: '695反挤冲头', spec: 'GD326695-2', type: '反挤冲头', status: '在用', location: '一车间・20号工位', processCount: 1500, manufactureDate: '2025-03-15', responsiblePerson: '张三' },
  { id: '190028', department: '一车间卡钳活塞', itemNo: '60022312402030', itemName: 'F724成形凹模', spec: 'A006F724', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 2400, manufactureDate: '2024-04-18', responsiblePerson: '李四' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 2600, manufactureDate: '2024-03-15', responsiblePerson: '王五' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60022712402030', itemName: '5463成形凹模', spec: '32355463', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・10号工位', processCount: 3000, manufactureDate: '2024-09-10', responsiblePerson: '赵六' },
  { id: '190023', department: '一车间爪极', itemNo: '60035101201002', itemName: '2772粗锻上模', spec: 'A842772', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・81号工位', processCount: 8700, manufactureDate: '2024-02-20', responsiblePerson: '钱七' },
  { id: '190045', department: '一车间爪极', itemNo: '60035101201003', itemName: '2772粗锻下模', spec: 'A842772', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・81号工位', processCount: 13700, manufactureDate: '2024-02-20', responsiblePerson: '钱七' },
  { id: '190034', department: '一车间爪极', itemNo: '60035101202003', itemName: '2772精锻下模', spec: 'A842772', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・82号工位', processCount: 13700, manufactureDate: '2024-02-20', responsiblePerson: '孙八' },
  { id: '190018', department: '一车间爪极', itemNo: '60035101201002', itemName: '2772粗锻上模', spec: 'A842772', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・81号工位', processCount: 11000, manufactureDate: '2024-02-20', responsiblePerson: '孙八' },
  { id: '190091', department: '一车间爪极', itemNo: '60016001201010', itemName: '2C03粗锻上模', spec: 'F000BL2C03', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・83号工位', processCount: 15600, manufactureDate: '2023-11-08', responsiblePerson: '周九' },
  { id: '190336', department: '一车间爪极', itemNo: '60016001201020', itemName: '2C03粗锻下模', spec: 'F000BL2C03', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・83号工位', processCount: 8640, manufactureDate: '2024-04-15', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间爪极', itemNo: '60016001607002', itemName: '2C03热切边凹模（四工位）', spec: 'F000BL2C03', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・84号工位', processCount: 36860, manufactureDate: '2022-06-12', responsiblePerson: '张三' },
  { id: '190007', department: '一车间爪极', itemNo: '60019212405020', itemName: '3313挤槽挤槽凹模', spec: 'A2723313', type: '挤槽凹模', category: '易损件', status: '在用', location: '一车间・85号工位', processCount: 31740, manufactureDate: '2022-10-18', responsiblePerson: '李四' },
  { id: '190071', department: '一车间爪极', itemNo: '60020001201010', itemName: '616粗锻上模', spec: 'F00M632616', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・86号工位', processCount: 8400, manufactureDate: '2024-03-05', responsiblePerson: '王五' },
  { id: '190148', department: '一车间爪极', itemNo: '60020001201020', itemName: '616粗锻下模', spec: 'F00M632616', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・86号工位', processCount: 8400, manufactureDate: '2024-03-05', responsiblePerson: '王五' },
  { id: '190118', department: '一车间爪极', itemNo: '60020001202010', itemName: '616精锻上模', spec: 'F00M632616', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・87号工位', processCount: 3600, manufactureDate: '2024-08-12', responsiblePerson: '赵六' },
  { id: '190096', department: '一车间爪极', itemNo: '60020001202020', itemName: '616精锻下模', spec: 'F00M632616', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・87号工位', processCount: 4800, manufactureDate: '2024-03-05', responsiblePerson: '赵六' },
  { id: '190112', department: '一车间爪极', itemNo: '60020001202010', itemName: '616精锻上模', spec: 'F00M632616', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・87号工位', processCount: 4800, manufactureDate: '2024-03-05', responsiblePerson: '赵六' },
  { id: '190014', department: '一车间爪极', itemNo: '60035101202002', itemName: '2772精锻上模', spec: 'A842772', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・82号工位', processCount: 19700, manufactureDate: '2024-02-20', responsiblePerson: '钱七' },
  { id: '190001', department: '一车间爪极', itemNo: '60034812404002', itemName: '6930挤槽冲头', spec: 'A536930', type: '挤槽冲头', status: '在用', location: '一车间・88号工位', processCount: 5623, manufactureDate: '2024-01-08', responsiblePerson: '孙八' },
  { id: '190007', department: '一车间爪极', itemNo: '60034812404003', itemName: '6930挤槽凹模', spec: 'A536930', type: '挤槽凹模', category: '易损件', status: '在用', location: '一车间・88号工位', processCount: 5623, manufactureDate: '2024-01-08', responsiblePerson: '孙八' },
  { id: '190037', department: '一车间爪极', itemNo: '60004112404030', itemName: '4852挤槽凹模', spec: '2624852', type: '挤槽凹模', category: '易损件', status: '在用', location: '一车间・89号工位', processCount: 10230, manufactureDate: '2023-12-15', responsiblePerson: '周九' },
  { id: '190011', department: '一车间爪极', itemNo: '60019212405010', itemName: '3313挤槽挤槽冲头', spec: 'A2723313', type: '挤槽冲头', status: '在用', location: '一车间・85号工位', processCount: 31740, manufactureDate: '2022-10-18', responsiblePerson: '吴十' },
  { id: '190020', department: '一车间爪极', itemNo: '60026901201002', itemName: '2676粗锻上模', spec: 'F00M632676', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・90号工位', processCount: 25500, manufactureDate: '2023-07-22', responsiblePerson: '张三' },
  { id: '190029', department: '一车间爪极', itemNo: '60026901201003', itemName: '2676粗锻下模', spec: 'F00M632676', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・90号工位', processCount: 11200, manufactureDate: '2024-02-15', responsiblePerson: '张三' },
  { id: '190023', department: '一车间爪极', itemNo: '60026901201007', itemName: '2676精锻上模', spec: 'F00M632676', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・91号工位', processCount: 15000, manufactureDate: '2024-02-15', responsiblePerson: '李四' },
  { id: '190027', department: '一车间爪极', itemNo: '60026901201008', itemName: '2676精锻下模', spec: 'F00M632676', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・91号工位', processCount: 18200, manufactureDate: '2024-02-15', responsiblePerson: '李四' },
  { id: '190002', department: '一车间爪极', itemNo: '60019201603020', itemName: '3313热切边热切边凹模', spec: 'A2723313', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・72号工位', processCount: 2600, manufactureDate: '2024-12-05', responsiblePerson: '王五' },
  { id: '190001', department: '一车间爪极', itemNo: '60019312006010', itemName: '3314冷切边冷切边凹模', spec: 'A2723314', type: '冷切边凹模', category: '易损件', status: '在用', location: '一车间・92号工位', processCount: 23600, manufactureDate: '2022-08-30', responsiblePerson: '赵六' },
  { id: '190012', department: '一车间爪极', itemNo: '60021912006020', itemName: '0893冷切边凹模', spec: 'A2710893', type: '冷切边凹模', category: '易损件', status: '在用', location: '一车间・93号工位', processCount: 593895, manufactureDate: '2017-05-12', responsiblePerson: '钱七' },
  { id: '190160', department: '一车间爪极', itemNo: '60003201603040', itemName: '2466热切边凹模', spec: '2712466', type: '热切边凹模', category: '易损件', status: '在用', location: '一车间・94号工位', processCount: 15200, manufactureDate: '2024-05-18', responsiblePerson: '孙八' },
  { id: '190041', department: '一车间爪极', itemNo: '60026701201002', itemName: '0213粗锻上模', spec: 'A2730213', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・95号工位', processCount: 10800, manufactureDate: '2024-03-20', responsiblePerson: '周九' },
  { id: '190046', department: '一车间爪极', itemNo: '60026701202002', itemName: '0213精锻上模', spec: 'A2730213', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・96号工位', processCount: 10800, manufactureDate: '2024-03-20', responsiblePerson: '周九' },
  { id: '190081', department: '一车间爪极', itemNo: '60026701202003', itemName: '0213精锻下模', spec: 'A2730213', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・96号工位', processCount: 10800, manufactureDate: '2024-03-20', responsiblePerson: '周九' },
  { id: '190346', department: '一车间爪极', itemNo: '60016001201020', itemName: '2C03粗锻下模', spec: 'F000BL2C03', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・73号工位', processCount: 3600, manufactureDate: '2024-10-25', responsiblePerson: '吴十' },
  { id: '190131', department: '一车间爪极', itemNo: '60016001202010', itemName: '2C03精锻上模', spec: 'F000BL2C03', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・74号工位', processCount: 9120, manufactureDate: '2024-04-15', responsiblePerson: '张三' },
  { id: '190138', department: '一车间爪极', itemNo: '60016001202020', itemName: '2C03精锻下模', spec: 'F000BL2C03', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・74号工位', processCount: 12160, manufactureDate: '2024-04-15', responsiblePerson: '张三' },
  { id: '190112', department: '一车间爪极', itemNo: '60023301201020', itemName: '11WT粗锻下模', spec: 'F000BL11WT', type: '粗锻下模', category: '易损件', status: '在用', location: '一车间・13号工位', processCount: 11400, manufactureDate: '2024-01-18', responsiblePerson: '李四' },
  { id: '190062', department: '一车间爪极', itemNo: '60023301202020', itemName: '11WT精锻下模', spec: 'F000BL11WT', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 14600, manufactureDate: '2023-12-05', responsiblePerson: '李四' },
  { id: '190085', department: '一车间轴叉', itemNo: '60028101201002', itemName: '2250粗锻上模', spec: '2002250', type: '粗锻上模', category: '易损件', status: '在用', location: '一车间・97号工位', processCount: 7000, manufactureDate: '2024-01-10', responsiblePerson: '王五' },
  { id: '190119', department: '一车间轴叉', itemNo: '60028101202002', itemName: '2250精锻上模', spec: '2002250', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・98号工位', processCount: 2500, manufactureDate: '2024-11-05', responsiblePerson: '王五' },
  { id: '190080', department: '一车间轴叉', itemNo: '60028101202003', itemName: '2250精锻下模', spec: '2002250', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・98号工位', processCount: 7500, manufactureDate: '2024-01-10', responsiblePerson: '赵六' },
  { id: '190059', department: '一车间轴叉', itemNo: '60028101603005', itemName: '2250切边凹模', spec: '2002250', type: '切边凹模', status: '在用', location: '一车间・99号工位', processCount: 5000, manufactureDate: '2024-01-10', responsiblePerson: '赵六' },
  { id: '190117', department: '一车间轴叉', itemNo: '60028101202002', itemName: '2250精锻上模', spec: '2002250', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・98号工位', processCount: 2500, manufactureDate: '2024-11-05', responsiblePerson: '钱七' },
  { id: '190113', department: '一车间轴叉', itemNo: '60028101202002', itemName: '2250精锻上模', spec: '2002250', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・98号工位', processCount: 3000, manufactureDate: '2024-11-05', responsiblePerson: '钱七' },
  { id: '190097', department: '一车间爪极', itemNo: '60023301202010', itemName: '11WT精锻上模', spec: 'F000BL11WT', type: '精锻上模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 10800, manufactureDate: '2024-06-10', responsiblePerson: '孙八' },
  { id: '190018', department: '一车间卡钳活塞', itemNo: '60016312402030', itemName: 'Y310成形凹模', spec: 'A004Y310', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 1800, manufactureDate: '2024-10-20', responsiblePerson: '周九' },
  { id: '190018', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 6000, manufactureDate: '2024-03-15', responsiblePerson: '吴十' },
  { id: '190002', department: '一车间十字环', itemNo: '60023612001000', itemName: '1201冷切边冲孔成套', spec: '6S3J1201-01', type: '冷切边冲孔成套', status: '在用', location: '一车间・44号工位', processCount: 38500, manufactureDate: '2022-12-08', responsiblePerson: '张三' },
  { id: '190014', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 4600, manufactureDate: '2024-05-20', responsiblePerson: '李四' },
  { id: '190008', department: '一车间卡钳活塞', itemNo: '60033512402005', itemName: 'B832成形凹模', spec: 'A007B832', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・11号工位', processCount: 5200, manufactureDate: '2024-05-20', responsiblePerson: '李四' },
  { id: '190012', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 3500, manufactureDate: '2024-03-15', responsiblePerson: '王五' },
  { id: '190004', department: '一车间卡钳活塞', itemNo: '60022212402005', itemName: 'Y587成形凹模', spec: 'A004Y587', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・08号工位', processCount: 2800, manufactureDate: '2024-03-15', responsiblePerson: '王五' },
  { id: '190064', department: '一车间卡钳活塞', itemNo: '60014912402031', itemName: '4028SO成形凹模', spec: '32324028SO', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・12号工位', processCount: 19100, manufactureDate: '2023-09-28', responsiblePerson: '赵六' },
  { id: '190010', department: '一车间卡钳活塞', itemNo: '60020412401044', itemName: '3241三工位成形凹模', spec: '32343241', type: '成形凹模', category: '易损件', status: '在用', location: '一车间・09号工位', processCount: 15100, manufactureDate: '2023-06-28', responsiblePerson: '钱七' },
  { id: '190048', department: '一车间爪极', itemNo: '60023301202020', itemName: '11WT精锻下模', spec: 'F000BL11WT', type: '精锻下模', category: '易损件', status: '在用', location: '一车间・14号工位', processCount: 22600, manufactureDate: '2023-12-05', responsiblePerson: '孙八' },
]

// enable | disable | scrap
type ToolState = 'enable' | 'disable' | 'scrap'

export default function ToolsPage() {
  const [searchId, setSearchId] = useState('')
  const [searchName, setSearchName] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [toolStates, setToolStates] = useState<Record<string, ToolState>>({
    T006: 'scrap',
  })
  const [scrapConfirm, setScrapConfirm] = useState<string | null>(null)

  const filtered = INITIAL_TOOLS.filter(
    (m) =>
      (!searchId || m.id.toLowerCase().includes(searchId.toLowerCase())) &&
      (!searchName || m.itemName.includes(searchName)) &&
      (!categoryFilter || m.category === categoryFilter)
  )

  // KPI统计（根据筛选结果动态计算）
  const totalTools = filtered.length
  const newToolsThisMonth = filtered.filter(t => t.manufactureDate.startsWith('2026-06')).length
  const scrappedToolsThisMonth = filtered.filter(t => t.status === '报废').length
  const typeCount = new Set(filtered.map(t => t.type)).size

  const getToolState = (id: string): ToolState => toolStates[id] ?? 'enable'

  const allChecked = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleAll = () => setSelectedIds(allChecked ? [] : filtered.map((m) => m.id))
  const toggleOne = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))

  const handleToggleEnable = (id: string) => {
    setToolStates((prev) => {
      const cur = prev[id] ?? 'enable'
      if (cur === 'scrap') return prev
      return { ...prev, [id]: cur === 'enable' ? 'disable' : 'enable' }
    })
  }

  const handleScrapConfirm = (id: string) => {
    setToolStates((prev) => ({ ...prev, [id]: 'scrap' }))
    setScrapConfirm(null)
  }

  const stateLabel = (s: ToolState) => {
    if (s === 'disable') return { label: '已停用', cls: 'bg-orange-100 text-orange-600 border-orange-200' }
    if (s === 'scrap') return { label: '已报废', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
    return { label: '已启用', cls: 'bg-green-100 text-green-600 border-green-200' }
  }

  const getStatusStyle = (status: string) => {
    return STATUS_LABEL_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
  }

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Main area */}
        <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4" style={{ borderLeftWidth: 3, borderLeftColor: '#1e5fa8' }}>
              <p className="text-[12px] text-gray-500 mb-1">模具总数</p>
              <div className="flex items-end gap-1">
                <span className="text-[26px] font-bold leading-none text-[#1e5fa8]">{totalTools}</span>
                <span className="text-[12px] text-gray-400 mb-0.5">套</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4" style={{ borderLeftWidth: 3, borderLeftColor: '#16a34a' }}>
              <p className="text-[12px] text-gray-500 mb-1">本月新增模具</p>
              <div className="flex items-end gap-1">
                <span className="text-[26px] font-bold leading-none text-[#16a34a]">{newToolsThisMonth}</span>
                <span className="text-[12px] text-gray-400 mb-0.5">套</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4" style={{ borderLeftWidth: 3, borderLeftColor: '#dc2626' }}>
              <p className="text-[12px] text-gray-500 mb-1">本月报废模具</p>
              <div className="flex items-end gap-1">
                <span className="text-[26px] font-bold leading-none text-[#dc2626]">{scrappedToolsThisMonth}</span>
                <span className="text-[12px] text-gray-400 mb-0.5">套</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4" style={{ borderLeftWidth: 3, borderLeftColor: '#1e5fa8' }}>
              <p className="text-[12px] text-gray-500 mb-1">模具型号种类</p>
              <div className="flex items-end gap-1">
                <span className="text-[26px] font-bold leading-none text-[#1e5fa8]">{typeCount}</span>
                <span className="text-[12px] text-gray-400 mb-0.5">种</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded border border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap">
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {filtered.length}
            </span>
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="模具编号"
              className="border border-gray-300 rounded px-2.5 py-1 text-sm w-32 focus:outline-none focus:border-blue-400"
            />
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="模具名称"
              className="border border-gray-300 rounded px-2.5 py-1 text-sm w-32 focus:outline-none focus:border-blue-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-2.5 py-1 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">模具分类</option>
              <option value="通用件">通用件</option>
              <option value="易损件">易损件</option>
              <option value="标准件">标准件</option>
              <option value="技术开发类">技术开发类</option>
            </select>
            <button className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <Filter size={12} /> 综合过滤
            </button>
            <button
              onClick={() => { setSearchId(''); setSearchName(''); setCategoryFilter('') }}
              className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              <RotateCcw size={12} /> 重置
            </button>
            <button className="flex items-center gap-1 text-[13px] text-gray-600 px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <Save size={12} /> 保存
            </button>
            <div className="flex-1" />
            {[
              { icon: <Trash2 size={14} />, tip: '删除' },
              { icon: <MinusCircle size={14} />, tip: '停用' },
              { icon: <Download size={14} />, tip: '导出' },
              { icon: <Upload size={14} />, tip: '导入' },
              { icon: <Settings2 size={14} />, tip: '设置列' },
            ].map(({ icon, tip }) => (
              <button key={tip} title={tip} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                {icon}
              </button>
            ))}
            <Link href="/molds/new" className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white" title="新增模具">
              <Plus size={15} />
            </Link>
          </div>

          {/* Table */}
          <div className="bg-white rounded border border-gray-200 flex-1 overflow-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="border-b border-gray-200">
                <tr className="bg-gray-50">
                  <th className="w-10 px-3 py-2.5 text-left">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                  </th>
                  {['编号', '部门', '品号', '品名', '规格', '类型', '模具分类', '状态', '当前位置', '加工次数', '制造日期', '责任人', '操作'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-gray-600 font-medium text-[13px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const ts = getToolState(t.id)
                  const { label, cls } = stateLabel(ts)
                  const isScrapped = ts === 'scrap' || t.status === '报废'
                  const statusStyle = getStatusStyle(t.status)
                  return (
                    <tr key={`${t.id}-${idx}`} className={`border-b border-gray-100 transition-colors ${isScrapped ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleOne(t.id)} disabled={isScrapped} />
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/molds/${t.id}`}
                          className="text-blue-600 hover:underline text-[13px]"
                        >
                          {t.id}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.department}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.itemNo}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.itemName}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.spec}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.type}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${CATEGORY_COLORS[t.category]?.bg || 'bg-gray-100'} ${CATEGORY_COLORS[t.category]?.text || 'text-gray-600'}`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.location}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.processCount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.manufactureDate}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-[13px]">{t.responsiblePerson}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {/* 查看 */}
                          <Link
                            href={`/molds/${t.id}`}
                            className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors whitespace-nowrap"
                          >
                            <Eye size={11} /> 查看
                          </Link>
                          {/* 编辑 */}
                          {!isScrapped ? (
                            <Link
                              href={`/molds/${t.id}/edit`}
                              className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors whitespace-nowrap"
                            >
                              <Pencil size={11} /> 编辑
                            </Link>
                          ) : (
                            <span className="flex items-center gap-1 text-[12px] text-gray-300 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap cursor-not-allowed">
                              <Pencil size={11} /> 编辑
                            </span>
                          )}
                          {/* 停用 / 启用 */}
                          {ts === 'enable' && !isScrapped && (
                            <button
                              onClick={() => handleToggleEnable(t.id)}
                              className="flex items-center gap-1 text-[12px] text-orange-600 hover:text-orange-800 px-2 py-0.5 rounded border border-orange-200 hover:bg-orange-50 transition-colors whitespace-nowrap"
                            >
                              <PowerOff size={11} /> 停用
                            </button>
                          )}
                          {ts === 'disable' && (
                            <button
                              onClick={() => handleToggleEnable(t.id)}
                              className="flex items-center gap-1 text-[12px] text-green-600 hover:text-green-800 px-2 py-0.5 rounded border border-green-200 hover:bg-green-50 transition-colors whitespace-nowrap"
                            >
                              <Power size={11} /> 启用
                            </button>
                          )}
                          {/* 报废 */}
                          {!isScrapped ? (
                            <button
                              onClick={() => setScrapConfirm(t.id)}
                              className="flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-800 px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                              <AlertTriangle size={11} /> 报废
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[12px] text-gray-300 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap cursor-not-allowed">
                              <AlertTriangle size={11} /> 报废
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={13} className="py-16 text-center text-gray-400 text-sm">暂无数据</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-gray-500">
              <span>每页条目数:</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="appearance-none border border-gray-300 rounded px-2 py-1 text-sm pr-5 bg-white focus:outline-none"
                >
                  {[10, 20, 50].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">1</div>
          </div>
        </div>
      </div>

      {/* Scrap Confirmation Dialog */}
      {scrapConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[380px] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-semibold text-[15px]">
                <AlertTriangle size={18} className="text-amber-500" />
                确认报废
              </div>
              <button onClick={() => setScrapConfirm(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              报废后，该模具状态将修改为<span className="font-medium text-gray-800">「已报废」</span>，且模具信息将不可修改。此操作不可撤销，确认继续？
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setScrapConfirm(null)}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleScrapConfirm(scrapConfirm)}
                className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                确认报废
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}