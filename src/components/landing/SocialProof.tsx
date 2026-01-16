import React from 'react';

const SocialProof: React.FC = () => {
  const testimonials = [
    { name: 'Carlos M.', text: 'Descobri quase R$ 300/mês que iam pro ralo com assinaturas que eu nem usava. Em 12 meses, paguei uma viagem só com essa sobra!', icon: 'https://i.pravatar.cc/150?u=carlos' },
    { name: 'Juliana R.', text: "O relatório me mostrou que R$ 2.800/ano estavam indo embora em 'taxinhas' e serviços duplicados. Hoje esse valor vira investimento.", icon: 'https://i.pravatar.cc/150?u=juliana' },
    { name: 'Renato A.', text: 'Sempre deixava pra depois... mas o botão de cancelar direto no app resolveu meu maior problema: procrastinar e perder dinheiro.', icon: 'https://i.pravatar.cc/150?u=renato' }
  ];

  return (
    <section className="py-24 bg-black px-4 md:px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          O que acontece depois do diagnóstico...
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="bg-[#0b141a] rounded-2xl md:rounded-[2rem] p-5 md:p-6 shadow-2xl relative border-t-4 border-green-600 transition-transform hover:translate-y-[-5px]">
            <div className="flex items-center mb-4">
              <img src={testimonial.icon} className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-3 border-2 border-white/10" alt={testimonial.name} />
              <div>
                <div className="text-white font-bold text-sm md:text-base">{testimonial.name}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium">Online • visto por último hoje</div>
              </div>
            </div>

            <div className="bg-[#1f2c33] p-4 md:p-5 rounded-2xl rounded-tl-none relative mb-2 shadow-inner">
              <p className="text-sm md:text-base text-gray-200 leading-relaxed italic font-medium">
                "{testimonial.text}"
              </p>
              <div className="flex justify-end mt-3 items-center space-x-1">
                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold">14:32</span>
                <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;
