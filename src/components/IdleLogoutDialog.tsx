import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface IdleLogoutDialogProps {
  open: boolean
  secondsRemaining: number
  onStaySignedIn: () => void
  onLogoutNow: () => void
}

export function IdleLogoutDialog({
  open,
  secondsRemaining,
  onStaySignedIn,
  onLogoutNow,
}: IdleLogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onStaySignedIn()}>
      <DialogContent
        className="sm:max-w-sm"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Still there?</DialogTitle>
          <DialogDescription>
            You’ve been inactive. For security, you’ll be signed out in{' '}
            <span className="font-medium text-foreground" aria-live="polite">
              {secondsRemaining}s
            </span>{' '}
            unless you continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onLogoutNow}>
            Log out now
          </Button>
          <Button type="button" onClick={onStaySignedIn}>
            Stay signed in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
