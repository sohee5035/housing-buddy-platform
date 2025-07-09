import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={2000}>
      {toasts.map(function ({ id, title, description, action, duration = 2000, ...props }) {
        return (
          <Toast key={id} duration={duration} {...props}>
            <div className="grid gap-1 w-full">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {/* 진행 바 */}
              <div className="w-full bg-gray-100/50 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full toast-progress-bar"
                  style={{
                    animationDuration: `${duration}ms`
                  }}
                />
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
