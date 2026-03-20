export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export type DeliveryType = 'ready_account' | 'upgrade_owner' | 'both'
export type ProductStatus = 'active' | 'draft' | 'out_of_stock'

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string | null
  description_html: string | null
  usage_guide_html: string | null
  warranty_html: string | null
  faq_html: string | null
  price: number
  compare_at_price: number | null
  stock: number
  status: ProductStatus
  delivery_type: DeliveryType
  category_id: string | null
  featured: boolean
  badge_text: string | null
  sku: string | null
  sort_order: number
  created_at: string
  updated_at: string
  categories?: Category
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  option_value: string
  price: number | null
  compare_at_price: number | null
  stock: number
  is_default: boolean
  sort_order: number
  delivery_type?: string
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: string
  order_code: string
  user_id: string | null
  customer_email: string
  customer_name: string | null
  customer_phone: string | null
  subtotal: number
  total: number
  payment_method: string | null
  payment_status: PaymentStatus
  order_status: OrderStatus
  note: string | null
  admin_note: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  order_deliveries?: OrderDelivery[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  variant_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  upgrade_email: string | null
  usage_guide_html_snapshot: string | null
}

export interface OrderDelivery {
  id: string
  order_id: string
  order_item_id: string | null
  delivery_title: string | null
  delivery_content_html: string | null
  account_email: string | null
  account_password: string | null
  account_extra: string | null
  admin_note: string | null
  visible_to_customer: boolean
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface CartItemLocal {
  productId: string
  variantId: string | null
  quantity: number
  upgradeEmail: string | null
  product: Product
  variant: ProductVariant | null
}

export interface CartStore {
  items: CartItemLocal[]
  isOpen: boolean
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number, upgradeEmail?: string) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}