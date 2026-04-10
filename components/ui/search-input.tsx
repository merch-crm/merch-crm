import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Поиск...", ...props }: SearchInputProps) {
  return (
    <div className="relative flex-1 w-full max-w-md group/search">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors duration-300" />
      <Input placeholder={placeholder} value={value} onChange={onChange} className="pl-10 h-11 bg-white border-slate-100 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all duration-300 placeholder:text-slate-400" {...props} />
    </div>
  )
}
