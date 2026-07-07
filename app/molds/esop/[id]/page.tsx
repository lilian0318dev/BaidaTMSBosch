'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Eye, Trash2, Search, ChevronDown } from 'lucide-react'

interface EsopForm {
  name: string
  version: string
  factory: string
  productCode: string
  description: string
  fileName: string
}

const factories = ['百达电器', '华夏1号工厂', '华夏2号工厂']

const mockData: Record<string, EsopForm> = {
  E001: { name: '深钻孔', version: 'V1.0', factory: '百达电器', productCode: 'BD-WL-DJZ-0085.0085-01', description: '深钻孔工序作业指导SOP', fileName: '9 深孔钻.pdf' },
  E002: { name: '精车两端', version: 'V1.0', factory: '百达电器', productCode: 'BD-WL-DJZ-0085.0085-01', description: '精车两端工序作业指导SOP', fileName: '16 精车两端.pdf' },
  new: { name: '', version: '', factory: '', productCode: '', description: '', fileName: '' },
}

export default function EsopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const isNew = id === 'new'
  const initial = mockData[id] ?? { name: '', version: '', factory: '', productCode: '', description: '', fileName: '' }

  const [form, setForm] = useState<EsopForm>(initial)

  const handleSave = () => {
    router.push('/molds/esop')
  }

  const handleCancel = () => {
    router.push('/molds/esop')
  }

  return (
    <MainLayout>
      <div className="h-full overflow-auto bg-[#f5f5f5]">
        {/* Tab bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button className="px-8 py-4 text-[14px] text-[#1e5fa8] font-medium border-b-2 border-[#1e5fa8]">
              详情
            </button>
          </div>
        </div>

        {/* Form body */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border-b border-gray-200">
            {/* Basic info section */}
            <div className="flex">
              {/* Section label */}
              <div className="w-52 shrink-0 px-8 py-8">
                <h3 className="text-[15px] font-medium text-gray-800">基本信息</h3>
              </div>

              {/* Fields */}
              <div className="flex-1 px-8 py-8">
                {/* Row 1: Name + Version */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">
                      名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-100 border-0 border-b border-gray-300 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500 rounded-t"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">
                      版本 <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.version}
                      onChange={(e) => setForm({ ...form, version: e.target.value })}
                      className="w-full bg-gray-100 border-0 border-b border-gray-300 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500 rounded-t"
                    />
                  </div>
                </div>

                {/* Row 2: Factory + Product code */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">
                      所属工厂 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.factory}
                        onChange={(e) => setForm({ ...form, factory: e.target.value })}
                        className="w-full appearance-none bg-gray-100 border-0 border-b border-gray-300 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500 rounded-t pr-8"
                      >
                        <option value=""></option>
                        {factories.map((f) => <option key={f}>{f}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1.5">
                      产品编码 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={form.productCode}
                        onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                        className="w-full bg-gray-100 border-0 border-b border-gray-300 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500 rounded-t pr-8"
                      />
                      <Search size={14} className="absolute right-2.5 top-3 text-gray-400 cursor-pointer hover:text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Description */}
                <div className="mb-6">
                  <label className="block text-[12px] text-gray-500 mb-1.5">描述</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-100 border-0 border-b border-gray-300 px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500 rounded-t resize-none"
                  />
                </div>

                {/* File attachment row */}
                {form.fileName && (
                  <div className="flex items-center gap-4 py-2 border-t border-gray-100">
                    <span className="text-[13px] text-gray-700 flex-1">{form.fileName}</span>
                    <button className="text-gray-400 hover:text-blue-500 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setForm({ ...form, fileName: '' })}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                )}

                {!form.fileName && (
                  <div className="border-2 border-dashed border-gray-200 rounded px-4 py-3 text-center mt-2">
                    <label className="cursor-pointer text-[13px] text-blue-500 hover:text-blue-600">
                      点击上传文件
                      <input type="file" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setForm({ ...form, fileName: file.name })
                      }} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-[#1e5fa8] hover:bg-[#1a4f8f] text-white text-[14px] font-medium rounded transition-colors"
              >
                保存
              </button>
              <button
                onClick={handleCancel}
                className="px-8 py-2.5 border border-gray-300 text-gray-700 text-[14px] rounded hover:bg-gray-50 transition-colors"
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
