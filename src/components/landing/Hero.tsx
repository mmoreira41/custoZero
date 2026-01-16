import React from 'react';

interface HeroProps {
  onStartDiagnostic: () => void;
  showDevMode?: boolean;
  onDevMode?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartDiagnostic, showDevMode = false, onDevMode }) => {
  const streamingLogos = [
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Spotify', url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_with_text.svg' },
    { name: 'Disney+', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
    { name: 'HBO Max', url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg' },
    { name: 'Amazon Prime', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' },
    { name: 'YouTube', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg' }
  ];

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(57,255,20,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl w-full text-center z-10">
        <span className="text-[10px] md:text-sm font-bold tracking-widest text-[#39FF14] uppercase mb-4 block">
          CHEGA DE DINHEIRO VAZANDO
        </span>

        <h1 className="text-3xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 px-2">
          Recupere o controle do dinheiro que você <span className="text-[#39FF14] italic">nem sabe</span> que está perdendo.
        </h1>

        <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 md:mb-12 px-4">
          O <span className="font-bold text-white">Zero Gasto</span> é um diagnóstico rápido que mapeia suas assinaturas e gastos automáticos, mostrando em 3 minutos onde cortar para economizar até <span className="text-white font-bold underline decoration-[#39FF14]">R$ 5.400 por ano</span>.
        </p>

        <div className="relative max-w-4xl mx-auto mb-16 px-2 md:px-0">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end space-y-8 md:space-y-0 md:space-x-4">
            <div className="relative w-full md:w-[600px] aspect-[16/10] bg-[#111] rounded-t-2xl border-x-2 md:border-x-4 border-t-2 md:border-t-4 border-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
                 <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {streamingLogos.map((logo, i) => (
                      <img
                        key={logo.name}
                        src={logo.url}
                        className="absolute w-12 md:w-16 animate-float"
                        style={{
                          top: `${15 + (i * 12)}%`,
                          left: i % 2 === 0 ? '8%' : 'auto',
                          right: i % 2 !== 0 ? '8%' : 'auto',
                          animationDelay: `${i * 0.4}s`,
                          filter: 'grayscale(1) brightness(2)'
                        }}
                        alt={logo.name}
                      />
                    ))}
                 </div>

                 <div className="absolute left-0 w-full h-[3px] bg-[#39FF14] shadow-[0_0_20px_#39FF14] animate-scan z-20" />

                 <div className="text-center z-10 px-4">
                    <div className="text-gray-500 text-[10px] md:text-xs mb-1 font-bold tracking-widest">DESPERDÍCIO ANUAL IDENTIFICADO</div>
                    <div className="text-4xl md:text-7xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      - R$ 3.840,00
                    </div>
                    <div className="mt-6 inline-flex items-center space-x-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
                      <span className="text-[10px] md:text-xs font-bold text-[#39FF14] uppercase">Diagnóstico Concluído</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="hidden md:block relative w-[180px] aspect-[9/18] bg-[#111] rounded-[2.5rem] border-4 border-[#222] shadow-2xl overflow-hidden mb-[-20px] transform hover:translate-y-[-10px] transition-transform">
              <div className="absolute inset-x-0 top-0 h-6 bg-[#222] flex items-center justify-center">
                <div className="w-12 h-1 bg-black rounded-full" />
              </div>
              <div className="absolute inset-0 p-4 pt-10 flex flex-col">
                <div className="h-2 w-3/4 bg-gray-800 rounded mb-6" />
                <div className="space-y-3">
                  {streamingLogos.slice(0, 4).map((logo, i) => (
                    <div key={logo.name} className="h-10 bg-[#1a1a1a] border border-white/5 rounded-xl flex items-center px-3">
                      <img src={logo.url} className="w-4 h-4 object-contain mr-2 filter brightness-150" alt="" />
                      <div className="h-1.5 w-12 bg-gray-700 rounded" />
                      <div className="ml-auto text-[10px] font-bold text-red-500">-R${19 + i}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center px-4">
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="w-full md:w-auto bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-xl md:text-2xl animate-pulse-neon uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(57,255,20,0.2)]"
          >
            👉 QUERO MEU DIAGNÓSTICO AGORA
          </button>

          {showDevMode && onDevMode && (
            <button
              type="button"
              onClick={onDevMode}
              className="mt-4 w-full md:w-auto border border-[#39FF14]/40 text-[#39FF14] px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#39FF14]/10 transition"
            >
              🧪 Modo Teste (sem token)
            </button>
          )}

          <span className="mt-6 text-white/40 text-[10px] md:text-sm font-medium uppercase tracking-widest">
            Acesso imediato • Pagamento único • 100% Seguro
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
