import os
import base64

svg_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'materials'))
output_ts = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'utils', 'materialImages.ts'))

file_to_key = {
    'copper-scrap.svg': ('copper', 'Copper Scrap', 'COPPER SCRAP', '#EA580C', '#381708'),
    'aluminium-scrap.svg': ('aluminium', 'Aluminium Scrap', 'ALUMINIUM SCRAP', '#38BDF8', '#0F172A'),
    'steel-scrap.svg': ('steel', 'Steel Scrap', 'STEEL SCRAP', '#0284C7', '#0C1929'),
    'iron-scrap.svg': ('iron', 'Iron Scrap', 'IRON SCRAP', '#A8A29E', '#1C1917'),
    'electronic-components.svg': ('electronics', 'Electronic Components', 'ELECTRONIC COMPONENTS', '#10B981', '#064E3B'),
    'electric-motors.svg': ('motor', 'Electric Motors', 'ELECTRIC MOTORS', '#2DD4BF', '#134E4A'),
    'plastic-waste.svg': ('plastic', 'Plastic Waste', 'PLASTIC WASTE', '#38BDF8', '#082F49'),
    'rubber-waste.svg': ('rubber', 'Rubber Waste', 'RUBBER WASTE', '#A1A1AA', '#18181B'),
    'textile-waste.svg': ('textile', 'Textile Waste', 'TEXTILE WASTE', '#818CF8', '#312E81'),
    'wood-waste.svg': ('wood', 'Wood Waste', 'WOOD WASTE', '#F59E0B', '#271A0C'),
    'machinery-parts.svg': ('machinery', 'Machinery Parts', 'MACHINERY PARTS', '#20A486', '#1E293B'),
    'mixed-metal-scrap.svg': ('mixed_metal', 'Mixed Metal Scrap', 'MIXED METAL SCRAP', '#20A486', '#18324B'),
    'brass.svg': ('brass', 'Brass', 'BRASS ALLOY SCRAP', '#FACC15', '#3B2F04'),
    'batteries.svg': ('battery', 'Batteries', 'INDUSTRIAL BATTERIES', '#F97316', '#431407'),
    'packaging-materials.svg': ('packaging', 'Packaging Materials', 'PACKAGING MATERIALS', '#EAB308', '#3F2C0B'),
}

b64_map = {}
for fname, meta in file_to_key.items():
    p = os.path.join(svg_dir, fname)
    with open(p, 'rb') as f:
        b64_map[meta[0]] = 'data:image/svg+xml;base64,' + base64.b64encode(f.read()).decode('utf-8')

ts_content = '''/**
 * Valorize Centralized Material Image Mapping & Placeholder System
 * Provides guaranteed accurate, zero-latency inline SVG assets for all industrial categories.
 * Enforces zero cross-contamination: never displays copper for aluminium/steel/plastic, etc.
 */

export interface MaterialCategoryInfo {
  key: string;
  name: string;
  localPath: string;
  dataUri: string;
  label: string;
  accentColor: string;
  bgColor: string;
}

export const MATERIAL_CATEGORIES_MAP: Record<string, MaterialCategoryInfo> = {
'''

for fname, (key, name, label, accent, bg) in file_to_key.items():
    uri = b64_map[key]
    ts_content += f"""  {key}: {{
    key: '{key}',
    name: '{name}',
    localPath: '/images/materials/{fname}',
    dataUri: '{uri}',
    label: '{label}',
    accentColor: '{accent}',
    bgColor: '{bg}',
  }},
"""

ts_content += '''};

/**
 * Normalizes any category string or listing title to a canonical category key.
 */
export function getCategoryKey(categoryName?: string, title?: string): string {
  const text = `${categoryName || ''} ${title || ''}`.toLowerCase();

  if (text.includes('copper') || text.includes('cu scrap') || text.includes('armature') || text.includes('wire winding')) {
    return 'copper';
  }
  if (text.includes('aluminium') || text.includes('aluminum') || text.includes('6063') || text.includes('extrusion') || text.includes('al scrap')) {
    return 'aluminium';
  }
  if (text.includes('brass') || text.includes('bronze') || text.includes('swarf') || text.includes('c36000')) {
    return 'brass';
  }
  if (text.includes('motor') || text.includes('induction motor') || text.includes('dynamo')) {
    return 'motor';
  }
  if (text.includes('steel') || text.includes('hms') || text.includes('rebar') || text.includes('fe scrap') || text.includes('tmt') || text.includes('structural beam')) {
    return 'steel';
  }
  if (text.includes('iron') || text.includes('cast iron') || text.includes('grey iron') || text.includes('rotor') || text.includes('engine block')) {
    return 'iron';
  }
  if (text.includes('plastic') || text.includes('polymer') || text.includes('hdpe') || text.includes('pet') || text.includes('pp regrind') || text.includes('poly tote')) {
    return 'plastic';
  }
  if (text.includes('rubber') || text.includes('tire') || text.includes('tyre') || text.includes('crumb') || text.includes('conveyor belt')) {
    return 'rubber';
  }
  if (text.includes('wood') || text.includes('timber') || text.includes('sawdust') || text.includes('lumber') || text.includes('biomass')) {
    return 'wood';
  }
  if (text.includes('electronic') || text.includes('pcb') || text.includes('circuit') || text.includes('e-waste') || text.includes('relay')) {
    return 'electronics';
  }
  if (text.includes('machine') || text.includes('machinery') || text.includes('gear') || text.includes('pump') || text.includes('valve') || text.includes('bearing') || text.includes('casing')) {
    return 'machinery';
  }
  if (text.includes('battery') || text.includes('batteries') || text.includes('vrla') || text.includes('lead acid') || text.includes('lithium') || text.includes('ups')) {
    return 'battery';
  }
  if (text.includes('packag') || text.includes('cardboard') || text.includes('carton') || text.includes('pallet') || text.includes('corrugated')) {
    return 'packaging';
  }
  if (text.includes('textile') || text.includes('fabric') || text.includes('cotton') || text.includes('selvedge') || text.includes('yarn') || text.includes('fiber')) {
    return 'textile';
  }
  if (text.includes('mixed metal') || text.includes('composite') || text.includes('alloy turnings')) {
    return 'mixed_metal';
  }

  return 'mixed_metal';
}

/**
 * Returns the verified category image URL (direct data URI) for any material.
 * This guarantees instantaneous rendering with 0 network latency.
 */
export function getCategoryPlaceholder(categoryName?: string, title?: string): string {
  const key = getCategoryKey(categoryName, title);
  const cat = MATERIAL_CATEGORIES_MAP[key] || MATERIAL_CATEGORIES_MAP.mixed_metal;
  return cat.dataUri || cat.localPath;
}

/**
 * Returns local path URL if needed.
 */
export function getCategoryLocalPath(categoryName?: string, title?: string): string {
  const key = getCategoryKey(categoryName, title);
  const cat = MATERIAL_CATEGORIES_MAP[key] || MATERIAL_CATEGORIES_MAP.mixed_metal;
  return cat.localPath;
}

/**
 * Checks whether an image URL is a category placeholder rather than a user photo.
 */
export function isPlaceholderImage(url?: string): boolean {
  if (!url) return true;
  return url.startsWith('/images/materials/') || url.startsWith('data:image/svg+xml');
}

/**
 * Safely resolves the listing image URL according to strict priority:
 * 1. User uploaded image(s) from listing (must not be legacy broken unsplash)
 * 2. Specific material category image data URI
 */
export function getListingImage(listing: {
  category_name?: string;
  title?: string;
  images?: Array<{ image_url: string; is_primary?: boolean }>;
  image_url?: string;
}, index: number = 0): string {
  if (listing.images && listing.images.length > 0) {
    const primary = listing.images.find((img) => img.is_primary);
    const chosen = (index === 0 && primary) ? primary : listing.images[index] || listing.images[0];
    if (chosen?.image_url && !chosen.image_url.includes('photo-1590496793929')) {
      // If it's a relative path to /images/materials/, convert to guaranteed dataUri
      if (chosen.image_url.startsWith('/images/materials/')) {
        return getCategoryPlaceholder(listing.category_name, listing.title);
      }
      return chosen.image_url;
    }
  }

  if (listing.image_url && !listing.image_url.includes('photo-1590496793929')) {
    if (listing.image_url.startsWith('/images/materials/')) {
      return getCategoryPlaceholder(listing.category_name, listing.title);
    }
    return listing.image_url;
  }

  return getCategoryPlaceholder(listing.category_name, listing.title);
}
'''

with open(output_ts, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('Updated', output_ts, 'successfully!')

