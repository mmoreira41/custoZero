import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Download, RotateCcw, AlertCircle, ExternalLink, Zap, Sparkles } from 'lucide-react';
import { useDiagnosticStore } from '@/store/diagnosticStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { generatePDF } from '@/lib/pdf-generator';
import { formatCurrency } from '@/lib/calculations';
import { getServiceById } from '@/data/services';
import { buildAlternateLogoUrl, buildFallbackLogo } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { getMainDream, getAlternativeDreams } from '@/data/dreams';
import { useCountUp } from '@/hooks/useCountUp';

export function Report() {
  const navigate = useNavigate();
  const { result, reset } = useDiagnosticStore();

  // Se não houver resultado, redirecionar para home
  if (!result) {
    navigate('/');
    return null;
  }

  const handleDownloadPDF = () => {
    generatePDF(result);
  };

  const handleRestart = () => {
    if (confirm('Tem certeza que deseja fazer um novo diagnóstico? Seus dados atuais serão perdidos.')) {
      reset();
      navigate('/');
    }
  };

  // Busca o sonho principal e alternativas baseado no valor real
  const mainDream = getMainDream(result.wasteYearly);
  const alternativeDreams = getAlternativeDreams(result.wasteYearly, mainDream);

  // Cálculos para os cards
  const investmentReturn = result.wasteYearly + (result.wasteYearly * 0.11);
  const monthsOfBills = Math.floor(result.wasteYearly / 300); // Assumindo R$ 300 de conta média

  // Porcentagem de economia em relação ao desperdício
  const savingsPercentage = result.wasteYearly > 0
    ? Math.round((result.savings.realistic / result.wasteYearly) * 100)
    : 0;

  // Animações de contagem
  const animatedWasteYearly = useCountUp({ end: result.wasteYearly, duration: 2500, decimals: 2 });
  const animatedTotalYearly = useCountUp({ end: result.totalYearly, duration: 2500, decimals: 2 });
  const animatedInvestmentReturn = useCountUp({ end: investmentReturn, duration: 2000, decimals: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Header com Logo */}
      <header className="px-4 pt-6">
        <div className="max-w-4xl mx-auto">
          <Logo className="h-8 w-auto" />
        </div>
      </header>

      {/* Hero Section - The Shock */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 pt-12 pb-8 md:pt-20 md:pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-2xl border-0 overflow-hidden">
            <div className="p-6 xs:p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AlertCircle className="w-12 h-12 xs:w-16 xs:h-16 text-rose-500 mx-auto mb-4" />
                <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-slate-900 mb-4 xs:mb-6 text-balance leading-tight">
                  Você está jogando dinheiro fora.
                </h1>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wide mb-2 font-semibold">
                      Desperdício Anual
                    </p>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <p className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold text-rose-600 tracking-tight">
                        {formatCurrency(animatedWasteYearly)}
                      </p>
                    </motion.div>
                  </div>
                  <div className="pt-3 xs:pt-4 border-t border-slate-200">
                    <p className="text-xs xs:text-sm text-slate-500 mb-1">Gasto Total Anual</p>
                    <p className="text-xl xs:text-2xl md:text-3xl font-semibold text-slate-700">
                      {formatCurrency(animatedTotalYearly)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>
        </div>
      </motion.section>

      {/* The Possibilities Section - Bento Grid */}
      {result.wasteYearly > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="px-4 py-8 md:py-12"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl xs:text-2xl md:text-3xl font-bold text-slate-900 mb-4 xs:mb-6 text-center leading-tight">
              Imagine o que esse dinheiro poderia fazer:
            </h2>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 auto-rows-fr">

              {/* Card Hero - Sonho Principal (Ocupa 2 colunas x 2 linhas no desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="xs:col-span-2 md:row-span-2"
              >
                <Card className="bg-gradient-to-br from-sky-500 to-indigo-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden h-full">
                  <div className="p-5 xs:p-6 md:p-8 flex flex-col justify-between h-full min-h-[280px] xs:min-h-[320px]">
                    <div>
                      <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                        <Sparkles className="w-7 h-7 xs:w-10 xs:h-10 text-white flex-shrink-0" />
                        <span className="text-white/90 text-xs xs:text-sm font-semibold uppercase tracking-wide leading-tight">
                          {mainDream.category === 'travel' ? 'Sua Próxima Viagem' :
                           mainDream.category === 'tech' ? 'Seu Próximo Tech' :
                           mainDream.category === 'product' ? 'Sua Próxima Conquista' :
                           'Sua Próxima Experiência'}
                        </span>
                      </div>

                      {/* Sonho Principal */}
                      <h3 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 xs:mb-3 text-balance leading-tight">
                        <span className="text-3xl xs:text-4xl md:text-5xl">{mainDream.emoji}</span> {mainDream.title}
                      </h3>

                      <p className="text-sm xs:text-base md:text-lg text-white/90 mb-1 xs:mb-2 leading-snug">
                        {mainDream.subtitle}
                      </p>

                      <p className="text-base xs:text-lg md:text-xl text-white font-semibold mt-3 xs:mt-4">
                        Com {formatCurrency(result.wasteYearly)} economizados
                      </p>
                    </div>

                    {/* Badges de alternativas */}
                    {alternativeDreams.length > 0 && (
                      <div className="space-y-1.5 xs:space-y-2">
                        <p className="text-xs xs:text-sm text-white/80 font-medium mb-2 xs:mb-3">
                          Ou você poderia ter:
                        </p>
                        <div className="flex flex-wrap gap-1.5 xs:gap-2">
                          {alternativeDreams.map((dream, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 xs:gap-2 bg-white/20 backdrop-blur-sm px-2 xs:px-3 py-1.5 xs:py-2 rounded-full text-white text-xs xs:text-sm font-medium border border-white/30 hover:bg-white/30 transition-all"
                            >
                              <span className="text-sm xs:text-base">{dream.emoji}</span>
                              <span className="truncate max-w-[120px] xs:max-w-[200px]">{dream.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Card Investimento (Coluna direita superior) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-700 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
                  <div className="p-4 xs:p-5 md:p-6 flex flex-col justify-between h-full min-h-[140px] xs:min-h-[150px]">
                    <div>
                      <TrendingUp className="w-8 h-8 xs:w-10 xs:h-10 text-white mb-2 xs:mb-3" />
                      <h3 className="text-lg xs:text-xl font-bold text-white mb-1 xs:mb-2">
                        Investimento
                      </h3>
                      <p className="text-xs xs:text-sm text-white/90 mb-2 xs:mb-3">
                        Rendendo 11% ao ano (Selic/CDB)
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl xs:text-3xl font-bold text-white break-words">
                        {formatCurrency(animatedInvestmentReturn)}
                      </p>
                      <p className="text-xs xs:text-sm text-white/80 mt-1">
                        em 1 ano
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Card Reserva (Coluna direita inferior) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-amber-500 to-orange-700 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
                  <div className="p-4 xs:p-5 md:p-6 flex flex-col justify-between h-full min-h-[140px] xs:min-h-[150px]">
                    <div>
                      <Zap className="w-8 h-8 xs:w-10 xs:h-10 text-white mb-2 xs:mb-3" />
                      <h3 className="text-lg xs:text-xl font-bold text-white mb-1 xs:mb-2">
                        Reserva de Emergência
                      </h3>
                      <p className="text-xs xs:text-sm text-white/90 mb-2 xs:mb-3">
                        Meses de contas pagas
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl xs:text-3xl font-bold text-white">
                        {monthsOfBills} meses
                      </p>
                      <p className="text-xs xs:text-sm text-white/80 mt-1">
                        de luz e água
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

            </div>
          </div>
        </motion.section>
      )}

      {/* The Villains List - Top 5 Drains */}
      {result.topWasters.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="px-4 py-8 md:py-12"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
              Maiores Vilões do seu Orçamento
            </h2>
            <Card className="bg-white shadow-xl border-0">
              <div className="p-6 md:p-8 space-y-4">
                {result.topWasters.slice(0, 5).map((waster, index) => {
                  const service = getServiceById(waster.serviceId);
                  const usageLabel =
                    waster.wasteLevel === 'WASTE'
                      ? 'Sem uso'
                      : waster.wasteLevel === 'LOW_USE'
                        ? 'Uso baixo'
                        : 'Uso moderado';

                  return (
                    <motion.div
                      key={waster.serviceId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        index === 0
                          ? 'bg-rose-50 border-2 border-rose-300 shadow-md'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                            index === 0 ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <img
                          src={waster.logo}
                          alt={waster.serviceName}
                          className="w-12 h-12 object-contain flex-shrink-0"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.altTried && service?.logo) {
                              img.dataset.altTried = 'true';
                              const altUrl = buildAlternateLogoUrl(service.logo);
                              if (altUrl) {
                                img.src = altUrl;
                                return;
                              }
                            }
                            img.onerror = null;
                            img.src = buildFallbackLogo(waster.serviceName);
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{waster.serviceName}</h3>
                          <p className="text-sm text-slate-500">{usageLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-rose-600">
                            {formatCurrency(waster.monthlyValue)}/mês
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatCurrency(waster.yearlyValue)}/ano
                          </p>
                        </div>
                        {(service?.cancelUrl || service?.cancelUrl) && (
                          <Button
                            size="sm"
                            className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-200 font-semibold shadow-sm hover:shadow-md hidden sm:flex border-0"
                            onClick={() => window.open(service.cancelUrl || service.cancelUrl, '_blank')}
                          >
                            Cancelar Agora
                            <ExternalLink className="w-4 h-4 ml-1.5" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        </motion.section>
      )}

      {/* Savings Potential Gauge */}
      {result.savings.realistic > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="px-4 py-8 md:py-12"
        >
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-xl border-0">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
                  Potencial de Economia (Realista)
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-slate-600 font-medium">Economia anual estimada</span>
                      <span className="text-3xl font-bold text-emerald-600">
                        {formatCurrency(result.savings.realistic)}
                      </span>
                    </div>
                    <Progress value={savingsPercentage} className="h-3" />
                    <p className="text-sm text-slate-500 mt-2 text-right">
                      {savingsPercentage}% do seu desperdício recuperado
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Por mês</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(result.savings.realistic / 12)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Em 3 anos</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {formatCurrency(result.savings.realistic * 3)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-sky-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Em 5 anos</p>
                      <p className="text-2xl font-bold text-sky-600">
                        {formatCurrency(result.savings.realistic * 5)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={handleDownloadPDF}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-semibold text-base"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Relatório PDF
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleRestart}
              className="flex-1 border-2 border-slate-300 hover:bg-slate-50 font-semibold text-base bg-transparent"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Refazer Diagnóstico
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
