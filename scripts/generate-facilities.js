// Generate 140 Fayoum health facilities GeoJSON
const fs = require('fs');

const TYPES = [
  { type: 'emergency', label: 'مستشفى عام / طوارئ', color: '#ef4444' },
  { type: 'insurance', label: 'مستشفى تأمين صحي', color: '#8b5cf6' },
  { type: 'children', label: 'مستشفى أطفال', color: '#3b82f6' },
  { type: 'specialized', label: 'مستشفى تخصصي', color: '#ec4899' },
  { type: 'phc', label: 'وحدة رعاية أساسية', color: '#10b981' },
  { type: 'other', label: 'أخرى', color: '#6b7280' },
];

const AREAS = [
  { name: 'مدينة الفيوم', lat: 29.31, lng: 30.84 },
  { name: 'سنورس', lat: 29.20, lng: 30.75 },
  { name: 'طامية', lat: 29.45, lng: 30.62 },
  { name: 'إطسا', lat: 29.28, lng: 30.92 },
  { name: 'يوسف الصديق', lat: 29.38, lng: 30.55 },
  { name: 'أبشواي', lat: 29.15, lng: 30.88 },
  { name: 'الفيوم الجديدة', lat: 29.35, lng: 30.80 },
  { name: 'segem', lat: 29.25, lng: 30.70 },
];

const SERVICES = {
  emergency: 'الطوارئ، النساء والتوليد، الأطفال، الباطنة، الجراحة، العناية المركزة',
  insurance: 'التأمين الصحي، العيادات الخارجية، التحاليل، الأشعة',
  children: 'أطفال، تحصينات، تغذية أطفال، حضانات',
  specialized: 'نساء وتوليد، قيصرية، متابعة حمل، عقم',
  phc: 'طب أسرة، تحصينات، رعاية حوامل، تخطيط أسرة، متابعة أطفال',
  other: 'عيادات عامة، تحويلات، إسعاف أولي',
};

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const facilities = [];
const idMap = new Set();

// Generate 140 facilities
for (let i = 1; i <= 140; i++) {
  const typeConfig = randomElement(TYPES);
  const area = randomElement(AREAS);
  // Add small random offset to avoid overlapping
  const lat = area.lat + randomFloat(-0.05, 0.05);
  const lng = area.lng + randomFloat(-0.05, 0.05);

  const id = `fayoum-${i}`;
  facilities.push({
    type: 'Feature',
    properties: {
      id,
      name_ar: `${typeConfig.label} - ${area.name} ${i > 8 ? i : ''}`.trim(),
      name_en: `${typeConfig.label} - ${area.name}`,
      type: typeConfig.type,
      phone: `084${Math.floor(200000 + Math.random() * 800000)}`,
      emergency: typeConfig.type === 'emergency' ? true : Math.random() > 0.8,
      services: SERVICES[typeConfig.type],
      address: `${area.name}، محافظة الفيوم`,
      openingHours:
        typeConfig.type === 'emergency'
          ? '24 ساعة'
          : '8 صباحاً - 2 مساءً',
    },
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))],
    },
  });
}

const geojson = {
  type: 'FeatureCollection',
  features: facilities,
};

fs.writeFileSync(
  './public/data/fayoum-facilities.geojson',
  JSON.stringify(geojson, null, 2)
);

console.log(`✓ Generated ${facilities.length} facilities in fayoum-facilities.geojson`);

// Type breakdown
const breakdown = {};
facilities.forEach((f) => {
  const t = f.properties.type;
  breakdown[t] = (breakdown[t] || 0) + 1;
});
console.log('Breakdown:', breakdown);
