import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryHeaderProps {
  currentCategoryIndex: number;
  categories: Category[];
  onCategoryClick?: (index: number) => void;
}

export function CategoryHeader({
  currentCategoryIndex,
  categories,
  onCategoryClick,
}: CategoryHeaderProps) {
  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;
  const visualProgress = Math.max(progress, 5);

  const currentCategory = categories[currentCategoryIndex];
  const previousCategories = categories.slice(0, currentCategoryIndex);

  return (
    <div className="w-full space-y-6">
      {/* Logo */}
      <Logo className="h-6 w-auto" />

      {/* Barra de Progresso */}
      <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${visualProgress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Navegação de Categorias (Breadcrumbs) */}
      <div className="flex items-center gap-3 flex-wrap">
        <AnimatePresence mode="popLayout">
          {/* Categorias Anteriores */}
          {previousCategories.map((category, index) => (
            <motion.button
              key={`prev-${category.id}`}
              onClick={() => onCategoryClick?.(index)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'group flex items-center gap-2 text-sm font-medium transition-all duration-200',
                'text-muted-foreground/50 hover:text-muted-foreground cursor-pointer',
              )}
            >
              <span className="text-base opacity-70 transition-opacity group-hover:opacity-100">
                {category.icon}
              </span>
              <span className="transition-opacity group-hover:opacity-100">
                {category.name}
              </span>
            </motion.button>
          ))}

          {/* Separador (se houver categorias anteriores) */}
          {previousCategories.length > 0 && (
            <motion.div
              key="separator"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-muted-foreground/30"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </motion.div>
          )}

          {/* Categoria Atual */}
          <motion.div
            key={`current-${currentCategory.id}`}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50"
          >
            <span className="text-2xl" aria-hidden="true">
              {currentCategory.icon}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-base font-semibold text-foreground">
                {currentCategory.name}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {currentCategoryIndex + 1} de {categories.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
