import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLoginMutation } from '@/features/auth/authApi'
import { applyLoginResponse } from '@/features/auth/authSlice'
import { useAppDispatch } from '@/app/hooks'
import {
  LOGIN_EXPIRES_IN_MINS,
  getRtkErrorMessage,
  safeRedirectTo,
} from '@/lib/apiClient'
import { loginSchema, type LoginFormValues } from '@/features/auth/loginSchema'
import { PageHeading } from '@/components/PageHeading'
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <PageHeading>Sign in</PageHeading>
      <p className="mt-2 text-sm text-muted-foreground">
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
