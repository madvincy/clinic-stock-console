import { describe, expect, it, afterEach, vi } from 'vitest'
import { Provider } from 'react-redux'
import { render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupStore } from '@/app/store'
import { stockApi } from '@/features/stock/stockApi'
import { StockCorrectionForm } from '@/features/stock/components/StockCorrectionForm'
import { showToast, clearToasts, getToasts } from '@/lib/toast'
import { getRtkErrorMessage } from '@/lib/apiClient'
import { sampleDummyJSONProduct } from './fixtures'
import { AppToaster } from '@/components/AppToaster'
import { ReducedMotionRoot } from '@/components/ReducedMotionRoot'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
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
    const user = userEvent.setup()

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof Request
              ? input.url
              : String(input)
        const method = (
          init?.method || (input instanceof Request ? input.method : 'GET')
        ).toUpperCase()

        // Parse path to safely ignore withDelayParams query parameters
        const urlPath = new URL(requestUrl, 'https://dummyjson.com').pathname

        if (urlPath === '/products/1' || urlPath.endsWith('/products/1')) {
          if (method === 'GET') {
            return jsonResponse(sampleDummyJSONProduct, 200)
          }
          if (method === 'PUT' || method === 'PATCH') {
            return jsonResponse({ message: 'Update failed' }, 500)
          }
        }

        return jsonResponse({ message: 'unhandled' }, 500)
      }
    )

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

    // 1. Wait until initial fetch finishes and form input populates with initial stock count
    const input = await screen.findByLabelText(/corrected stock count/i)
    await waitFor(() => {
      expect(input).toHaveValue(sampleDummyJSONProduct.stock ?? 5)
    })

    // 2. Clear input and enter target value (40)
    await user.clear(input)
    await user.type(input, '40')

    const submitButton = screen.getByRole('button', {
      name: /save correction/i,
    })
    await user.click(submitButton)

    // 3. Verify optimistic patch occurred and was successfully reverted back to original (5) on 500 error
    await waitFor(() => {
      const cached = stockApi.endpoints.getProduct.select(1)(store.getState())
      expect(cached.data?.quantityOnHand).toBe(
        sampleDummyJSONProduct.stock ?? 5
      )
    })

    // 4. Verify toast notification in memory store
    await waitFor(() => {
      expect(getToasts().some((toast) => toast.variant === 'error')).toBe(true)
    })

    // 5. Verify DOM notification rendering
    expect(await screen.findByText(/could not save stock/i)).toBeInTheDocument()
  })
})
