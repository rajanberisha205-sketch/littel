(function() {
    // 1. Finde den Container auf der fremden Website
    const container = document.getElementById('fasqoo-widget-container');
    if (!container) return;

    // 2. Erstelle das moderne, professionelle Design
    container.style.width = '100%';
    container.style.maxWidth = '350px'; // Perfekte Größe auch für Handys
    container.style.margin = '0 auto';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // 3. Das HTML des Widgets inkl. iFrame und Fasqoo-Branding
    container.innerHTML = `
        <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease;"
             onmouseover="this.style.boxShadow='0 15px 35px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';"
             onmouseout="this.style.boxShadow='0 10px 30px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
            
            <!-- Dein Lite-Speedtest -->
            <iframe src="https://lite.fasqoo.com/" width="100%" height="240px" style="border: none; display: block;" title="Fasqoo Speedtest"></iframe>
            
            <!-- Professioneller Footer mit Backlink -->
            <div style="background: #f8fafc; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0;">
                <span style="font-size: 11px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Netzwerk-Diagnose</span>
                <a href="https://fasqoo.com" target="_blank" rel="noopener" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                    Powered by Fasqoo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
        </div>
    `;
})();
