import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Building, Briefcase } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectAuth } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'
import { PageHeading } from '@/components/PageHeading'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'

export default function UserProfilePage() {
  const { user, accessToken } = useAppSelector(selectAuth)
  const { isLoading } = useGetMeQuery(undefined, {
    skip: Boolean(user) || !accessToken,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading user profile details...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No user profile data available.</p>
        <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to stock console</span>
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-inner">
            <AvatarImage src={user.image} alt={user.firstName} />
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <PageHeading>{`${user.firstName} ${user.lastName}`}</PageHeading>
              <Badge variant="secondary" className="capitalize">
                {user.gender || 'User'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground pt-1">
              User ID: <code className="rounded bg-muted px-1.5 py-0.5">{user.id}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/40 px-6 py-4">
          <h2 className="font-semibold text-foreground">Account Information</h2>
        </div>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-1/3 font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Full Name
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                {user.firstName} {user.lastName}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address
                </div>
              </TableCell>
              <TableCell>{user.email || 'N/A'}</TableCell>
            </TableRow>

            {user.phone && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Phone
                  </div>
                </TableCell>
                <TableCell>{user.phone}</TableCell>
              </TableRow>
            )}

            {user.company && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    Department / Company
                  </div>
                </TableCell>
                <TableCell>{user.company.name || user.company.department || 'N/A'}</TableCell>
              </TableRow>
            )}

            {user.role && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Role
                  </div>
                </TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
