import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        pending:
          'border-transparent bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
        approved:
          'border-transparent bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200',
        rejected:
          'border-transparent bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200',
      },
      status: {
        pending: true,
        approved: true,
        rejected: true,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  status,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; status?: 'pending' | 'approved' | 'rejected' }) {
  const Comp = asChild ? Slot : 'span'

  // Determine animation based on status
  const getAnimation = () => {
    switch (status) {
      case 'pending':
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }
      case 'approved':
        return {
          animate: { scale: [0.95, 1.05, 1] },
          transition: { type: 'spring', stiffness: 200, damping: 10 },
        }
      case 'rejected':
        return {
          animate: { rotate: [0, -2, 2, -2, 0] },
          transition: { duration: 0.4, times: [0, 0.25, 0.5, 0.75, 1] },
        }
      default:
        return {}
    }
  }

  const animation = getAnimation()

  if (status && (status === 'pending' || status === 'approved' || status === 'rejected')) {
    return (
      <motion.span
        data-slot="badge"
        className={cn(badgeVariants({ variant: (variant as any) || status }), className)}
        {...animation}
        {...props}
      />
    )
  }

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
