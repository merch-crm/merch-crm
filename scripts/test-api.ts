async function test() {
    const projectId = 'iraznlahcwjbszrkyhqc';
    const url = `https://${projectId}.supabase.co/rest/v1/`;
    console.log(`Testing API: ${url}`);
    try {
        const start = Date.now();
        const res = await fetch(url);
        console.log(`✅ API Response status: ${res.status} (took ${Date.now() - start}ms)`);
    } catch (err: any) {
        console.log(`❌ API Error: ${err.message}`);
    }
}

test();
