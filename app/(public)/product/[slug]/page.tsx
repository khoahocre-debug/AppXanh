import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'
import Script from 'next/script'
import type { Metadata } from 'next'

type ProductReview = {
  rating?: number | null
  status?: string | null
  reviewer_name?: string | null
  content?: string | null
  created_at?: string | null
}

type ProductImage = {
  image_url?: string | null
  sort_order?: number | null
}

const SITE_URL = 'https://xanhsoft.com'
const SITE_NAME = 'XanhSoft'

function getCanonicalUrl(slug: string) {
  return `${SITE_URL}/product/${slug}`
}

function getCoverImage(images: ProductImage[]) {
  if (!images.length) return null
  const sorted = [...images].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
  return sorted[0]?.image_url ?? null
}

function getApprovedRatedReviews(reviews: ProductReview[]) {
  return reviews.filter((r) => (r.rating ?? 0) > 0 && r.status === 'approved')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, slug, short_description, product_images(image_url, sort_order)')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Không tìm thấy sản phẩm' }

  const canonicalUrl = getCanonicalUrl(product.slug)
  const coverImage = getCoverImage((product.product_images ?? []) as ProductImage[])
  const fallbackDescription = `Mua ${product.name} giá tốt tại ${SITE_NAME}. Giao nhanh sau thanh toán, hỗ trợ tận tâm.`
  const description = (product.short_description || fallbackDescription).trim()

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
      images: coverImage ? [{ url: coverImage, width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: coverImage ? [coverImage] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*), product_images(*), product_reviews(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null }

  const images = (product.product_images ?? []) as ProductImage[]
  const reviews = (product.product_reviews ?? []) as ProductReview[]
  const ratingReviews = getApprovedRatedReviews(reviews)
  const avgRating = ratingReviews.length
    ? Number((ratingReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingReviews.length).toFixed(1))
    : null

  const canonicalUrl = getCanonicalUrl(product.slug)
  const coverImage = getCoverImage(images)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description ?? `Mua ${product.name} tại ${SITE_NAME}.`,
    url: canonicalUrl,
    image: coverImage ? [coverImage] : images.map((img) => img.image_url).filter(Boolean),
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price ?? 0,
      availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    ...(avgRating && ratingReviews.length
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avgRating,
            reviewCount: ratingReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(ratingReviews.length
      ? {
          review: ratingReviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: r.reviewer_name || 'Khách hàng',
            },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.content || '',
            datePublished: r.created_at?.split('T')[0],
          })),
        }
      : {}),
  }

  const pageContent = (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  )

  if (profile?.role === 'admin') {
    return (
      <>
        {pageContent}
        <a
          href={`/admin/products/${product.id}`}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}
        >
          ✏️ Sửa sản phẩm
        </a>
      </>
    )
  }

  return pageContent
}