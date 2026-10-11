"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogPortal({
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-ui="dialog-portal" {...props} />;
}

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-[200] bg-[#182018]/55 opacity-0 backdrop-blur-sm transition-opacity duration-200 data-[state=open]:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    container?: ComponentPropsWithoutRef<
      typeof DialogPrimitive.Portal
    >["container"];
  }
>(function DialogContent({ className, children, container, ...props }, ref) {
  return (
    <DialogPortal container={container}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[201] flex max-h-[min(92dvh,56.25rem)] w-[min(68.75rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 scale-95 flex-col overflow-hidden rounded-2xl border border-[#dce1d2] bg-[#fdfcf9] text-[#293329] opacity-0 shadow-2xl outline-none transition-[opacity,scale] duration-200 data-[state=open]:scale-100 data-[state=open]:opacity-100 max-[700px]:max-h-[94dvh] max-[700px]:w-[calc(100vw-1rem)]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-2xl font-medium tracking-tight", className)}
      {...props}
    />
  );
});

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-base leading-relaxed text-stone-600", className)}
      {...props}
    />
  );
});
