import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group font-technical"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-2 group-[.toaster]:border-[#333] group-[.toaster]:shadow-none group-[.toaster]:rounded-none group-[.toaster]:p-4",
          description: "group-[.toast]:text-[#888]",
          actionButton: "group-[.toast]:bg-[#CCFF00] group-[.toast]:text-black",
          cancelButton: "group-[.toast]:bg-black group-[.toast]:text-[#888] group-[.toast]:border-[#333]",
          success: "group-[.toaster]:border-[#CCFF00] group-[.toaster]:text-[#CCFF00]",
          error: "group-[.toaster]:border-[#FF2A2A] group-[.toaster]:text-[#FF2A2A]",
        },
      }}
      {...props}
    />
  )
}
