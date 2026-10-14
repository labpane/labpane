import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "./classes.js";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "default" | "sm" | "lg";
  }
>(function Avatar({ className, size = "default", ...props }, ref) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      data-size={size}
      className={cn(
        "labui:group/avatar labui:relative labui:flex labui:size-8 labui:shrink-0 labui:overflow-hidden labui:rounded-full labui:select-none labui:data-[size=lg]:size-10 labui:data-[size=sm]:size-6",
        className,
      )}
      {...props}
    />
  );
});

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={cn("labui:aspect-square labui:size-full", className)}
      {...props}
    />
  );
});

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "labui:flex labui:size-full labui:items-center labui:justify-center labui:rounded-full labui:bg-muted labui:text-sm labui:text-muted-foreground labui:group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      {...props}
    />
  );
});

const AvatarBadge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function AvatarBadge({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="avatar-badge"
      className={cn(
        "labui:absolute labui:right-0 labui:bottom-0 labui:z-10 labui:inline-flex labui:items-center labui:justify-center labui:rounded-full labui:bg-primary labui:text-primary-foreground labui:ring-2 labui:ring-background labui:select-none",
        "labui:group-data-[size=sm]/avatar:size-2 labui:group-data-[size=sm]/avatar:[&>svg]:hidden",
        "labui:group-data-[size=default]/avatar:size-2.5 labui:group-data-[size=default]/avatar:[&>svg]:size-2",
        "labui:group-data-[size=lg]/avatar:size-3 labui:group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
});

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function AvatarGroup({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="avatar-group"
      className={cn(
        "labui:group/avatar-group labui:flex labui:-space-x-2 labui:*:data-[slot=avatar]:ring-2 labui:*:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
});

const AvatarGroupCount = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function AvatarGroupCount({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="avatar-group-count"
      className={cn(
        "labui:relative labui:flex labui:size-8 labui:shrink-0 labui:items-center labui:justify-center labui:rounded-full labui:bg-muted labui:text-sm labui:text-muted-foreground labui:ring-2 labui:ring-background labui:group-has-data-[size=lg]/avatar-group:size-10 labui:group-has-data-[size=sm]/avatar-group:size-6 labui:[&>svg]:size-4 labui:group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 labui:group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
});

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
};
