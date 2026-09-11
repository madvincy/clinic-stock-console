import { useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuUser {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  image?: string
}

interface UserMenuProps {
  user: UserMenuUser | null | undefined
}

function getDisplayName(user: UserMenuUser | null | undefined): string {
  if (!user) return 'User'
  return (
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    user.username ||
    'User'
  )
}

function getInitials(user: UserMenuUser | null | undefined): string {
  if (!user) return 'U'
  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  return initials || 'U'
}

export function UserMenu({ user }: UserMenuProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const displayName = getDisplayName(user)
  const initials = getInitials(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.image} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || (user?.username ? `@${user.username}` : '')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => dispatch(logout())}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
