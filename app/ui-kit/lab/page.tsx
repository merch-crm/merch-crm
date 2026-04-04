"use client";

import React from 'react';
import { CategoryPage } from '@/components/ui-kit';

// Custom Components
import { MetricCard as CustomMetricCard } from '@/components/library/custom/components/metric-card';

// Library Components (Free Only)
import { CardBody, CardContainer, CardItem } from '@/components/library/aceternity/components/3d-card';
import { BlurText } from '@/components/library/reactbits/text-animations/blur-text';


export default function LabPage() {
  return (
    <CategoryPage 
      title="Comparison Lab" 
      description="Сравнение кастомных CRM-компонентов и лучших решений из внешних библиотек (Free Tier)."
      count={4}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Metric Cards Comparison */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-2">1. Metric Cards</h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-2xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400  mb-4">Custom CRM Implementation</p>
              <CustomMetricCard 
                title="Total Revenue" 
                value="₽1.240.000" 
                trend="up"
                change={14.2}
                changeLabel="vs last month"
              />
            </div>
            
            <div className="p-4 border rounded-2xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400  mb-4">Aceternity 3D Perspective Card</p>
              <CardContainer className="inter-var">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-auto rounded-xl p-6 border">
                  <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
                    ₽1.240.000
                  </CardItem>
                  <CardItem as="p" translateZ="60" className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
                    Total Revenue (Interactive View)
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-4">
                     <div className="h-2 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                        <div className="h-full w-[82%] bg-emerald-500" />
                     </div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>
          </div>
        </div>

        {/* Text Animations Comparison */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-2">2. Text Animations</h3>
           <div className="space-y-3">
            <div className="p-4 border rounded-2xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400  mb-4">Custom CSS Reveal</p>
              <h2 className="text-3xl font-black animate-in fade-in blur-in duration-1000">
                Premium CRM
              </h2>
            </div>
            
            <div className="p-4 border rounded-2xl bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400  mb-4">ReactBits BlurText (JS-Driven)</p>
              <BlurText
                text="Premium CRM"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-3xl font-black mb-8"
              />
            </div>
          </div>
        </div>

      </div>
    </CategoryPage>
  );
}
