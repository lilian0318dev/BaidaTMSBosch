'use client'

import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { useState } from 'react'

const REASONS_MAP: Record<string, { name: string; desc: string }> = {
  'RR001': { name: '零件磨损', desc: '模具零件因长期使用产生磨损' },
  'RR002': { name: '材料缺陷', desc: '原材料本身存在内部缺陷' },
  'RR003': { name: '尺寸超差', desc: '零件加工后尺寸超出公差范围' },
  'RR004': { name: '配合不良', desc: '装配时零件配合间隙不符合要求' },
  'RR005': { name: '保养不及时', desc: '未按保养计划执行保养导致故障' },
  'RR006': { name: '操作不当', desc: '操作人员未按规程使用模具' },
  'new': { name: '', desc: '' },
}

export default function RepairReasonEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const initial = REASONS_MAP[id] ?? { name: '', desc: '' }
  const [name, setName] = useState(initial.name)
  const [desc, setDesc] = useState(initial.desc)

  const isNew = id === 'new'
  const title = isNew ? '新增维修原因' : '编辑维修原因'

  return (
    <MainLayout>
      <div className="p-4">
        <div className="bg-white rounded border border-gray-200 max-w-xl">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-4">
            <button className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">详情</button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            <div className="text-sm font-semibold text-gray-700 pb-1 border-b border-gray-100">基本信息</div>

            <div>
              <label className="block text-[13px] text-gray-600 mb-1.5">
                维修原因 <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入维修原因"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[13px] text-gray-600 mb-1.5">描述</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="请输入描述"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => router.back()}
                disabled={!name.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm rounded font-medium transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
