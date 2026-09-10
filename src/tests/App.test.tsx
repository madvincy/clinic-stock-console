import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import LoginPage from '../pages/LoginPage'
import { setupStore } from '../app/store'
import { ReducedMotionRoot } from '../components/ReducedMotionRoot'

describe('App', () => {
  it('renders the login form', () => {
    render(
      <ReducedMotionRoot>
        <Provider store={setupStore()}>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </Provider>
      </ReducedMotionRoot>
    )

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
