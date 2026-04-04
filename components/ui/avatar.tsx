"use client"

import * as React from"react"
import * as AvatarPrimitive from"@radix-ui/react-avatar"

import { cn } from"@/lib/utils"

const Root = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { size?: 'small' | 'medium' | 'large' }
>(({ className, size = 'medium', ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex shrink-0 overflow-hidden rounded-full",
            size === 'small' && "h-8 w-8",
            size === 'medium' && "h-10 w-10",
            size === 'large' && "h-12 w-12",
            className
        )}
        {...props}
    />
))
Root.displayName = AvatarPrimitive.Root.displayName

const Image = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        {...props}
    />
))
Image.displayName = AvatarPrimitive.Image.displayName

const Fallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn("flex h-full w-full items-center justify-center rounded-full bg-slate-100",
            className
        )}
        {...props}
    />
))
Fallback.displayName = AvatarPrimitive.Fallback.displayName

export { 
    Root, 
    Image, 
    Fallback,
    Root as Avatar,
    Image as AvatarImage,
    Fallback as AvatarFallback
}
