import { RouterProvider } from 'react-router-dom'
import { AppToaster } from './components/AppToaster'
import { ReducedMotionRoot } from './components/ReducedMotionRoot'
import { router } from './router'

function App() {
  return (
    <ReducedMotionRoot>
      <RouterProvider router={router} />
      <AppToaster />
    </ReducedMotionRoot>
  )
}

export default App
