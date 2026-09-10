import { describe, expect, it, afterEach, vi } from 'vitest'
import { Provider } from 'react-redux'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { setupStore } from '@/app/store'
import { stockApi } from '@/features/stock/stockApi'
import { StockCorrectionForm } from '@/features/stock/components/StockCorrectionForm'
import { showToast, clearToasts, getToasts } from '@/lib/toast'
import { getRtkErrorMessage } from '@/lib/apiClient'
import { sampleDummyJSONProduct } from './fixtures'
import { AppToaster } from '@/components/AppToaster'
import { ReducedMotionRoot } from '@/components/ReducedMotionRoot'

function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

function Harness() {
  const { data } = stockApi.endpoints.getProduct.useQuery(1)
  const [updateStock, state] = stockApi.endpoints.updateStock.useMutation()

  if (!data) return <div>loading</div>

  return (
    <StockCorrectionForm
      currentQuantity={data.quantityOnHand}
      isSaving={state.isLoading}
      onSubmit={async (quantityOnHand) => {
        try {
          await updateStock({ id: 1, quantityOnHand }).unwrap()
        } catch (error) {
          showToast({
            variant: 'error',
            title: 'Could not save stock',
            description: getRtkErrorMessage(error, 'Rolled back'),
          })
        }
      }}
    />
  )
}

describe('updateStock optimistic update', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    clearToasts()
  })

  it('reverts the cache and surfaces an error when the mutation fails', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/products/1') && (!init?.method || init.method === 'GET')) {
        return jsonResponse(sampleDummyJSONProduct)
      }
      if (url.includes('/products/1') && init?.method === 'PUT') {
        return jsonResponse({ message: 'Update failed' }, 500)
      }
      return jsonResponse({ message: 'unhandled' }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    const store = setupStore()

    render(
      <ReducedMotionRoot>
        <Provider store={store}>
          <AppToaster />
          <Harness />
        </Provider>
      </ReducedMotionRoot>
    )

    await screen.findByLabelText(/corrected stock count/i)

    const input = screen.getByLabelText(/corrected stock count/i)
    fireEvent.change(input, { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: /save correction/i }))

    await waitFor(() => {
      expect(getToasts().some((toast) => toast.variant === 'error')).toBe(true)
    })

    const cached = stockApi.endpoints.getProduct.select(1)(store.getState())
    expect(cached.data?.quantityOnHand).toBe(5)
    expect(screen.getByText(/could not save stock/i)).toBeInTheDocument()
    expect(input).toHaveValue(40)
  })
})
