import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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

const schema = z.object({
  quantityOnHand: z.coerce
    .number({ error: 'Enter a whole number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
})

type FormValues = z.infer<typeof schema>

interface StockCorrectionFormProps {
  currentQuantity: number
  isSaving: boolean
  onSubmit: (quantityOnHand: number) => Promise<void> | void
}

export function StockCorrectionForm({
  currentQuantity,
  isSaving,
  onSubmit,
}: StockCorrectionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantityOnHand: currentQuantity },
  })

  return (
    <Form {...form}>
      <form
        className="max-w-sm space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values.quantityOnHand)
        })}
        noValidate
      >
        <FormField
          control={form.control}
          name="quantityOnHand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Corrected stock count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  disabled={isSaving}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save correction'}
        </Button>
      </form>
    </Form>
  )
}
