'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartStore, CartItemLocal, Product, ProductVariant } from '@/types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, variant: ProductVariant | null, quantity = 1, upgradeEmail = '') => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id && i.variantId === (variant?.id ?? null)
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id && i.variantId === (variant?.id ?? null)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          const newItem: CartItemLocal = {
            productId: product.id,
            variantId: variant?.id ?? null,
            quantity,
            upgradeEmail: upgradeEmail || null,
            product,
            variant,
          }
          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (productId: string, variantId?: string | null) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === (variantId ?? null))
          ),
        }))
      },

      updateQuantity: (productId: string, variantId: string | null, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          const price = item.variant?.price ?? item.product.price
          return sum + price * item.quantity
        }, 0)
      },

      itemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    { name: 'appxanh-cart' }
  )
)