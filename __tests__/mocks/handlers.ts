import { http, HttpResponse } from 'msw';

/**
 * MSW Handlers для тестирования API MerchCRM
 * @audit testing
 */
export const handlers = [
  // Брендинг
  http.get('/api/branding/settings', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'mock-branding-id',
        userId: 'test-user-id',
        companyName: 'Тестовая Компания',
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        logoUrl: '/mock-logo.png',
        contactEmail: 'test@example.com',
        contactPhone: '+7 (999) 000-00-00',
        website: 'https://example.com',
        address: 'г. Москва, ул. Тестовая, 1',
        inn: '7700000000',
        kpp: '770001001',
        ogrn: '1000000000000',
        bankAccount: '4242XXXXXXXX42420000',
        bankName: 'ТестБанк',
        bik: '044525000',
        corrAccount: '4242XXXXXXXX42420000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    });
  }),

  // Генерация PDF
  http.post('/api/calculators/export/pdf', async ({ request }) => {
    const data = await request.json();
    
    if (!data) {
      return HttpResponse.json(
        { error: 'Данные расчёта не предоставлены' },
        { status: 400 }
      );
    }

    // Возвращаем пустой blob для тестов
    return new HttpResponse(new Blob(['mock-pdf-content'], { type: 'application/pdf' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="calculation-test.pdf"',
      },
    });
  }),

  // Файлы брендинга
  http.get('/api/files/branding/:filename', () => {
    
    return new HttpResponse(new Blob(['mock-image-content'], { type: 'image/png' }), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }),
];
