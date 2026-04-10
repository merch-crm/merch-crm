'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { 
 getBrandingSettings, 
 saveBrandingSettings, 
 uploadBrandingLogo,
 deleteBrandingLogo,
} from '@/lib/actions/branding';
import { BrandingPageSkeleton } from './components/BrandingPageSkeleton';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { CompanyCard, ColorCard, ContactsCard, DetailsCard } from './components/BrandingCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const brandingSchema = z.object({
 companyName: z.string().min(1, 'Название компании обязательно'),
 primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Некорректный формат цвета'),
 secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Некорректный формат цвета'),
 phone: z.string().optional(),
 email: z.string().email('Некорректный email').optional().or(z.literal('')),
 website: z.string().url('Некорректный URL').optional().or(z.literal('')),
 address: z.string().optional(),
 inn: z.string().optional(),
 kpp: z.string().optional(),
 ogrn: z.string().optional(),
 bankDetails: z.string().optional(),
 footerText: z.string().optional(),
 showQrCode: z.boolean(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export function BrandingPageClient() {
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isUploadingLogo, setIsUploadingLogo] = useState(false);
 const [logoUrl, setLogoUrl] = useState<string | null>(null);
 const [showPreview, setShowPreview] = useState(false);
 const { toast } = useToast();

 const form = useForm<BrandingFormData>({
  resolver: zodResolver(brandingSchema),
  defaultValues: {
   companyName: 'Моя компания',
   primaryColor: '#2563eb',
   secondaryColor: '#64748b',
   phone: '', email: '', website: '', address: '',
   inn: '', kpp: '', ogrn: '', bankDetails: '',
   footerText: '', showQrCode: false,
  },
 });

 useEffect(() => {
  async function loadSettings() {
   const result = await getBrandingSettings();
   if (result.success && result.data) {
    form.reset({ ...result.data, 
     phone: result.data.phone || '', 
     email: result.data.email || '', 
     website: result.data.website || '', 
     address: result.data.address || '', 
     inn: result.data.inn || '', 
     kpp: result.data.kpp || '', 
     ogrn: result.data.ogrn || '', 
     bankDetails: result.data.bankDetails || '', 
     footerText: result.data.footerText || '' 
    });
    setLogoUrl(result.data.logoUrl);
   }
   setIsLoading(false);
  }
  loadSettings();
 }, [form]);

 const onSubmit = async (data: BrandingFormData) => {
  setIsSaving(true);
  const result = await saveBrandingSettings(data);
  if (result.success) toast('Настройки брендинга обновлены', 'success');
  else toast(result.error || 'Не удалось сохранить настройки', 'error');
  setIsSaving(false);
 };

 const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  setIsUploadingLogo(true);
  const formData = new FormData();
  formData.append('logo', file);
  const result = await uploadBrandingLogo(formData);
  if (result.success && result.data) {
   setLogoUrl(result.data.logoUrl);
   toast('Логотип компании успешно обновлён', 'success');
  } else toast(result.error || 'Не удалось загрузить логотип', 'error');
  setIsUploadingLogo(false);
  event.target.value = '';
 };

 const handleLogoDelete = async () => {
  const result = await deleteBrandingLogo();
  if (result.success) {
   setLogoUrl(null);
   toast('Логотип компании удалён', 'success');
  } else toast(result.error || 'Не удалось удалить логотип', 'error');
 };

 if (isLoading) return <BrandingPageSkeleton />;

 return (
  <div className="container max-w-4xl py-6 space-y-3">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-semibold">Настройки брендинга</h1>
     <p className="text-muted-foreground">Настройте информацию о компании для PDF документов</p>
    </div>
    <Button variant="outline" onClick={() => setShowPreview(true)}>
     <Eye className="h-4 w-4 mr-2" /> Предпросмотр
    </Button>
   </div>

   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
    <CompanyCard form={form} logoUrl={logoUrl} isUploadingLogo={isUploadingLogo} onLogoUpload={handleLogoUpload} onLogoDelete={handleLogoDelete} />
    <ColorCard form={form} />
    <ContactsCard form={form} />
    <DetailsCard form={form} />
    
    <Card>
     <CardHeader><CardTitle>Дополнительные настройки</CardTitle></CardHeader>
     <CardContent className="space-y-3">
      <div className="space-y-2">
       <Label htmlFor="footerText">Текст в подвале документа</Label>
       <Input id="footerText" {...form.register('footerText')} placeholder="Спасибо за сотрудничество!" />
      </div>
      <div className="flex items-center justify-between">
       <div className="space-y-0.5">
        <Label htmlFor="showQrCode">QR-код со ссылкой на сайт</Label>
        <p className="text-sm text-muted-foreground">Добавляет QR-код в документы</p>
       </div>
       <Switch id="showQrCode" checked={form.watch('showQrCode')} onCheckedChange={(checked) => form.setValue('showQrCode', checked)} />
      </div>
     </CardContent>
    </Card>

    <div className="flex justify-end">
     <Button type="submit" disabled={isSaving}>
      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
      Сохранить настройки
     </Button>
    </div>
   </form>

   <PDFPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} branding={{ ...form.getValues(), phone: form.getValues().phone || null, email: form.getValues().email || null, website: form.getValues().website || null, address: form.getValues().address || null, inn: form.getValues().inn || null, kpp: form.getValues().kpp || null, ogrn: form.getValues().ogrn || null, bankDetails: form.getValues().bankDetails || null, footerText: form.getValues().footerText || null, id: '', userId: '', logoUrl: logoUrl || '', createdAt: new Date(), updatedAt: new Date() }} /> {/* // suppressHydrationWarning */}
  </div>
 );
}
