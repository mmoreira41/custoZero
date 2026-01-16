import React from 'react';

interface OfferProps {
  onStartDiagnostic: () => void;
}

const Offer: React.FC<OfferProps> = ({ onStartDiagnostic }) => {
  return (
    <section className="py-24 bg-black px-4 md:px-6 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-6xl font-black text-white mb-6 md:mb-8 px-2">
          Pronto para estancar o vazamento?
        </h2>

        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          O diagnóstico completo custa menos que uma única assinatura que você vai descobrir e cancelar hoje mesmo.
        </p>

        <div className="bg-[#0a0a0a] border-2 border-[#39FF14]/30 rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 max-w-md mx-auto relative overflow-hidden shadow-[0_20px_60px_rgba(57,255,20,0.1)]">
          <div className="absolute top-8 right-[-35px] bg-[#39FF14] text-black px-12 py-1 transform rotate-45 font-black text-xs uppercase tracking-tighter">
            50% OFF
          </div>

          <div className="text-gray-500 line-through text-xl md:text-2xl mb-2 font-bold">De: R$ 97</div>
          <div className="flex flex-col items-center mb-8">
            <span className="text-white text-base md:text-lg font-bold uppercase tracking-widest opacity-60">1x de</span>
            <span className="text-6xl md:text-8xl font-black text-white leading-none my-3 tracking-tighter">R$ 47</span>
            <span className="text-[#39FF14] text-sm font-black uppercase tracking-widest">ou no PIX à vista</span>
          </div>

          <button
            type="button"
            onClick={onStartDiagnostic}
            className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black text-lg md:text-xl animate-pulse-neon hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter shadow-[0_10px_30px_rgba(57,255,20,0.3)]"
          >
            👉 QUERO ACESSO IMEDIATO
          </button>

          <div className="mt-10 flex items-center justify-center space-x-4">
             <img src="https://img.icons8.com/color/48/visa.png" className="h-6 md:h-8 filter brightness-0 invert opacity-40" alt="Visa" />
             <img src="https://img.icons8.com/color/48/mastercard.png" className="h-6 md:h-8 filter brightness-0 invert opacity-40" alt="Master" />
             <img src="https://img.icons8.com/color/48/pix.png" className="h-6 md:h-8 filter brightness-0 invert opacity-40" alt="Pix" />
          </div>
        </div>

        <div className="mt-16 bg-white/[0.02] max-w-3xl mx-auto p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center text-center md:text-left shadow-2xl">
           <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-10">
              <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-[#39FF14]/30 rounded-full flex items-center justify-center bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-[#39FF14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
           </div>
           <div>
             <h3 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-tight">Garantia de Clareza</h3>
             <p className="text-gray-400 text-sm md:text-base leading-relaxed">
               Se não encontrar nada para cortar, você ganha a certeza absoluta de que suas finanças estão em ordem. Risco zero. Devolvemos 100% do seu investimento em até 7 dias caso você não sinta que o diagnóstico valeu a pena.
             </p>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Offer;
