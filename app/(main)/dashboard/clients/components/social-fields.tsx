import { Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ClientForm } from "./client-form-fields";

interface SocialFieldsProps {
  form: ClientForm;
  onFieldChange: (name: string, value: string) => void;
}

export function SocialFields({ form, onFieldChange }: SocialFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Telegram
          </label>
          <Input type="text" name="telegram" value={form.telegram || ""} onChange={(e) => onFieldChange("telegram", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
            placeholder="@username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Instagram
          </label>
          <Input type="text" name="instagram" value={form.instagram || ""} onChange={(e) => onFieldChange("instagram", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
            placeholder="insta_link"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Ссылка на соцсеть
          </label>
          <Input type="text" name="socialLink" value={form.socialLink || ""} onChange={(e) => onFieldChange("socialLink", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
            placeholder="vk.com/..."
          />
        </div>
        <div />
      </div>
    </>
  );
}
