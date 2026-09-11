import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { StockCorrectionForm } from '@/features/stock/components/StockCorrectionForm'
import { useUpdateStockMutation } from '@/features/stock/stockApi'
import { getRtkErrorMessage } from '@/lib/apiClient'
import { showToast } from '@/lib/toast'
import type { StockItem } from '@/types/api'

interface StockEditDialogProps {
  /**
   * Last item selected for editing. Intentionally NOT cleared on close so
   * the dialog's content doesn't disappear mid-exit-animation — `open`
   * controls visibility independently.
   */
  item: StockItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function StockEditDialog({
  item,
  open,
  onOpenChange,
}: StockEditDialogProps) {
  const [updateStock, updateState] = useUpdateStockMutation()

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit stock</DialogTitle>
          <DialogDescription>
            Update the counted quantity for this item. Saves apply immediately
            for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border p-3">
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="text-sm capitalize text-muted-foreground">
              {item.category.replaceAll('-', ' ')}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(item.unitPrice)} · On hand: {item.quantityOnHand}
            </p>
          </div>
        </div>

        <StockCorrectionForm
          currentQuantity={item.quantityOnHand}
          isSaving={updateState.isLoading}
          onSubmit={async (quantityOnHand) => {
            try {
              await updateStock({ id: item.id, quantityOnHand }).unwrap()
              showToast({
                variant: 'success',
                title: 'Stock updated',
                description: 'The new count is reflected in this session.',
              })
              onOpenChange(false)
            } catch (error) {
              showToast({
                variant: 'error',
                title: 'Could not save stock',
                description: getRtkErrorMessage(
                  error,
                  'The correction was rolled back.'
                ),
              })
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
