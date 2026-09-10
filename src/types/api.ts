/** Raw DummyJSON product as returned by GET /products and related endpoints. */
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

export interface DummyJSONReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface DummyJSONProductsResponse {
  products: DummyJSONProduct[]
  total: number
  skip: number
  limit: number
}

export interface DummyJSONCategory {
  slug: string
  name: string
  url: string
}

/** Raw DummyJSON POST /auth/login body. */
export interface DummyJSONLoginRequest {
  username: string
  password: string
  expiresInMins?: number
}

/**
 * Raw DummyJSON login response. Tokens are JWTs; expiry is not returned as a
 * field — we compute it client-side from the `expiresInMins` we sent.
 */
export interface DummyJSONAuthResponse {
  accessToken: string
  refreshToken: string
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

export interface DummyJSONRefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

/**
 * App domain model for a stock row. Field names match clinic language
 * (`name`, `quantityOnHand`) rather than DummyJSON's catalog fields.
 */
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

export interface StockListPage {
  items: StockItem[]
  total: number
  skip: number
  limit: number
}

export function mapDummyJSONToStockItem(product: DummyJSONProduct): StockItem {
  return {
    id: product.id,
    name: product.title,
    description: product.description,
    category: product.category,
    unitPrice: product.price,
    quantityOnHand: product.stock,
    rating: product.rating,
    thumbnailUrl: product.thumbnail,
    imageUrls: product.images,
    availability: product.availabilityStatus,
  }
}

export function mapAuthResponseToUser(
  response: DummyJSONAuthResponse
): AuthUser {
  return {
    id: response.id,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    gender: response.gender,
    image: response.image,
  }
}
