import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'É seguro colocar meus dados?',
      a: 'Totalmente. Você não insere dados sensíveis como senhas bancárias. O diagnóstico é baseado em um questionário direcionado e análise de faturas que você mesmo processa. Privacidade em primeiro lugar.'
    },
    {
      q: 'Como recebo o acesso?',
      a: 'O acesso é enviado imediatamente para o seu e-mail logo após a confirmação do pagamento. Se pagar via PIX, o acesso é liberado em menos de 1 minuto.'
    },
    {
      q: 'Serve para mim que não tenho muitas assinaturas?',
      a: "Com certeza. A maioria das pessoas se surpreende não só com assinaturas, mas com 'taxas fantasma' e serviços que acreditavam ser gratuitos. O Zero Gasto mapeia micro-gastos que acumulados fazem estrago."
    },
    {
      q: 'É uma assinatura ou pagamento único?',
      a: '100% pagamento único. Você paga uma vez, recebe seu diagnóstico e usa o tempo que precisar. Sem pegadinhas ou cobranças recorrentes.'
    }
  ];

  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-12 text-center">
          Perguntas Frequentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={faq.q} className="bg-[#111] rounded-2xl overflow-hidden border border-white/5 transition-all">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-bold text-white">{faq.q}</span>
                <span className={`text-[#39FF14] transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : 'rotate-0'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 py-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
