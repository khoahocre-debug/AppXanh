'use client'
import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCartStore()
  const totalAmount = total()
  const count = itemCount()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>Giỏ Hàng</h2>
            {count > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-slate-700 font-semibold mb-1">Giỏ hàng trống</p>
              <p className="text-sm text-slate-400 mb-5">Thêm sản phẩm để bắt đầu mua sắm</p>
              <button onClick={closeCart}>
                <Link href="/shop" className="btn-primary text-sm">Xem Sản Phẩm</Link>
              </button>
            </div>
          ) : (
            items.map((item) => {
              const price = item.variant?.price ?? item.product.price
              const compareAt = item.variant?.compare_at_price ?? item.product.compare_at_price
              return (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-2xl flex-shrink-0">
                    🤖
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">{item.product.name}</p>
                    {item.variant && <p className="text-xs text-slate-500 mt-0.5">{item.variant.option_value}</p>}
                    {item.upgradeEmail && <p className="text-xs text-blue-600 mt-0.5 truncate">📧 {item.upgradeEmail}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-blue-700">{formatPrice(price)}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-50 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-50 transition-colors">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeItem(item.productId, item.variantId)}
                          className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 text-red-500 transition-colors ml-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Tổng tiền</span>
              <span className="text-xl font-bold text-blue-700">{formatPrice(totalAmount)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full justify-center text-base py-3">
              Thanh Toán <ArrowRight size={18} />
            </Link>
            <button onClick={closeCart}
              className="block w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  )
}