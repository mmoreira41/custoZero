import React from 'react';

const PainPoints: React.FC = () => {
  const points = [
    'Assinaturas que você esqueceu que existem.',
    'Serviços que você paga mas quase não usa.',
    'O "depois eu cancelo" que vira um gasto eterno.'
  ];

  return (
    <section className="py-24 bg-black px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
          O problema não é o que você ganha. <br className="hidden md:block" />
          <span className="text-[#39FF14]">É o que sai no automático.</span>
        </h2>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
          Você sente que o dinheiro simplesmente some? Aqueles R$ 29 de uma assinatura não doem, mas R$ 3.000 sumindo no fim do ano é um rombo. O Zero Gasto foi criado para expor exatamente isso.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        {points.map((point) => (
          <div
            key={point}
            className="flex items-center p-5 md:p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl md:rounded-3xl hover:border-[#39FF14]/30 transition-all group active:scale-95"
          >
            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[#39FF14]/10 rounded-full flex items-center justify-center mr-4 md:mr-6 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#39FF14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg md:text-2xl text-white font-bold leading-tight">{point}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PainPoints;
