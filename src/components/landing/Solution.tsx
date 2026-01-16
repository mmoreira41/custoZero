import React, { useState } from 'react';

const Solution: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = [
    { id: 1, top: '25%', left: '30%', text: 'Veja o total anual' },
    { id: 2, top: '65%', left: '45%', text: 'Identifique os maiores drenos' },
    { id: 3, top: '80%', left: '75%', text: 'Botão para cancelar' }
  ];

  const services = [
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', price: '- R$ 55,90' },
    { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_with_text.svg', price: '- R$ 21,90' },
    { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', price: '- R$ 33,90' },
    { name: 'HBO Max', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg', price: '- R$ 27,90' }
  ];

  return (
    <section className="py-24 bg-black px-4 md:px-6 flex flex-col items-center overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Como o Zero Gasto funciona na prática
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Um relatório detalhado que separa o que é essencial do que é puro desperdício.
        </p>
      </div>

      <div className="relative max-w-4xl w-full group">
        <div className="relative bg-[#1a1a1a] rounded-[2rem] md:rounded-[3rem] p-3 md:p-5 shadow-2xl border-4 md:border-8 border-[#2a2a2a]">
           <div className="bg-[#050505] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden aspect-square md:aspect-[4/3] p-4 md:p-10 flex flex-col">
              <div className="flex justify-between items-center mb-8 md:mb-12">
                <div className="text-white font-black text-lg md:text-2xl uppercase tracking-tighter">RELATÓRIO ZERO GASTO</div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#39FF14] rounded-full flex items-center justify-center">
                  <span className="text-black font-black text-sm md:text-base">ZG</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col justify-center items-center">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-[10px] md:border-[20px] border-white/5 flex items-center justify-center">
                    <div className="absolute inset-0 border-[10px] md:border-[20px] border-red-500 border-t-transparent border-r-transparent rounded-full transform -rotate-45" />
                    <div className="text-center">
                      <div className="text-[10px] text-gray-500 font-bold">DESPERDÍCIO</div>
                      <div className="text-xl md:text-3xl font-black text-red-500">38%</div>
                    </div>
                  </div>
                  <div className="mt-8 space-y-3 w-full max-w-[240px]">
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <div className="flex items-center"><div className="w-3 h-3 bg-[#39FF14] rounded-sm mr-2" /> <span className="text-gray-400">Essenciais</span></div>
                      <span className="text-white font-bold">42%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-sm mr-2" /> <span className="text-gray-400">Desperdício</span></div>
                      <span className="text-red-500 font-bold">38%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 hidden md:block">
                  {services.map((service) => (
                    <div key={service.name} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center hover:bg-white/[0.05] transition-colors">
                       <div className="w-12 h-12 bg-white/[0.05] rounded-xl mr-4 flex items-center justify-center p-2">
                          <img src={service.logo} className="w-full h-full object-contain filter brightness-125" alt={service.name} />
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-bold text-white mb-1">{service.name}</div>
                          <div className="h-1.5 w-16 bg-gray-800 rounded" />
                       </div>
                       <div className="text-red-500 font-black text-sm">{service.price}</div>
                    </div>
                  ))}
                </div>

                <div className="md:hidden flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
                   {services.map((service) => (
                    <div key={service.name} className="flex-shrink-0 bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex flex-col items-center w-24">
                       <div className="w-8 h-8 mb-2">
                          <img src={service.logo} className="w-full h-full object-contain filter brightness-125" alt={service.name} />
                       </div>
                       <div className="text-red-500 font-black text-[10px]">{service.price}</div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           {hotspots.map((spot) => (
             <div
               key={spot.id}
               className="absolute z-30 cursor-pointer hidden md:block"
               style={{ top: spot.top, left: spot.left }}
               onMouseEnter={() => setActiveHotspot(spot.id)}
               onMouseLeave={() => setActiveHotspot(null)}
             >
               <div className="relative">
                 <div className="w-6 h-6 bg-[#39FF14] rounded-full animate-ping opacity-75 absolute inset-0" />
                 <div className="w-6 h-6 bg-[#39FF14] rounded-full relative z-10 border-4 border-[#111]" />

                 {activeHotspot === spot.id && (
                   <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap shadow-2xl animate-bounce">
                     {spot.text}
                   </div>
                 )}
               </div>
             </div>
           ))}
        </div>
      </div>

      <p className="mt-12 text-gray-500 text-sm font-medium md:hidden text-center">
        * Visualização simplificada para mobile
      </p>
    </section>
  );
};

export default Solution;
