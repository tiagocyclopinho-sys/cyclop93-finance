import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle size={12} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: { label: string, value: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                            error && "border-destructive",
                            className
                        )}
                        {...props}
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">{opt.label}</option>
                        ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
                {error && <span className="text-xs text-destructive">{error}</span>}
            </div>
        )
    }
)
Select.displayName = "Select"

export { Input, Select }
