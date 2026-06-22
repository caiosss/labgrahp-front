import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
    {
        defaultVariants: {
            size: "default",
            variant: "default",
        },
        variants: {
            size: {
                default: "h-10 px-4 py-2",
                icon: "h-10 w-10",
                sm: "h-9 px-3",
            },
            variant: {
                default: "bg-slate-900 text-white hover:bg-slate-700",
                destructive:
                    "border border-red-200 text-red-700 hover:bg-red-50",
                outline:
                    "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-100",
                secondary:
                    "bg-slate-100 text-slate-900 hover:bg-slate-200",
            },
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ asChild = false, className, size, variant, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ className, size, variant }))}
                ref={ref}
                {...props}
            />
        );
    },
);

Button.displayName = "Button";

export { Button };
