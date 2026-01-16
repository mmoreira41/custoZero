import type { Category } from '@/types';
import {
  streamingServices,
  utilitariosServices,
  produtividadeServices,
  educacaoServices,
  marketplacesServices,
  socialServices,
  gamesServices,
  fitnessServices,
  transporteServices,
  extrasServices,
} from './services';

export const categories: Category[] = [
  {
    id: 'streaming',
    name: 'Streaming',
    icon: '📺',
    services: streamingServices,
    isSubscription: true
  },
  {
    id: 'utilitarios',
    name: 'Utilitários',
    icon: '🔧',
    services: utilitariosServices,
    isSubscription: true
  },
  {
    id: 'produtividade',
    name: 'Produtividade',
    icon: '💼',
    services: produtividadeServices,
    isSubscription: true
  },
  {
    id: 'educacao',
    name: 'Educação',
    icon: '🎓',
    services: educacaoServices,
    isSubscription: true
  },
  {
    id: 'marketplaces',
    name: 'Marketplaces',
    icon: '🛒',
    services: marketplacesServices,
    isSubscription: true
  },
  {
    id: 'social',
    name: 'Social/Namoro',
    icon: '💕',
    services: socialServices,
    isSubscription: true
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    services: gamesServices,
    isSubscription: true
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    services: fitnessServices,
    isSubscription: true
  },
  {
    id: 'transporte',
    name: 'Transporte',
    icon: '🚗',
    services: transporteServices,
    isSubscription: true
  },
  {
    id: 'extras',
    name: 'Extras',
    icon: '📦',
    services: extrasServices,
    isSubscription: false // Entrada direta, sem preview
  }
];
