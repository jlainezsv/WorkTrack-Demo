import { useRef } from "react"
import { Clock3Icon } from "lucide-react"

import { Field, FieldLabel } from "@/ui/components/ui/field"
import { Input } from "@/ui/components/ui/input"

interface NativeTimeFieldProps {
  id: string
  label: string
  value: string
  required?: boolean
  onChange: (value: string) => void
}

export function NativeTimeField({ id, label, value, required, onChange }: NativeTimeFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const input = inputRef.current

    if (!input) {
      return
    }

    input.focus()
    input.showPicker?.()
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative" onClick={openPicker}>
        <Input
          ref={inputRef}
          id={id}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="native-time-input bg-background pr-10"
          required={required}
        />
        <Clock3Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
      </div>
    </Field>
  )
}