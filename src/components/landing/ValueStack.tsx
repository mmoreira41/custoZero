import React from 'react';

const ValueStack: React.FC = () => {
  const cards = [
    { title: 'Diagnóstico Visual', desc: 'Relatório claro e intuitivo.', icon: '📊' },
    { title: 'Total Anualizado', desc: 'O impacto real do desperdício no seu ano.', icon: '📅' },
    { title: 'Ranking de Drenos', desc: 'O que mais está tirando seu dinheiro.', icon: '🏆' },
    { title: 'Cenários de Economia', desc: 'Quanto você recupera ao cortar gastos.', icon: '💰' },
    { title: 'Botão de Cancelamento', desc: 'Links diretos para cancelar serviços.', icon: '🚫' },
    { title: 'Relatório em PDF', desc: 'Salve e consulte quando quiser.', icon: '📄' }
  ];

  return (
    <section className="py-24 bg-black px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Um diagnóstico completo, não apenas um número.
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-[#39FF14]/40 transition-all group">
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform block">{card.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <p className="text-gray-400 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueStack;
