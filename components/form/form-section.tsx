import type React from "react"
interface FormSectionProps {
  title: string
  icon?: string
  children: React.ReactNode
}

export default function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6">{children}</div>
    </div>
  )
}
