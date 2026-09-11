import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useLoginMutation } from '@/features/auth/authApi'
import { applyLoginResponse } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'
import {
  LOGIN_EXPIRES_IN_MINS,
  getRtkErrorMessage,
  safeRedirectTo,
} from '@/lib/apiClient'
import { loginSchema, type LoginFormValues } from '@/features/auth/loginSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FloatingIconsBackground } from '@/components/FloatingIconsBackground'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [login, { isLoading, error, reset }] = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const serverError = error
    ? getRtkErrorMessage(error, 'Could not sign in. Check your credentials.')
    : null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      <FloatingIconsBackground />

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Clinic Stock Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            DummyJSON demo account: <code>emilys</code> / <code>emilyspass</code>
          </p>

          <Form {...form}>
            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                reset()
                try {
                  const response = await login({
                    ...values,
                    expiresInMins: LOGIN_EXPIRES_IN_MINS,
                  }).unwrap()
                  dispatch(applyLoginResponse(response, LOGIN_EXPIRES_IN_MINS))
                  navigate(safeRedirectTo(searchParams.get('redirectTo')), {
                    replace: true,
                  })
                } catch {
                  // Mutation `error` is rendered inline below.
                }
              })}
              noValidate
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError ? (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {serverError}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
