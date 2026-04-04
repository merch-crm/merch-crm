
"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { DeliveryTracker } from '@/components/ui/delivery-tracker/DeliveryTracker';
import { DeliveryInfo } from '@/components/ui/delivery-tracker/types';

export default function BusinessPage() {
  return (
    <CategoryPage title="Бизнес и CRM" description="Специализированные инструменты для управления сделками, заказами и лояльностью клиентов." count={1}>
      
      <ComponentShowcase 
        title="Трекер доставки (Custom)" 
        source="custom" 
        desc="Интерактивный трекер доставки со статусами и историей событий." 
        importPath="import { DeliveryTracker } from '@/components/ui/delivery-tracker/DeliveryTracker'" 
        code={`<DeliveryTracker delivery={mockDelivery} />`}
      >
        <div className="max-w-md w-full mx-auto">
           <DeliveryTracker delivery={MOCK_DELIVERY} />
        </div>
      </ComponentShowcase>

    </CategoryPage>
  );
}

const MOCK_DELIVERY: DeliveryInfo = {
  trackingNumber: '1425678901',
  provider: 'cdek',
  status: 'in_transit',
  events: [
    { id: '1', status: 'created', title: 'Создан', timestamp: new Date('2025-04-01T10:00:00Z'), location: 'Москва' },
    { id: '2', status: 'accepted', title: 'Принят', timestamp: new Date('2025-04-01T14:30:00Z'), location: 'Склад МСК-1' },
    { id: '3', status: 'in_transit', title: 'В пути', timestamp: new Date('2025-04-02T09:15:00Z'), location: 'В пути в Санкт-Петербург' }
  ],
  lastUpdate: new Date(),
  senderCity: 'Москва',
  receiverCity: 'Санкт-Петербург'
};
