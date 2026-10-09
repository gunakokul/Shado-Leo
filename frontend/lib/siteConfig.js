export const siteConfig = {
  name: 'Shadow Leo',
  tagline: 'Premium Photography, Videography, and cherished keepsakes.',
  address: 'Main Street, Batticaloa, Sri Lanka, 30150',
  serviceAreas: ['Colombo', 'Jaffna', 'Kandy', 'Batticaloa'],
  phone: '075 460 5386',
  email: 'shadowleo2020@gmail.com',
  hours: 'Always Open (24/7 Service Support)',
  specialties: [
    'Premium Photography',
    'Videography',
    'In-store Pickup for Physical Albums/Prints',
  ],
  services: [
    {
      id: 'premium-photography',
      name: 'Premium Photography',
      price: 'From Rs. 1,200,000',
      rate: 1200000,
      description: 'High-end portrait, wedding, and commercial photography packages crafted for refined storytelling.',
      highlights: ['Wedding coverage', 'Portrait direction', 'Commercial brand sessions', 'Retouched gallery delivery'],
    },
    {
      id: 'professional-videography',
      name: 'Professional Videography',
      price: 'From Rs. 1,800,000',
      rate: 1800000,
      description: 'Cinematic film and event videography options tailored for special occasions and memorable brand moments.',
      highlights: ['Highlight reels', 'Event coverage', 'Brand films', 'Cinematic editing'],
    },
    {
      id: 'photo-printing',
      name: 'Photo Printing Services',
      price: 'From Rs. 40,000',
      rate: 40000,
      description: 'High-quality photo printing in various sizes, finished for gifting, display, and studio delivery.',
      highlights: ['Multiple print sizes', 'Fine art finishes', 'Studio pickup option', 'Archival-quality paper'],
    },
    {
      id: 'custom-album',
      name: 'Custom Album Making',
      price: 'From Rs. 250,000',
      rate: 250000,
      description: 'Designing and crafting bespoke physical albums that preserve milestones in a tactile, collectible format.',
      highlights: ['Custom layouts', 'Premium materials', 'Durable binding', 'Personal design review'],
    },
    {
      id: 'in-store-pickup',
      name: 'In-Store Pickup',
      price: 'Included',
      rate: 0,
      description: 'Clients can collect printed photos and physical albums directly from the studio at their convenience.',
      highlights: ['Direct studio collection', 'Photographic print pickup', 'Album handoff', 'Flexible scheduling'],
    },
  ],
  rentalItems: [
    {
      id: 'aputure-300d',
      name: 'Aputure 300D Pro Light',
      category: 'Lighting',
      rate: 35000,
      description: 'Compact, punchy LED light with excellent color accuracy for portraits and commercial scenes.',
    },
    {
      id: 'softbox-55',
      name: '55" Softbox Kit',
      category: 'Lighting Modifier',
      rate: 22000,
      description: 'Soft diffusion setup for flattering portraits, product work, and even lighting.',
    },
    {
      id: 'focus-lens-35mm',
      name: 'Canon EF 35mm f/1.4 Lens',
      category: 'Lens',
      rate: 28000,
      description: 'Wide-angle prime lens for clean storytelling, architecture, and intimate detail shots.',
    },
    {
      id: 'tripod-pro',
      name: 'Pro Carbon Tripod',
      category: 'Support',
      rate: 18000,
      description: 'Stable support for long exposures, interviews, and dynamic cinematic coverage.',
    },
  ],
  about:
    'Shadow Leo captures timeless visual stories through premium photography, cinematic videography, and personal print experiences tailored for families, brands, and unforgettable moments.',
}

export const contactInfoCards = [
  {
    label: 'Primary Address',
    value: siteConfig.address,
  },
  {
    label: 'Service Areas',
    value: siteConfig.serviceAreas.join(', '),
  },
  {
    label: 'Phone',
    value: siteConfig.phone,
  },
  {
    label: 'Email',
    value: siteConfig.email,
  },
  {
    label: 'Operating Hours',
    value: siteConfig.hours,
  },
  {
    label: 'Services & Specialities',
    value: siteConfig.specialties.join(' • '),
  },
]
