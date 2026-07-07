'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import {
  Search, RotateCcw, Eye, Plus, X, Printer, Trash2, ChevronDown,
  FileText, Package, Building2,
} from 'lucide-react'

interface SalesOutboundItem {
  id: string
  itemNo: string
  itemName: string
  spec: string
  unit: string
  qty: number
  remark?: string
}

interface SalesOutboundOrder {
  id: string
  customer: string
  fromWarehouse: string
  operator: string
  outboundTime: string
  remark?: string
  items: SalesOutboundItem[]
}

const WAREHOUSE_LIST = ['备料仓', '技术仓', '成品仓', '报废仓']

const MOCK_DATA: SalesOutboundOrder[] = [
  {
    id: 'XOUT202606040001',
    customer: '台州市百达机械有限公司',
    fromWarehouse: '备料仓',
    operator: '仓管员梁金凤',
    outboundTime: '2026-06-03',
    items: [
      { id: '1', itemNo: '3.50.2002871', itemName: 'C103299轮廓定位块', spec: '', unit: '件', qty: 1 },
      { id: '2', itemNo: '3.50.2002872', itemName: 'C409477轮廓定位块', spec: '', unit: '件', qty: 1 },
      { id: '3', itemNo: '3.50.2002873', itemName: '检测PIN', spec: '', unit: '件', qty: 2 },
      { id: '4', itemNo: '3.50.2002874', itemName: 'NZ7U形孔通针', spec: '', unit: '件', qty: 2 },
      { id: '5', itemNo: '3.50.2002875', itemName: 'BW检查量规', spec: '', unit: '件', qty: 4 },
    ],
  },
  {
    id: 'XOUT202606050002',
    customer: '台州百达热处理有限公司',
    fromWarehouse: '技术仓',
    operator: '仓管员梁金凤',
    outboundTime: '2026-06-05',
    items: [
      { id: '1', itemNo: '3.50.2002880', itemName: '成形凹模坯料', spec: 'Cr12MoV', unit: '件', qty: 10 },
      { id: '2', itemNo: '3.50.2002881', itemName: '成形凸模坯料', spec: 'SKD11', unit: '件', qty: 8 },
    ],
  },
]

const emptyForm: Omit<SalesOutboundOrder, 'id' | 'outboundTime'> = {
  customer: '',
  fromWarehouse: '',
  operator: '',
  remark: '',
  items: [{ id: '1', itemNo: '', itemName: '', spec: '', unit: '件', qty: 1 }],
}

export default function SalesOutboundPage() {
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [orders, setOrders] = useState<SalesOutboundOrder[]>(MOCK_DATA)
  const [detail, setDetail] = useState<SalesOutboundOrder | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.id.includes(search) || o.customer.includes(search) || o.items.some(i => i.itemName.includes(search) || i.itemNo.includes(search))
    const matchWh = !warehouseFilter || o.fromWarehouse === warehouseFilter
    return matchSearch && matchWh
  })

  const handlePrint = (order: SalesOutboundOrder) => {
    const printNo = order.id
    const today = order.outboundTime || new Date().toLocaleDateString('zh-CN')

    const tableRows = order.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.itemNo}</td>
        <td>${item.itemName}</td>
        <td>${item.spec || ''}</td>
        <td>${item.unit}</td>
        <td>${item.qty}</td>
        <td>${item.remark || ''}</td>
      </tr>
    `).join('')

    const printContent = `
      <div class="page">
        <div class="company">台州市百达电器有限公司</div>
        <div class="title">销售出库单</div>
        <div class="bill-meta">
          <div class="meta-row">
            <span>客户：${order.customer}</span>
            <span>编号：${printNo}</span>
          </div>
          <div class="meta-row">
            <span>日期：${today}</span>
          </div>
        </div>
        <table class="bill-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>代码</th>
              <th>名称</th>
              <th>规格型号</th>
              <th>单位</th>
              <th>数量</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="bill-footer">
          <div class="footer-row">
            <span>仓管员：${order.operator || '___________'}</span>
            <span>领用人：___________</span>
          </div>
        </div>
      </div>
    `

    const printWindow = window.open('', '_blank', 'width=820,height=900')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>销售出库单 - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Microsoft YaHei", "SimHei", sans-serif; font-size: 12px; color: #333; }
          .page { width: 100%; padding: 30px; page-break-after: always; }
          .page:last-child { page-break-after: avoid; }
          .company { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 6px; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
          .bill-meta { margin-bottom: 15px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
          .bill-table { width: 100%; border-collapse: collapse; }
          .bill-table th, .bill-table td { border: 1px solid #333; padding: 7px 5px; text-align: center; font-size: 11px; }
          .bill-table th { background: #f5f5f5; font-weight: bold; }
          .bill-table td:nth-child(3), .bill-table td:nth-child(4) { text-align: left; }
          .bill-footer { margin-top: 50px; }
          .footer-row { display: flex; justify-content: space-between; font-size: 12px; }
          @media print { .page { padding: 20px; } }
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

  const handleSubmit = () => {
    if (!form.customer || !form.fromWarehouse || form.items.length === 0) {
      alert('请填写必填项')
      return
    }
    const validItems = form.items.filter(item => item.itemName)
    if (validItems.length === 0) {
      alert('请至少添加一个物料')
      return
    }
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const seq = String(orders.length + 1).padStart(4, '0')
    const newOrder: SalesOutboundOrder = {
      id: `XOUT${today}${seq}`,
      customer: form.customer,
      fromWarehouse: form.fromWarehouse,
      operator: form.operator || '仓管员',
      outboundTime: new Date().toLocaleDateString('zh-CN'),
      remark: form.remark,
      items: validItems,
    }
    setOrders([newOrder, ...orders])
    alert(`销售出库单创建成功！\n\n单号：${newOrder.id}\n客户：${newOrder.customer}\n物料数：${validItems.length}种`)
    setShowNew(false)
    setForm(emptyForm)
  }

  const updateItem = (idx: number, field: keyof SalesOutboundItem, value: string | number) => {
    const newItems = [...form.items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    setForm({ ...form, items: newItems })
  }

  const addItem = () => {
    const newId = String(form.items.length + 1)
    setForm({ ...form, items: [...form.items, { id: newId, itemNo: '', itemName: '', spec: '', unit: '件', qty: 1 }] })
  }

  const removeItem = (id: string) => {
    if (form.items.length <= 1) return
    setForm({ ...form, items: form.items.filter(i => i.id !== id) })
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <Building2 size={13} className="text-amber-600" />
          <span className="text-xs text-amber-800">
            仓库直接开具销售出库单 · 用于出库给兄弟公司或客户 · 支持打印纸质出库单
          </span>
        </div>

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">销售出库单</h1>
              <p className="text-[11px] text-gray-500">仓库直接开单 · 出库给客户/兄弟公司 · 打印纸质单据</p>
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="px-3 py-2 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> 新建销售出库单
          </button>
        </div>

        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-wrap shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="出库单号 / 客户 / 物料名称 / 品号"
              className="border border-gray-200 rounded pl-7 pr-3 py-1.5 text-[12px] w-72 focus:outline-none focus:border-amber-400 bg-gray-50"
            />
          </div>
          <div className="relative">
            <button className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 text-[12px] w-32 cursor-pointer hover:border-amber-300 bg-gray-50">
              <span className={warehouseFilter ? 'text-gray-700' : 'text-gray-400'}>{warehouseFilter || '出库仓库'}</span>
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
          <button
            onClick={() => { setSearch(''); setWarehouseFilter('') }}
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
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">销售出库单号</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">客户</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库仓库</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">物料</th>
                  <th className="px-3 py-2.5 text-right font-medium text-gray-500">物料数</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作人</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">出库日期</th>
                  <th className="px-3 py-2.5 text-left font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">暂无销售出库单</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-amber-600 font-medium cursor-pointer hover:underline" onClick={() => setDetail(row)}>
                          {row.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium">{row.customer}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                          {row.fromWarehouse}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          {row.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-gray-500 font-mono text-[10px]">{item.itemNo}</span>
                              <span className="text-gray-800">{item.itemName}</span>
                              <span className="text-gray-500 text-[10px]">×{item.qty}</span>
                            </div>
                          ))}
                          {row.items.length > 2 && (
                            <div className="text-[11px] text-gray-400">+{row.items.length - 2} 种物料...</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-700 font-medium">{row.items.length}种</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.operator}</td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{row.outboundTime}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetail(row)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-amber-600 px-1.5 py-0.5 rounded hover:bg-amber-50"
                          >
                            <Eye size={11} /> 详情
                          </button>
                          <button
                            onClick={() => handlePrint(row)}
                            className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-white px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-500 border border-amber-200 transition-colors"
                          >
                            <Printer size={11} /> 打印
                          </button>
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
            <div className="bg-white rounded-xl shadow-xl w-[720px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-amber-500" />
                  <span className="text-sm font-semibold text-gray-800">新建销售出库单</span>
                </div>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-[12px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1.5">客户 <span className="text-red-400">*</span></label>
                    <input
                      value={form.customer}
                      onChange={(e) => setForm({ ...form, customer: e.target.value })}
                      placeholder="客户/兄弟公司名称"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-amber-400 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5">出库仓库 <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <button className="w-full flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-[12px] bg-gray-50 hover:border-amber-300">
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
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-600">物料明细 <span className="text-red-400">*</span></label>
                    <button onClick={addItem} className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700">
                      <Plus size={11} /> 添加物料
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 px-1">
                      <div className="col-span-3">品名</div>
                      <div className="col-span-3">品号</div>
                      <div className="col-span-2">规格型号</div>
                      <div className="col-span-1">单位</div>
                      <div className="col-span-2">数量</div>
                      <div className="col-span-1"></div>
                    </div>
                    {form.items.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2">
                        <input
                          value={item.itemName}
                          onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                          placeholder="品名"
                          className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-400 bg-white"
                        />
                        <input
                          value={item.itemNo}
                          onChange={(e) => updateItem(idx, 'itemNo', e.target.value)}
                          placeholder="品号"
                          className="col-span-3 border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-400 bg-white"
                        />
                        <input
                          value={item.spec}
                          onChange={(e) => updateItem(idx, 'spec', e.target.value)}
                          placeholder="规格"
                          className="col-span-2 border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-400 bg-white"
                        />
                        <input
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          placeholder="件"
                          className="col-span-1 border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-400 bg-white"
                        />
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                          className="col-span-2 border border-gray-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-amber-400 bg-white"
                        />
                        <div className="col-span-1 flex items-center justify-center">
                          {form.items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1.5">操作人</label>
                    <input
                      value={form.operator}
                      onChange={(e) => setForm({ ...form, operator: e.target.value })}
                      placeholder="仓管员"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-amber-400 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5">备注</label>
                    <input
                      value={form.remark}
                      onChange={(e) => setForm({ ...form, remark: e.target.value })}
                      placeholder="备注"
                      className="w-full border border-gray-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-amber-400 bg-gray-50"
                    />
                  </div>
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
                  disabled={!form.customer || !form.fromWarehouse || !form.items.some(i => i.itemName)}
                  className="px-4 py-1.5 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={13} /> 保存并打印
                </button>
              </div>
            </div>
          </div>
        )}

        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
                <span className="text-sm font-semibold text-gray-800">销售出库单详情</span>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5 space-y-4 text-[12px]">
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-6">
                  <div className="flex justify-between"><span className="text-gray-400">出库单号</span><span className="text-gray-800 font-medium">{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">客户</span><span className="text-gray-800 font-medium">{detail.customer}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">出库仓库</span><span className="text-amber-600 font-medium">{detail.fromWarehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">出库日期</span><span className="text-gray-600">{detail.outboundTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">操作人</span><span className="text-gray-600">{detail.operator}</span></div>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-500 mb-2">物料明细</h3>
                  <table className="w-full text-[11px] border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">品号</th>
                        <th className="px-3 py-2 text-left">品名</th>
                        <th className="px-3 py-2 text-left">规格</th>
                        <th className="px-3 py-2 text-left">单位</th>
                        <th className="px-3 py-2 text-right">数量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 text-gray-600 font-mono">{item.itemNo}</td>
                          <td className="px-3 py-2 text-gray-800">{item.itemName}</td>
                          <td className="px-3 py-2 text-gray-500">{item.spec || '—'}</td>
                          <td className="px-3 py-2 text-gray-500">{item.unit}</td>
                          <td className="px-3 py-2 text-right font-medium">{item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button onClick={() => setDetail(null)} className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-white">关闭</button>
                <button onClick={() => handlePrint(detail)} className="px-4 py-1.5 text-sm text-white bg-amber-500 hover:bg-amber-600 rounded font-medium flex items-center gap-1"><Printer size={13} /> 打印出库单</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
