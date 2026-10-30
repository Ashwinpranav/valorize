import os

svg_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'materials'))
os.makedirs(svg_dir, exist_ok=True)

svgs = {
    'copper-scrap.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#381708"/><stop offset="100%" stop-color="#180A04"/>
    </linearGradient>
    <linearGradient id="cu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FB923C"/><stop offset="50%" stop-color="#EA580C"/><stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
    <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FDBA74"/><stop offset="50%" stop-color="#F97316"/><stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#bg)"/>
  <rect width="600" height="400" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <g transform="translate(50, 40)">
    <path d="M100 240 L380 240 L440 200 L160 200 Z" fill="url(#cu)" stroke="#FED7AA" stroke-width="2" opacity="0.9"/>
    <path d="M100 240 L100 260 L380 260 L380 240 Z" fill="#7C2D12"/>
    <ellipse cx="240" cy="150" rx="140" ry="50" fill="none" stroke="url(#wire)" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="240" cy="180" rx="140" ry="50" fill="none" stroke="url(#wire)" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="240" cy="210" rx="140" ry="50" fill="none" stroke="url(#wire)" stroke-width="16" stroke-linecap="round"/>
    <path d="M100 150 v60 M380 150 v60" stroke="#EA580C" stroke-width="14" stroke-linecap="round"/>
    <path d="M40 220 Q140 100 240 160 T440 190" fill="none" stroke="#FDBA74" stroke-width="8" stroke-linecap="round" opacity="0.85"/>
    <path d="M60 240 Q160 120 260 180 T460 210" fill="none" stroke="#FED7AA" stroke-width="6" stroke-linecap="round" opacity="0.75"/>
    <path d="M30 190 Q120 70 220 130 T420 160" fill="none" stroke="#FB923C" stroke-width="7" stroke-linecap="round" opacity="0.9"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#EA580C" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#EA580C"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FED7AA" letter-spacing="1.5">COPPER SCRAP • BUNDLED WIRE &amp; BUSBARS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#20A486" text-anchor="end">99.2% Cu GRADE</text>
</svg>''',

    'aluminium-scrap.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="albg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/><stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="alGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F1F5F9"/><stop offset="40%" stop-color="#CBD5E1"/><stop offset="70%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#albg)"/>
  <g transform="translate(80, 50)">
    <polygon points="40,90 280,90 220,170 0,170" fill="url(#alGrad)" stroke="#FFFFFF" stroke-width="2"/>
    <polygon points="280,90 340,140 220,170" fill="#475569" stroke="#CBD5E1" stroke-width="1.5"/>
    <polygon points="120,150 360,150 300,230 80,230" fill="url(#alGrad)" stroke="#FFFFFF" stroke-width="2"/>
    <polygon points="360,150 420,200 300,230" fill="#334155" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="70" y="110" width="140" height="20" rx="4" fill="#1E293B" opacity="0.8"/>
    <rect x="150" y="170" width="140" height="20" rx="4" fill="#0F172A" opacity="0.8"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#94A3B8" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#38BDF8"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#E2E8F0" letter-spacing="1.5">ALUMINIUM SCRAP • 6063 EXTRUSIONS &amp; OFFCUTS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="end">AEROSPACE &amp; ARCHITECTURAL</text>
</svg>''',

    'steel-scrap.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="feBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0C1929"/><stop offset="100%" stop-color="#040810"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#475569"/><stop offset="50%" stop-color="#334155"/><stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#feBg)"/>
  <g transform="translate(100, 40)">
    <path d="M40 70 H320 V110 H220 V190 H320 V230 H40 V190 H140 V110 H40 Z" fill="url(#steel)" stroke="#38BDF8" stroke-width="3"/>
    <polygon points="320,70 380,110 380,270 320,230" fill="#0F172A" stroke="#0284C7" stroke-width="2"/>
    <polygon points="220,110 280,150 280,230 220,190" fill="#1E293B" opacity="0.9"/>
    <line x1="20" y1="250" x2="390" y2="250" stroke="#0284C7" stroke-width="12" stroke-dasharray="14 6" stroke-linecap="round"/>
    <line x1="50" y1="270" x2="360" y2="270" stroke="#0369A1" stroke-width="10" stroke-dasharray="14 6" stroke-linecap="round"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#0284C7" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#0284C7"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#BAE6FD" letter-spacing="1.5">STEEL SCRAP • HMS 1 &amp; STRUCTURAL BEAMS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="end">HEAVY MELTING</text>
</svg>''',

    'iron-scrap.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ironBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1C1917"/><stop offset="100%" stop-color="#0C0A09"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#ironBg)"/>
  <g transform="translate(110, 50)">
    <rect x="40" y="70" width="300" height="160" rx="16" fill="#292524" stroke="#78716C" stroke-width="4"/>
    <circle cx="190" cy="150" r="55" fill="#1C1917" stroke="#A8A29E" stroke-width="6"/>
    <circle cx="190" cy="150" r="25" fill="#0C0A09" stroke="#57534E" stroke-width="4"/>
    <circle cx="190" cy="110" r="6" fill="#D6D3D1"/>
    <circle cx="190" cy="190" r="6" fill="#D6D3D1"/>
    <circle cx="150" cy="150" r="6" fill="#D6D3D1"/>
    <circle cx="230" cy="150" r="6" fill="#D6D3D1"/>
    <line x1="60" y1="90" x2="110" y2="90" stroke="#57534E" stroke-width="5" stroke-linecap="round"/>
    <line x1="60" y1="115" x2="110" y2="115" stroke="#57534E" stroke-width="5" stroke-linecap="round"/>
    <line x1="60" y1="140" x2="110" y2="140" stroke="#57534E" stroke-width="5" stroke-linecap="round"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#78716C" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#A8A29E"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#E7E5E4" letter-spacing="1.5">CAST IRON SCRAP • ROTORS &amp; MACHINERY CASINGS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#A8A29E" text-anchor="end">FOUNDRY GRADE</text>
</svg>''',

    'electronic-components.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="pcbBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#022C22"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#pcbBg)"/>
  <g transform="translate(90, 45)">
    <rect x="20" y="40" width="380" height="220" rx="12" fill="#047857" stroke="#34D399" stroke-width="4"/>
    <rect x="150" y="90" width="120" height="100" rx="6" fill="#022C22" stroke="#F59E0B" stroke-width="3"/>
    <circle cx="210" cy="140" r="24" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
    <path d="M50 70 H150 M50 110 H150 M50 150 H150 M50 190 H150" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
    <path d="M270 90 H370 M270 130 H370 M270 170 H370 M270 210 H370" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
    <circle cx="70" cy="70" r="5" fill="#F59E0B"/>
    <circle cx="90" cy="110" r="5" fill="#F59E0B"/>
    <circle cx="350" cy="90" r="5" fill="#F59E0B"/>
    <circle cx="330" cy="170" r="5" fill="#F59E0B"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#10B981" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#10B981"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#A7F3D0" letter-spacing="1.5">ELECTRONIC COMPONENTS • PCBs &amp; RELAYS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#FBBF24" text-anchor="end">PRECIOUS METALS</text>
</svg>''',

    'electric-motors.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="motBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#134E4A"/><stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#motBg)"/>
  <g transform="translate(110, 45)">
    <rect x="60" y="70" width="240" height="160" rx="20" fill="#0F766E" stroke="#5EEAD4" stroke-width="4"/>
    <line x1="100" y1="70" x2="100" y2="230" stroke="#115E59" stroke-width="6"/>
    <line x1="140" y1="70" x2="140" y2="230" stroke="#115E59" stroke-width="6"/>
    <line x1="180" y1="70" x2="180" y2="230" stroke="#115E59" stroke-width="6"/>
    <line x1="220" y1="70" x2="220" y2="230" stroke="#115E59" stroke-width="6"/>
    <line x1="260" y1="70" x2="260" y2="230" stroke="#115E59" stroke-width="6"/>
    <rect x="300" y="125" width="70" height="50" rx="6" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3"/>
    <rect x="130" y="40" width="90" height="35" rx="6" fill="#14B8A6" stroke="#CCFBF1" stroke-width="3"/>
    <rect x="60" y="230" width="50" height="20" rx="4" fill="#042F2E"/>
    <rect x="250" y="230" width="50" height="20" rx="4" fill="#042F2E"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#2DD4BF" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#2DD4BF"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#CCFBF1" letter-spacing="1.5">ELECTRIC MOTORS • 3-PHASE INDUCTION &amp; PUMPS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#2DD4BF" text-anchor="end">REUSABLE / REWIND</text>
</svg>''',

    'plastic-waste.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="polyBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#082F49"/><stop offset="100%" stop-color="#021626"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#polyBg)"/>
  <g transform="translate(120, 50)">
    <path d="M80 80 L260 80 L300 240 L40 240 Z" fill="#0284C7" stroke="#38BDF8" stroke-width="4"/>
    <ellipse cx="170" cy="80" rx="90" ry="22" fill="#0369A1" stroke="#7DD3FC" stroke-width="3"/>
    <path d="M55 130 Q170 160 285 130" fill="none" stroke="#38BDF8" stroke-width="6"/>
    <path d="M48 180 Q170 210 292 180" fill="none" stroke="#38BDF8" stroke-width="6"/>
    <polygon points="290,140 330,120 340,160 310,170" fill="#38BDF8" opacity="0.9"/>
    <polygon points="320,190 360,180 350,220 310,210" fill="#7DD3FC" opacity="0.9"/>
    <polygon points="260,210 290,200 285,230 250,230" fill="#BAE6FD" opacity="0.9"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#0284C7" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#38BDF8"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#BAE6FD" letter-spacing="1.5">PLASTIC WASTE • HDPE DRUMS &amp; REGRIND FLAKES</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#38BDF8" text-anchor="end">POLYMER RECYCLE</text>
</svg>''',

    'machinery-parts.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="machBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#machBg)"/>
  <g transform="translate(110, 40)">
    <circle cx="140" cy="140" r="80" fill="#334155" stroke="#20A486" stroke-width="8" stroke-dasharray="25 15"/>
    <circle cx="140" cy="140" r="35" fill="#0F172A" stroke="#5EEAD4" stroke-width="5"/>
    <circle cx="270" cy="190" r="55" fill="#475569" stroke="#38BDF8" stroke-width="7" stroke-dasharray="20 12"/>
    <circle cx="270" cy="190" r="22" fill="#0F172A" stroke="#BAE6FD" stroke-width="4"/>
    <rect x="135" y="100" width="10" height="20" fill="#5EEAD4"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#20A486" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#20A486"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#CCFBF1" letter-spacing="1.5">MACHINERY PARTS • GEARBOXES &amp; PUMP HOUSINGS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#20A486" text-anchor="end">REFURBISHABLE</text>
</svg>''',

    'brass.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="brassBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B2F04"/><stop offset="100%" stop-color="#1C1601"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#brassBg)"/>
  <g transform="translate(120, 50)">
    <circle cx="140" cy="150" r="70" fill="#854D0E" stroke="#FACC15" stroke-width="8"/>
    <circle cx="140" cy="150" r="30" fill="#3B2F04" stroke="#FEF08A" stroke-width="4"/>
    <polygon points="200,120 310,80 310,220 200,180" fill="#A16207" stroke="#EAB308" stroke-width="6"/>
    <line x1="310" y1="80" x2="340" y2="70" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
    <line x1="310" y1="220" x2="340" y2="230" stroke="#FDE047" stroke-width="7" stroke-linecap="round"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#EAB308" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#FACC15"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FEF08A" letter-spacing="1.5">BRASS ALLOY SCRAP • TURNINGS &amp; VALVES</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#FACC15" text-anchor="end">FREE CUTTING</text>
</svg>''',

    'batteries.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="batBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#431407"/><stop offset="100%" stop-color="#180501"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#batBg)"/>
  <g transform="translate(120, 50)">
    <rect x="50" y="80" width="260" height="160" rx="12" fill="#7C2D12" stroke="#FB923C" stroke-width="5"/>
    <rect x="90" y="55" width="40" height="25" rx="4" fill="#EA580C" stroke="#FED7AA" stroke-width="3"/>
    <rect x="230" y="55" width="40" height="25" rx="4" fill="#EA580C" stroke="#FED7AA" stroke-width="3"/>
    <path d="M105 125 H115 M110 120 V130" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <path d="M245 125 H255" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <polygon points="180,105 165,150 195,150 180,205" fill="#FDE047" stroke="#CA8A04" stroke-width="2"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#F97316" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#F97316"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FED7AA" letter-spacing="1.5">INDUSTRIAL BATTERIES • TELECOM VRLA &amp; TRACTION</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#F97316" text-anchor="end">LEAD RECOVERY</text>
</svg>''',

    'packaging-materials.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="packBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3F2C0B"/><stop offset="100%" stop-color="#181003"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#packBg)"/>
  <g transform="translate(120, 45)">
    <polygon points="180,60 300,110 180,160 60,110" fill="#B45309" stroke="#FDE047" stroke-width="3"/>
    <polygon points="60,110 180,160 180,240 60,190" fill="#92400E" stroke="#F59E0B" stroke-width="3"/>
    <polygon points="300,110 180,160 180,240 300,190" fill="#78350F" stroke="#D97706" stroke-width="3"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#EAB308" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#EAB308"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FEF08A" letter-spacing="1.5">PACKAGING MATERIALS • PALLETS &amp; CARDBOARD</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#EAB308" text-anchor="end">REUSABLE SURPLUS</text>
</svg>''',

    'textile-waste.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="texBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#312E81"/><stop offset="100%" stop-color="#111038"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#texBg)"/>
  <g transform="translate(110, 45)">
    <ellipse cx="150" cy="150" rx="60" ry="80" fill="#4338CA" stroke="#A5B4FC" stroke-width="6"/>
    <ellipse cx="240" cy="160" rx="50" ry="70" fill="#3730A3" stroke="#818CF8" stroke-width="5"/>
    <path d="M90 150 Q180 80 270 150 T360 170" fill="none" stroke="#C7D2FE" stroke-width="7" stroke-linecap="round"/>
    <path d="M80 180 Q170 110 260 180 T350 200" fill="none" stroke="#E0E7FF" stroke-width="5" stroke-linecap="round"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#818CF8" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#818CF8"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#E0E7FF" letter-spacing="1.5">TEXTILE WASTE • BALED COTTON SELVEDGE &amp; YARN</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#818CF8" text-anchor="end">SPINNING RECYCLE</text>
</svg>''',

    'rubber-waste.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="rubBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18181B"/><stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#rubBg)"/>
  <g transform="translate(120, 50)">
    <ellipse cx="180" cy="140" rx="120" ry="70" fill="#27272A" stroke="#71717A" stroke-width="14" stroke-dasharray="20 10"/>
    <ellipse cx="180" cy="140" rx="60" ry="35" fill="#09090B" stroke="#A1A1AA" stroke-width="6"/>
    <path d="M80 180 Q180 230 280 180" fill="none" stroke="#E4E4E7" stroke-width="5" stroke-dasharray="10 10"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#71717A" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#A1A1AA"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#F4F4F5" letter-spacing="1.5">RUBBER WASTE • INDUSTRIAL TIRES &amp; BELTING</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#A1A1AA" text-anchor="end">CRUMB RECLAIM</text>
</svg>''',

    'wood-waste.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="woodBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#271A0C"/><stop offset="100%" stop-color="#0F0A04"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#woodBg)"/>
  <g transform="translate(110, 50)">
    <ellipse cx="110" cy="140" rx="45" ry="65" fill="#78350F" stroke="#D97706" stroke-width="6"/>
    <ellipse cx="110" cy="140" rx="25" ry="35" fill="#451A03" stroke="#F59E0B" stroke-width="4"/>
    <path d="M110 75 L320 100 L320 230 L110 205 Z" fill="#92400E" stroke="#B45309" stroke-width="4"/>
    <ellipse cx="320" cy="165" rx="35" ry="65" fill="#B45309" stroke="#FBBF24" stroke-width="5"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#D97706" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#F59E0B"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#FEF3C7" letter-spacing="1.5">WOOD WASTE • TIMBER OFFCUTS &amp; SAWDUST</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#F59E0B" text-anchor="end">BIOMASS &amp; CHIPS</text>
</svg>''',

    'mixed-metal-scrap.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="mixBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#18324B"/><stop offset="100%" stop-color="#081420"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#mixBg)"/>
  <g transform="translate(110, 45)">
    <circle cx="140" cy="140" r="65" fill="#334155" stroke="#38BDF8" stroke-width="7"/>
    <polygon points="210,90 320,120 290,210 180,180" fill="#9A3412" stroke="#FB923C" stroke-width="6"/>
    <ellipse cx="270" cy="190" rx="55" ry="35" fill="#CA8A04" stroke="#FACC15" stroke-width="6"/>
  </g>
  <rect x="30" y="335" width="540" height="42" rx="10" fill="rgba(15,23,42,0.85)" stroke="#20A486" stroke-width="1.5"/>
  <circle cx="55" cy="356" r="6" fill="#20A486"/>
  <text x="75" y="361" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="800" fill="#E2E8F0" letter-spacing="1.5">MIXED METAL SCRAP • MULTI-ALLOY TURNINGS</text>
  <text x="545" y="361" font-family="'Inter', system-ui, sans-serif" font-size="11" font-weight="700" fill="#20A486" text-anchor="end">SECONDARY SMELT</text>
</svg>'''
}

for filename, content in svgs.items():
    path = os.path.join(svg_dir, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

print(f'Successfully generated {len(svgs)} material SVGs in {svg_dir}')
