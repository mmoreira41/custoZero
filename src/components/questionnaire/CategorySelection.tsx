import { type SyntheticEvent, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CategoryHeader } from './CategoryHeader';
import type { Category } from '@/types';
import { buildAlternateLogoUrl, buildFallbackLogo, cn, sanitizeInput } from '@/lib/utils';
import { useDiagnosticStore } from '@/store/diagnosticStore';

interface CategorySelectionProps {
  category: Category;
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  currentCategoryIndex: number;
  categories: Category[];
  onCategoryClick?: (index: number) => void;
}

export function CategorySelection({
  category,
  selectedServices,
  onToggleService,
  onContinue,
  onSkip,
  currentCategoryIndex,
  categories,
  onCategoryClick,
}: CategorySelectionProps) {
  const { customServices, addCustomService, removeCustomService } = useDiagnosticStore();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');

  const selectedCount = selectedServices.length;
  const maxCustomNameLength = 60;
  const trimmedCustomName = customServiceName.trim();

  // Filtra custom services desta categoria
  const categoryCustomServices = customServices.filter(
    (s) => s.categoryId === category.id
  );

  const handleAddCustomService = () => {
    if (trimmedCustomName) {
      // Sanitizar input para prevenir XSS
      const safeName = sanitizeInput(trimmedCustomName);

      // Validação adicional: nome não pode estar vazio após sanitização
      if (safeName.length === 0) {
        alert('Nome inválido. Por favor, use apenas caracteres alfanuméricos.');
        return;
      }

      // Validação de tamanho
      if (safeName.length > maxCustomNameLength) {
        alert(`Nome muito longo. Máximo ${maxCustomNameLength} caracteres.`);
        return;
      }

      addCustomService(category.id, safeName);
      setCustomServiceName('');
      setShowAddCustom(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto w-full pb-40 xs:pb-32 md:pb-28">
        <div className="mb-8">
          <CategoryHeader
            currentCategoryIndex={currentCategoryIndex}
            categories={categories}
            onCategoryClick={onCategoryClick}
          />
        </div>

        <div className="space-y-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            Selecione seus serviços de {category.name}
          </h1>
          <p className="text-base text-muted-foreground">
            Escolha os serviços que você assina ou paga mensalmente.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 pb-4">
          {/* Serviços padrão */}
          {category.services.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={isSelected}
                onToggle={() => onToggleService(service.id)}
              />
            );
          })}

          {/* Serviços personalizados desta categoria */}
          {categoryCustomServices.map((customService) => {
            const isSelected = selectedServices.includes(customService.id);
            return (
              <CustomServiceCard
                key={customService.id}
                customService={customService}
                isSelected={isSelected}
                onToggle={() => onToggleService(customService.id)}
                onRemove={() => removeCustomService(customService.id)}
              />
            );
          })}

          {/* Card "Adicionar Outro" */}
          {!showAddCustom && (
            <AddCustomServiceCard onClick={() => setShowAddCustom(true)} />
          )}

          {/* Modal inline para adicionar serviço personalizado */}
          {showAddCustom && (
            <Card className="col-span-1 xs:col-span-2 md:col-span-1 p-4 xs:p-5 border border-emerald-200 shadow-md bg-white">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-semibold text-foreground">Adicionar serviço</h3>
                    <p className="text-xs text-muted-foreground">Digite e confirme.</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 h-9 p-0"
                  onClick={() => {
                    setShowAddCustom(false);
                    setCustomServiceName('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  value={customServiceName}
                  maxLength={maxCustomNameLength}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomService();
                    }
                  }}
                  autoFocus
                  className="h-11"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{trimmedCustomName.length}/{maxCustomNameLength}</span>
                  <span>Pressione Enter para adicionar</span>
                </div>
              </div>

              <div className="flex flex-col xxs:flex-row gap-2 mt-4">
                <Button
                  onClick={handleAddCustomService}
                  disabled={!trimmedCustomName}
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddCustom(false);
                    setCustomServiceName('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Footer fixo com z-index alto para garantir visibilidade */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl z-50"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="px-4 pt-3 xs:pt-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          {/* Indicador de itens selecionados - sempre visível */}
          <div className="flex items-center justify-between gap-2 xxs:gap-3 xs:gap-4">
            <div className="text-xs xs:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {selectedCount > 0 ? (
                <span className="font-medium text-emerald-600">
                  {selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}
                </span>
              ) : (
                <span>Selecione ao menos 1</span>
              )}
            </div>
            <div className="flex items-center gap-2 xs:gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={onSkip}
                size="sm"
                className="text-muted-foreground hover:text-foreground text-xs xs:text-sm px-2 xs:px-4"
              >
                Pular
              </Button>
              <Button
                onClick={onContinue}
                disabled={selectedCount === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-muted disabled:text-muted-foreground text-xs xs:text-sm px-3 xs:px-6"
                size="sm"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  service: Category['services'][number];
  isSelected: boolean;
  onToggle: () => void;
}

function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(service.logo);
  const [forceFallback, setForceFallback] = useState(!service.logo);

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    if (!img.dataset.altTried) {
      img.dataset.altTried = 'true';
      const altUrl = buildAlternateLogoUrl(service.logo);
      if (altUrl) {
        setImageSrc(altUrl);
        return;
      }
    }

    const fallback = buildFallbackLogo(service.name);
    if (fallback && fallback !== imageSrc) {
      img.onerror = null;
      setImageSrc(fallback);
      return;
    }

    setForceFallback(true);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 xs:gap-3 p-4 xs:p-6 rounded-xl border transition-all duration-200 overflow-hidden',
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'card-glow-hover',
        isSelected && 'card-glow-selected',
        isSelected
          ? 'bg-emerald-50 border-emerald-600 shadow-sm'
          : 'bg-white border-border shadow-sm hover:border-emerald-300'
      )}
    >

      {isSelected && (
        <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center animate-in zoom-in duration-200 shadow-md shadow-emerald-600/40">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center gap-2 xs:gap-3">
        <Avatar className="w-14 h-14 xs:w-16 xs:h-16 md:w-20 md:h-20 bg-muted">
          {!forceFallback && imageSrc ? (
            <AvatarImage
              src={imageSrc}
              alt={service.name}
              className="object-contain p-2 bg-white"
              onError={handleImageError}
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl md:text-2xl font-bold">
              {service.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <span
          className={cn(
            'text-xs xs:text-sm md:text-base font-medium text-center text-balance transition-colors leading-tight',
            isSelected ? 'text-emerald-900' : 'text-foreground'
          )}
        >
          {service.name}
        </span>
      </div>
    </button>
  );
}

// Card para adicionar novo serviço personalizado
interface AddCustomServiceCardProps {
  onClick: () => void;
}

function AddCustomServiceCard({ onClick }: AddCustomServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 xs:gap-3 p-4 xs:p-6 rounded-xl border transition-all duration-200 overflow-hidden',
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'bg-white border-border shadow-sm hover:border-emerald-300 border-dashed'
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 xs:gap-3">
        <Avatar className="w-14 h-14 xs:w-16 xs:h-16 md:w-20 md:h-20 bg-slate-100">
          <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-500 text-white">
            <Plus className="w-6 h-6 xs:w-8 xs:h-8" />
          </AvatarFallback>
        </Avatar>

        <span className="text-xs xs:text-sm md:text-base font-medium text-center text-balance transition-colors text-foreground leading-tight">
          Adicionar Outro
        </span>
      </div>
    </button>
  );
}

// Card para serviço personalizado existente
interface CustomServiceCardProps {
  customService: { id: string; name: string };
  isSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

function CustomServiceCard({ customService, isSelected, onToggle, onRemove }: CustomServiceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={isSelected}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 xs:gap-3 p-4 xs:p-6 rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer',
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        'card-glow-hover',
        isSelected && 'card-glow-selected',
        isSelected
          ? 'bg-emerald-50 border-emerald-600 shadow-sm'
          : 'bg-white border-border shadow-sm hover:border-emerald-300'
      )}
    >
      {/* Botão de remover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-30 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center transition-colors shadow-md"
        title="Remover serviço"
      >
        <X className="w-4 h-4 text-white" strokeWidth={2.5} />
      </button>

      {isSelected && (
        <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center animate-in zoom-in duration-200 shadow-md shadow-emerald-600/40">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center gap-2 xs:gap-3">
        <Avatar className="w-14 h-14 xs:w-16 xs:h-16 md:w-20 md:h-20 bg-slate-100">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-lg xs:text-xl md:text-2xl font-bold">
            {customService.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span
          className={cn(
            'text-xs xs:text-sm md:text-base font-medium text-center text-balance transition-colors px-2 leading-tight',
            isSelected ? 'text-emerald-900' : 'text-foreground'
          )}
        >
          {customService.name}
        </span>
      </div>
    </div>
  );
}
