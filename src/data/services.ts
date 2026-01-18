import type { Service } from '@/types';
import meliPlusLogo from '@/assets/pill-meliplus@3x.png';

// Streaming Services
export const streamingServices: Service[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://unavatar.io/netflix.com',
    avgPriceMin: 21,
    avgPriceMax: 60,
    cancelUrl: 'https://www.netflix.com/cancelplan',
    howToCancel: 'Acesse Conta > Cancelar assinatura',
    plans: [
      { label: 'Padrão c/ anúncios', price: 20.90 },
      { label: 'Padrão', price: 44.90 },
      { label: 'Premium', price: 59.90 }
    ]
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    logo: 'https://unavatar.io/disneyplus.com',
    avgPriceMin: 28,
    avgPriceMax: 67,
    cancelUrl: 'https://www.disneyplus.com/account',
    howToCancel: 'Entre em Conta > Assinatura > Cancelar',
    plans: [
      { label: 'Básico (com anúncios)', price: 27.90 },
      { label: 'Premium (sem anúncios)', price: 43.90 }
    ]
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    logo: 'https://unavatar.io/primevideo.com',
    avgPriceMin: 20,
    avgPriceMax: 30,
    cancelUrl: 'https://www.amazon.com.br/gp/help/customer/display.html?nodeId=G34EUPKVMYFW8N2U',
    howToCancel: 'Amazon.com.br > Minha conta > Prime > Cancelar'
  },
  {
    id: 'hbo-max',
    name: 'Max (HBO Max)',
    logo: 'https://unavatar.io/max.com',
    avgPriceMin: 30,
    avgPriceMax: 56,
    cancelUrl: 'https://www.max.com/account',
    howToCancel: 'Perfil > Assinatura > Cancelar',
    plans: [
      { label: 'Básico (com anúncios)', price: 29.90 },
      { label: 'Padrão', price: 44.90 },
      { label: 'Platinum', price: 55.90 }
    ]
  },
  {
    id: 'globoplay',
    name: 'Globoplay',
    logo: 'https://unavatar.io/globoplay.globo.com',
    avgPriceMin: 23,
    avgPriceMax: 40,
    howToCancel: 'Minha Conta > Assinatura > Cancelar',
    cancelUrl: 'https://globoplay.globo.com/minha-conta/assinaturas'
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    logo: 'https://unavatar.io/apple.com',
    avgPriceMin: 30,
    avgPriceMax: 30,
    cancelUrl: 'https://support.apple.com/pt-br/HT202039',
    howToCancel: 'Configurações > [seu nome] > Assinaturas > Cancelar'
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    logo: 'https://unavatar.io/paramountplus.com',
    avgPriceMin: 19,
    avgPriceMax: 35,
    howToCancel: 'Conta > Assinatura > Cancelar',
    cancelUrl: 'https://www.paramountplus.com/br/account/'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    logo: 'https://unavatar.io/spotify.com',
    avgPriceMin: 24,
    avgPriceMax: 41,
    cancelUrl: 'https://www.spotify.com/br/account/subscription/',
    howToCancel: 'Conta > Sua assinatura > Cancelar Premium',
    plans: [
      { label: 'Individual', price: 21.90 },
      { label: 'Duo', price: 27.90 },
      { label: 'Família', price: 34.90 }
    ]
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    logo: 'https://unavatar.io/youtube.com',
    avgPriceMin: 20,
    avgPriceMax: 35,
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    howToCancel: 'Configurações > Compras e assinaturas > Cancelar',
    plans: [
      { label: 'Individual', price: 24.90 },
      { label: 'Família', price: 34.90 }
    ]
  },
  {
    id: 'deezer',
    name: 'Deezer',
    logo: 'https://unavatar.io/deezer.com',
    avgPriceMin: 25,
    avgPriceMax: 40,
    howToCancel: 'Minha conta > Assinatura > Cancelar'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    logo: 'https://unavatar.io/music.apple.com',
    avgPriceMin: 22,
    avgPriceMax: 43,
    cancelUrl: 'https://support.apple.com/pt-br/HT204939',
    howToCancel: 'Configurações > [seu nome] > Assinaturas > Cancelar'
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    logo: 'https://unavatar.io/crunchyroll.com',
    avgPriceMin: 20,
    avgPriceMax: 35,
    howToCancel: 'Configurações > Premium > Cancelar'
  }
];

// Utilitários Services
export const utilitariosServices: Service[] = [
  {
    id: 'icloud',
    name: 'iCloud',
    logo: 'https://unavatar.io/icloud.com',
    avgPriceMin: 5,
    avgPriceMax: 50,
    cancelUrl: 'https://support.apple.com/pt-br/HT207594',
    howToCancel: 'Ajustes > [seu nome] > iCloud > Gerenciar armazenamento'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    logo: 'https://unavatar.io/google.com',
    avgPriceMin: 8,
    avgPriceMax: 60,
    howToCancel: 'Google One > Configurações > Cancelar plano de armazenamento'
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    logo: 'https://unavatar.io/microsoft.com',
    avgPriceMin: 30,
    avgPriceMax: 100,
    cancelUrl: 'https://account.microsoft.com/services',
    howToCancel: 'Serviços e assinaturas > Gerenciar > Cancelar'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    logo: 'https://unavatar.io/dropbox.com',
    avgPriceMin: 50,
    avgPriceMax: 150,
    cancelUrl: 'https://www.dropbox.com/account/plan',
    howToCancel: 'Configurações > Plano > Cancelar'
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    logo: 'https://unavatar.io/nordvpn.com',
    avgPriceMin: 20,
    avgPriceMax: 40,
    howToCancel: 'Conta > Assinaturas > Cancelar renovação automática'
  }
];

// Produtividade Services
export const produtividadeServices: Service[] = [
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    logo: 'https://unavatar.io/openai.com',
    avgPriceMin: 100,
    avgPriceMax: 170,
    cancelUrl: 'https://platform.openai.com/account/billing/overview',
    howToCancel: 'Settings > Manage subscription > Cancel plan',
    plans: [
      { label: 'Plus', price: 115.00 },
      { label: 'Team', price: 170.00 }
    ]
  },
  {
    id: 'gemini-advanced',
    name: 'Gemini Advanced',
    logo: 'https://unavatar.io/gemini.google.com',
    avgPriceMin: 97,
    avgPriceMax: 97,
    cancelUrl: 'https://one.google.com/about/plans',
    howToCancel: 'Google One > Configurações > Gerenciar assinatura > Cancelar',
    plans: [
      { label: 'Google One AI Premium', price: 96.99 }
    ]
  },
  {
    id: 'claude-pro',
    name: 'Claude Pro',
    logo: 'https://unavatar.io/anthropic.com',
    avgPriceMin: 115,
    avgPriceMax: 115,
    cancelUrl: 'https://claude.ai/settings/billing',
    howToCancel: 'Settings > Billing > Cancel subscription'
  },
  {
    id: 'cursor-ai',
    name: 'Cursor AI',
    logo: 'https://unavatar.io/cursor.sh',
    avgPriceMin: 115,
    avgPriceMax: 115,
    howToCancel: 'Settings > Billing > Cancel subscription'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    logo: 'https://unavatar.io/github.com',
    avgPriceMin: 55,
    avgPriceMax: 55,
    cancelUrl: 'https://github.com/settings/copilot',
    howToCancel: 'Settings > Copilot > Cancel subscription'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: 'https://unavatar.io/midjourney.com',
    avgPriceMin: 55,
    avgPriceMax: 165,
    howToCancel: 'Discord > /subscribe > Manage subscription',
    plans: [
      { label: 'Basic', price: 55.00 },
      { label: 'Standard', price: 165.00 }
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    logo: 'https://unavatar.io/figma.com',
    avgPriceMin: 85,
    avgPriceMax: 85,
    cancelUrl: 'https://www.figma.com/settings',
    howToCancel: 'Settings > Billing > Cancel plan'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    logo: 'https://unavatar.io/vercel.com',
    avgPriceMin: 115,
    avgPriceMax: 115,
    cancelUrl: 'https://vercel.com/account/billing',
    howToCancel: 'Dashboard > Settings > Billing > Cancel'
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    logo: 'https://unavatar.io/canva.com',
    avgPriceMin: 40,
    avgPriceMax: 80,
    cancelUrl: 'https://www.canva.com/settings/billing',
    howToCancel: 'Configurações > Faturamento e equipes > Cancelar'
  },
  {
    id: 'notion',
    name: 'Notion',
    logo: 'https://unavatar.io/notion.so',
    avgPriceMin: 50,
    avgPriceMax: 50,
    howToCancel: 'Settings > Billing > Cancel subscription',
    plans: [
      { label: 'Plus', price: 50.00 },
      { label: 'AI Add-on', price: 50.00 }
    ]
  },
  {
    id: 'adobe-cc',
    name: 'Adobe Creative Cloud',
    logo: 'https://unavatar.io/adobe.com',
    avgPriceMin: 150,
    avgPriceMax: 300,
    cancelUrl: 'https://account.adobe.com',
    howToCancel: 'Gerenciar plano > Cancelar plano'
  },
  {
    id: 'linkedin-premium',
    name: 'LinkedIn Premium',
    logo: 'https://unavatar.io/linkedin.com',
    avgPriceMin: 120,
    avgPriceMax: 250,
    cancelUrl: 'https://www.linkedin.com/premium/manage',
    howToCancel: 'Configurações > Conta > Assinaturas > Cancelar'
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    logo: 'https://unavatar.io/grammarly.com',
    avgPriceMin: 60,
    avgPriceMax: 100,
    howToCancel: 'Account > Subscription > Cancel subscription'
  }
];

// Educação Services
export const educacaoServices: Service[] = [
  {
    id: 'duolingo',
    name: 'Duolingo Plus',
    logo: 'https://unavatar.io/duolingo.com',
    avgPriceMin: 35,
    avgPriceMax: 50,
    howToCancel: 'Configurações > Assinatura > Cancelar'
  },
  {
    id: 'coursera',
    name: 'Coursera Plus',
    logo: 'https://unavatar.io/coursera.org',
    avgPriceMin: 200,
    avgPriceMax: 300,
    howToCancel: 'Settings > Subscriptions > Cancel'
  },
  {
    id: 'udemy',
    name: 'Udemy Pro',
    logo: 'https://unavatar.io/udemy.com',
    avgPriceMin: 100,
    avgPriceMax: 150,
    howToCancel: 'Account > Subscriptions > Cancel subscription'
  },
  {
    id: 'skillshare',
    name: 'Skillshare',
    logo: 'https://unavatar.io/skillshare.com',
    avgPriceMin: 60,
    avgPriceMax: 80,
    howToCancel: 'Settings > Membership > Cancel membership'
  },
  {
    id: 'masterclass',
    name: 'MasterClass',
    logo: 'https://unavatar.io/masterclass.com',
    avgPriceMin: 100,
    avgPriceMax: 150,
    howToCancel: 'Account settings > Membership > Cancel'
  },
  {
    id: 'hotmart',
    name: 'Hotmart Sparkle',
    logo: 'https://unavatar.io/hotmart.com',
    avgPriceMin: 97,
    avgPriceMax: 97,
    howToCancel: 'Área do Aluno > Assinatura > Cancelar'
  },
  {
    id: 'alura',
    name: 'Alura',
    logo: 'https://unavatar.io/alura.com.br',
    avgPriceMin: 120,
    avgPriceMax: 120,
    cancelUrl: 'https://www.alura.com.br/settings',
    howToCancel: 'Perfil > Assinatura > Cancelar'
  },
  {
    id: 'rocketseat',
    name: 'Rocketseat',
    logo: 'https://unavatar.io/rocketseat.com.br',
    avgPriceMin: 100,
    avgPriceMax: 100,
    cancelUrl: 'https://app.rocketseat.com.br/settings',
    howToCancel: 'Configurações > Assinatura > Cancelar'
  },
  {
    id: 'qconcursos',
    name: 'QConcursos',
    logo: 'https://unavatar.io/qconcursos.com',
    avgPriceMin: 35,
    avgPriceMax: 35,
    howToCancel: 'Minha Conta > Assinatura > Cancelar'
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: 'https://unavatar.io/kiwify.com.br',
    avgPriceMin: 97,
    avgPriceMax: 97,
    howToCancel: 'Área do Aluno > Assinatura > Cancelar'
  },
  {
    id: 'descomplica',
    name: 'Descomplica',
    logo: 'https://unavatar.io/descomplica.com.br',
    avgPriceMin: 29,
    avgPriceMax: 30,
    howToCancel: 'Perfil > Minha Assinatura > Cancelar'
  }
];

// Marketplaces Services
export const marketplacesServices: Service[] = [
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    logo: 'https://unavatar.io/amazon.com.br',
    avgPriceMin: 15,
    avgPriceMax: 20,
    cancelUrl: 'https://www.amazon.com.br/mc',
    howToCancel: 'Conta > Prime > Cancelar benefícios',
    plans: [
      { label: 'Mensal', price: 19.90 },
      { label: 'Anual (R$ 175/ano)', price: 14.58 }
    ]
  },
  {
    id: 'magazine-luiza',
    name: 'Magalu Benefícios',
    logo: 'https://unavatar.io/magazineluiza.com.br',
    avgPriceMin: 10,
    avgPriceMax: 20,
    howToCancel: 'Minha conta > Assinaturas > Cancelar'
  },
  {
    id: 'ifood-clube',
    name: 'iFood Clube',
    logo: 'https://unavatar.io/ifood.com.br',
    avgPriceMin: 5,
    avgPriceMax: 20,
    howToCancel: 'App > Perfil > iFood Clube > Cancelar assinatura',
    plans: [
      { label: 'Básico', price: 4.95 },
      { label: 'Clube', price: 19.90 }
    ]
  },
  {
    id: 'rappi-prime',
    name: 'Rappi Prime',
    logo: 'https://unavatar.io/rappi.com.br',
    avgPriceMin: 35,
    avgPriceMax: 35,
    howToCancel: 'App > Perfil > Rappi Prime > Gerenciar > Cancelar'
  },
  {
    id: 'meli-plus',
    name: 'Meli+ (Mercado Livre)',
    logo: meliPlusLogo,
    avgPriceMin: 18,
    avgPriceMax: 18,
    howToCancel: 'Minha conta > Meli+ > Cancelar',
    cancelUrl: 'https://www.mercadolivre.com.br/subscription-meli-plus'
  }
];

// Social/Namoro Services
export const socialServices: Service[] = [
  {
    id: 'tinder',
    name: 'Tinder Plus/Gold',
    logo: 'https://unavatar.io/tinder.com',
    avgPriceMin: 40,
    avgPriceMax: 80,
    howToCancel: 'Perfil > Configurações > Gerenciar assinatura > Cancelar'
  },
  {
    id: 'bumble',
    name: 'Bumble Premium',
    logo: 'https://unavatar.io/bumble.com',
    avgPriceMin: 50,
    avgPriceMax: 90,
    howToCancel: 'Perfil > Configurações > Assinatura > Cancelar'
  },
  {
    id: 'match',
    name: 'Match',
    logo: 'https://unavatar.io/match.com',
    avgPriceMin: 60,
    avgPriceMax: 100,
    howToCancel: 'Minha conta > Assinatura > Cancelar'
  },
  {
    id: 'happn',
    name: 'Happn Premium',
    logo: 'https://unavatar.io/happn.com',
    avgPriceMin: 40,
    avgPriceMax: 70,
    howToCancel: 'Perfil > Minha assinatura > Cancelar'
  },
  {
    id: 'x-premium',
    name: 'X Premium (Twitter)',
    logo: 'https://unavatar.io/x.com',
    avgPriceMin: 42,
    avgPriceMax: 42,
    howToCancel: 'Configurações > Assinatura > Cancelar Premium'
  },
  {
    id: 'meta-verified',
    name: 'Meta Verified (Instagram)',
    logo: 'https://unavatar.io/instagram.com',
    avgPriceMin: 80,
    avgPriceMax: 80,
    howToCancel: 'Perfil > Configurações > Meta Verified > Cancelar'
  }
];

// Games Services
export const gamesServices: Service[] = [
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    logo: 'https://unavatar.io/playstation.com',
    avgPriceMin: 35,
    avgPriceMax: 70,
    cancelUrl: 'https://www.playstation.com/pt-br/support/subscriptions/cancel-playstation-plus/',
    howToCancel: 'Configurações > Gerenciar assinatura > Cancelar'
  },
  {
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass',
    logo: 'https://unavatar.io/xbox.com',
    avgPriceMin: 40,
    avgPriceMax: 60,
    cancelUrl: 'https://account.microsoft.com/services',
    howToCancel: 'Serviços > Xbox Game Pass > Cancelar'
  },
  {
    id: 'nintendo-online',
    name: 'Nintendo Switch Online',
    logo: 'https://unavatar.io/nintendo.com',
    avgPriceMin: 20,
    avgPriceMax: 40,
    howToCancel: 'eShop > Configurações > Nintendo Switch Online > Cancelar'
  },
  {
    id: 'ea-play',
    name: 'EA Play',
    logo: 'https://unavatar.io/ea.com',
    avgPriceMin: 15,
    avgPriceMax: 30,
    howToCancel: 'Conta EA > Assinaturas > Cancelar'
  },
  {
    id: 'twitch',
    name: 'Twitch Turbo',
    logo: 'https://unavatar.io/twitch.tv',
    avgPriceMin: 30,
    avgPriceMax: 45,
    howToCancel: 'Configurações > Assinaturas > Cancelar Turbo'
  },
  {
    id: 'discord-nitro',
    name: 'Discord Nitro',
    logo: 'https://unavatar.io/discord.com',
    avgPriceMin: 40,
    avgPriceMax: 40,
    howToCancel: 'Configurações > Assinatura > Cancelar Nitro'
  },
  {
    id: 'roblox-premium',
    name: 'Roblox Premium',
    logo: 'https://unavatar.io/roblox.com',
    avgPriceMin: 28,
    avgPriceMax: 28,
    howToCancel: 'Configurações > Assinatura > Cancelar Premium'
  }
];

// Fitness Services
export const fitnessServices: Service[] = [
  {
    id: 'smartfit',
    name: 'Smart Fit',
    logo: 'https://unavatar.io/smartfit.com.br',
    avgPriceMin: 80,
    avgPriceMax: 120,
    howToCancel: 'Fale com a unidade ou app Smart Fit'
  },
  {
    id: 'totalpass',
    name: 'TotalPass',
    logo: 'https://unavatar.io/totalpass.com.br',
    avgPriceMin: 100,
    avgPriceMax: 200,
    howToCancel: 'App > Minha conta > Cancelar plano'
  },
  {
    id: 'wellhub',
    name: 'Wellhub (ex-Gympass)',
    logo: 'https://unavatar.io/wellhub.com',
    avgPriceMin: 120,
    avgPriceMax: 250,
    howToCancel: 'App > Configurações > Cancelar assinatura'
  },
  {
    id: 'strava',
    name: 'Strava Premium',
    logo: 'https://unavatar.io/strava.com',
    avgPriceMin: 25,
    avgPriceMax: 25,
    howToCancel: 'Configurações > Minha assinatura > Cancelar'
  },
  {
    id: 'flo-health',
    name: 'Flo Health Premium',
    logo: 'https://unavatar.io/flo.health',
    avgPriceMin: 40,
    avgPriceMax: 40,
    howToCancel: 'Perfil > Assinatura > Cancelar Premium'
  },
  {
    id: 'queima-diaria',
    name: 'Queima Diária',
    logo: 'https://unavatar.io/queimadiaria.com',
    avgPriceMin: 60,
    avgPriceMax: 100,
    howToCancel: 'App > Perfil > Assinatura > Cancelar'
  }
];

// Transporte Services
export const transporteServices: Service[] = [
  {
    id: 'uber-one',
    name: 'Uber One',
    logo: 'https://unavatar.io/uber.com',
    avgPriceMin: 20,
    avgPriceMax: 20,
    howToCancel: 'App > Perfil > Uber One > Cancelar'
  },
  {
    id: '99-plus',
    name: '99 Plus',
    logo: 'https://unavatar.io/99app.com',
    avgPriceMin: 20,
    avgPriceMax: 30,
    howToCancel: 'App > Menu > 99 Plus > Cancelar assinatura'
  },
  {
    id: 'sem-parar',
    name: 'Sem Parar',
    logo: 'https://unavatar.io/semparar.com.br',
    avgPriceMin: 29,
    avgPriceMax: 29,
    howToCancel: 'App > Menu > Minha conta > Cancelar'
  },
  {
    id: 'veloe',
    name: 'Veloe',
    logo: 'https://unavatar.io/veloe.com.br',
    avgPriceMin: 19,
    avgPriceMax: 19,
    howToCancel: 'App > Configurações > Cancelar'
  }
];

// Extras Services (serviços fixos que não tem preview)
export const extrasServices: Service[] = [
  {
    id: 'internet',
    name: 'Internet',
    logo: 'https://cdn-icons-png.flaticon.com/512/1183/1183621.png',
    avgPriceMin: 80,
    avgPriceMax: 150,
    howToCancel: 'Entre em contato com sua operadora'
  },
  {
    id: 'celular',
    name: 'Celular',
    logo: 'https://cdn-icons-png.flaticon.com/512/15/15874.png',
    avgPriceMin: 50,
    avgPriceMax: 100,
    howToCancel: 'Entre em contato com sua operadora'
  },
  {
    id: 'tv-assinatura',
    name: 'TV por assinatura',
    logo: 'https://cdn-icons-png.flaticon.com/512/2991/2991231.png',
    avgPriceMin: 100,
    avgPriceMax: 200,
    howToCancel: 'Entre em contato com sua operadora'
  },
  {
    id: 'academia-outros',
    name: 'Academia (outros)',
    logo: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
    avgPriceMin: 80,
    avgPriceMax: 150,
    howToCancel: 'Fale com a recepção da academia'
  },
  {
    id: 'outros',
    name: 'Outros',
    logo: 'https://cdn-icons-png.flaticon.com/512/7710/7710488.png',
    avgPriceMin: 0,
    avgPriceMax: 999,
    howToCancel: 'Depende do serviço'
  }
];

// Helper function to get service by id
export function getServiceById(serviceId: string): Service | undefined {
  const allServices = [
    ...streamingServices,
    ...utilitariosServices,
    ...produtividadeServices,
    ...educacaoServices,
    ...marketplacesServices,
    ...socialServices,
    ...gamesServices,
    ...fitnessServices,
    ...transporteServices,
    ...extrasServices,
  ];

  return allServices.find(service => service.id === serviceId);
}
