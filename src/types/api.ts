// ── Generic API Utilities ───────────────────────────────────────────────────

/** Generic paginated response for list endpoints. */
export type PaginatedResponse<T, Key extends string = 'items'> = {
  total: number
  skip: number
  limit: number
} & Record<Key, T[]>

// ── Shared Domain Models & Sub-types ────────────────────────────────────────

export interface DummyJSONReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface DummyJSONCategory {
  slug: string
  name: string
  url: string
}

export interface DummyJSONCompany {
  department?: string
  name?: string
  title?: string
}

// ── Raw API DTOs ────────────────────────────────────────────────────────────

export interface DummyJSONProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string
  sku: string
  weight: number
  dimensions: { width: number; height: number; depth: number }
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: DummyJSONReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: { createdAt: string; updatedAt: string; barcode: string; qrCode: string }
  thumbnail: string
  images: string[]
}

export interface DummyJSONRefreshResponse {
  accessToken: string
  refreshToken: string
}

/** Derived from RefreshResponse to guarantee auth tokens match across interfaces. */
export interface DummyJSONAuthResponse extends Partial<DummyJSONRefreshResponse> {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  phone?: string
  company?: DummyJSONCompany
  role?: string
}

export type DummyJSONLoginRequest = Required<Pick<DummyJSONAuthResponse, 'username'>> & {
  password: string
  expiresInMins?: number
}

export type DummyJSONProductsResponse = PaginatedResponse<DummyJSONProduct, 'products'>

// ── Application Domain Models ────────────────────────────────────────────────

/** Domain user omits internal API tokens from auth response. */
export type AuthUser = Omit<DummyJSONAuthResponse, 'accessToken' | 'refreshToken'>

export interface StockItem {
  id: number
  name: string
  description: string
  category: string
  unitPrice: number
  quantityOnHand: number
  rating: number
  thumbnailUrl: string
  imageUrls: string[]
  availability: string
}

export type StockListPage = PaginatedResponse<StockItem, 'items'>

// ── Mapping Functions ────────────────────────────────────────────────────────

export function mapDummyJSONToStockItem(product: DummyJSONProduct): StockItem {
  const {
    id,
    title: name,
    description,
    category,
    price: unitPrice,
    stock: quantityOnHand,
    rating,
    thumbnail: thumbnailUrl,
    images: imageUrls,
    availabilityStatus: availability,
  } = product

  return {
    id,
    name,
    description,
    category,
    unitPrice,
    quantityOnHand,
    rating,
    thumbnailUrl,
    imageUrls,
    availability,
  }
}

export function mapAuthResponseToUser(response: DummyJSONAuthResponse): AuthUser {
  const { accessToken, refreshToken, company, ...user } = response

  return {
    ...user,
    company: company
      ? { name: company.name, department: company.department, title: company.title }
      : undefined,
  }
}