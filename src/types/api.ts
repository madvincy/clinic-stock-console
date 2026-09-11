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

export interface DummyJSONAddress {
  address?: string
  city?: string
  state?: string
  stateCode?: string
  postalCode?: string
  coordinates?: {
    lat?: number
    lng?: number
  }
  country?: string
}

export interface DummyJSONCompany {
  department?: string
  name?: string
  title?: string
  address?: DummyJSONAddress
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
  dimensions: {
    width: number
    height: number
    depth: number
  }
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: DummyJSONReview[]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: {
    createdAt: string
    updatedAt: string
    barcode: string
    qrCode: string
  }
  thumbnail: string
  images: string[]
}

export interface DummyJSONRefreshResponse {
  accessToken: string
  refreshToken: string
}

/**
 * User returned by DummyJSON authentication endpoints.
 *
 * Login returns the basic user information plus tokens.
 * /auth/me returns the user information without the tokens.
 */
export interface DummyJSONAuthResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string

  phone?: string

  age?: number
  birthDate?: string
  bloodGroup?: string
  height?: number
  weight?: number
  eyeColor?: string
  hair?: {
    color?: string
    type?: string
  }

  address?: DummyJSONAddress

  university?: string

  company?: DummyJSONCompany

  role?: string

  ssn?: string
  ein?: string
  userAgent?: string
  crypto?: {
    coin?: string
    wallet?: string
    network?: string
  }

  accessToken?: string
  refreshToken?: string
}

/**
 * Login request accepted by DummyJSON.
 */
export type DummyJSONLoginRequest = {
  username: string
  password: string
  expiresInMins?: number
}

/**
 *  Authentication tokens are intentionally excluded because
 * they belong to AuthState rather than the user object.
 */
export type AuthUser = Omit<
  DummyJSONAuthResponse,
  'accessToken' | 'refreshToken'
>

export type DummyJSONProductsResponse = PaginatedResponse<
  DummyJSONProduct,
  'products'
>

// ── Application Domain Models ───────────────────────────────────────────────

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

// ── Mapping Functions ───────────────────────────────────────────────────────

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

export function mapAuthResponseToUser(
  response: DummyJSONAuthResponse
): AuthUser {
  const {
    accessToken: _accessToken,
    refreshToken: _refreshToken,
    ...user
  } = response

  return user
}
