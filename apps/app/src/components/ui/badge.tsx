import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        secondary: "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border)]",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/20",
        outline:   "border border-[var(--border)] text-[var(--text-primary)]",
        success:   "bg-green-500/15 text-green-400 border border-green-500/20",
        warning:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
        info:      "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
        purple:    "bg-purple-500/15 text-purple-400 border border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
