import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DiagnosticResult } from '@/types';
import { formatCurrency } from './calculations';
import { getMainDream, getAlternativeDreams } from '@/data/dreams';

export function generatePDF(result: DiagnosticResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cores do tema
  const emeraldColor: [number, number, number] = [16, 185, 129]; // #10b981
  const roseColor: [number, number, number] = [220, 38, 38]; // #dc2626
  const slateColor: [number, number, number] = [100, 116, 139]; // #64748b
  const blackColor: [number, number, number] = [24, 24, 27]; // #18181b
  const tealColor: [number, number, number] = [20, 184, 166]; // #14b8a6
  const amberColor: [number, number, number] = [245, 158, 11]; // #f59e0b
  const skyColor: [number, number, number] = [14, 165, 233]; // #0ea5e9

  // === CABEÇALHO COM BARRA EMERALD ===
  doc.setFillColor(...emeraldColor);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Logo "custoZero" em branco
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('custoZero', 15, 15);

  // Email e Data alinhados à direita
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date(result.createdAt).toLocaleDateString('pt-BR');
  doc.text(`${result.email}`, pageWidth - 15, 12, { align: 'right' });
  doc.text(dateStr, pageWidth - 15, 18, { align: 'right' });

  // Reset cor
  doc.setTextColor(...blackColor);

  // === SEÇÃO 1: HERO - "VOCÊ ESTÁ JOGANDO DINHEIRO FORA" ===
  let yPos = 45;

  // Título impactante
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...roseColor);
  doc.text('Voce esta jogando dinheiro fora.', pageWidth / 2, yPos, { align: 'center' });
  doc.setTextColor(...blackColor);
  yPos += 15;

  // Box do Desperdício Anual (Destaque)
  const bigBoxWidth = pageWidth - 30;
  const bigBoxHeight = 35;

  doc.setFillColor(254, 242, 242); // rose-50
  doc.roundedRect(15, yPos, bigBoxWidth, bigBoxHeight, 5, 5, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...slateColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DESPERDICIO ANUAL', pageWidth / 2, yPos + 8, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(...roseColor);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(result.wasteYearly), pageWidth / 2, yPos + 22, { align: 'center' });

  yPos += bigBoxHeight + 5;

  // Gasto Total Anual (menor, abaixo)
  doc.setFontSize(9);
  doc.setTextColor(...slateColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Gasto Total Anual', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  doc.setFontSize(14);
  doc.setTextColor(...blackColor);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(result.totalYearly), pageWidth / 2, yPos, { align: 'center' });

  doc.setTextColor(...blackColor);
  yPos += 20;

  // === SEÇÃO 2: "IMAGINE O QUE ESSE DINHEIRO PODERIA FAZER" ===
  if (result.wasteYearly > 0) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 120) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Imagine o que esse dinheiro poderia fazer:', 15, yPos);
    yPos += 10;

    // Buscar sonho principal
    const mainDream = getMainDream(result.wasteYearly);
    const alternativeDreams = getAlternativeDreams(result.wasteYearly, mainDream);

    // Box do Sonho Principal (Sky gradient style)
    const dreamBoxHeight = 45;
    doc.setFillColor(224, 242, 254); // sky-100
    doc.roundedRect(15, yPos, pageWidth - 30, dreamBoxHeight, 5, 5, 'F');

    doc.setFontSize(10);
    doc.setTextColor(...skyColor);
    doc.setFont('helvetica', 'bold');
    const categoryLabel =
      mainDream.category === 'travel' ? 'SUA PROXIMA VIAGEM' :
      mainDream.category === 'tech' ? 'SEU PROXIMO TECH' :
      mainDream.category === 'product' ? 'SUA PROXIMA CONQUISTA' :
      'SUA PROXIMA EXPERIENCIA';
    doc.text(categoryLabel, 20, yPos + 8);

    doc.setFontSize(16);
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.text(mainDream.title, 20, yPos + 18);

    doc.setFontSize(10);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text(mainDream.subtitle, 20, yPos + 26);

    doc.setFontSize(11);
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Com ${formatCurrency(result.wasteYearly)} economizados`, 20, yPos + 35);

    yPos += dreamBoxHeight + 5;

    // Alternativas (badges)
    if (alternativeDreams.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...slateColor);
      doc.setFont('helvetica', 'normal');
      doc.text('Ou voce poderia ter:', 20, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const alternativesText = alternativeDreams
        .map((d) => d.title)
        .join(' • ');
      doc.text(alternativesText, 20, yPos);
      yPos += 10;
    }

    // === CARDS MENORES: INVESTIMENTO E RESERVA ===
    const smallBoxWidth = (pageWidth - 40) / 2;
    const smallBoxHeight = 30;
    const leftSmallBoxX = 15;
    const rightSmallBoxX = leftSmallBoxX + smallBoxWidth + 10;

    // Card Investimento
    doc.setFillColor(209, 250, 229); // emerald-100
    doc.roundedRect(leftSmallBoxX, yPos, smallBoxWidth, smallBoxHeight, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(...emeraldColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Investimento', leftSmallBoxX + 5, yPos + 8);

    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Rendendo 11% ao ano (Selic/CDB)', leftSmallBoxX + 5, yPos + 14);

    const investmentReturn = result.wasteYearly + (result.wasteYearly * 0.11);
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(investmentReturn), leftSmallBoxX + 5, yPos + 22);

    doc.setFontSize(7);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('em 1 ano', leftSmallBoxX + 5, yPos + 27);

    // Card Reserva de Emergência
    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(rightSmallBoxX, yPos, smallBoxWidth, smallBoxHeight, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(...amberColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Reserva de Emergencia', rightSmallBoxX + 5, yPos + 8);

    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Meses de contas pagas', rightSmallBoxX + 5, yPos + 14);

    const monthsOfBills = Math.floor(result.wasteYearly / 300);
    doc.setFontSize(12);
    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${monthsOfBills} meses`, rightSmallBoxX + 5, yPos + 22);

    doc.setFontSize(7);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('de luz e agua', rightSmallBoxX + 5, yPos + 27);

    yPos += smallBoxHeight + 20;
  }

  // === SEÇÃO 3: MAIORES VILÕES ===
  if (result.topWasters.length > 0) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Maiores Viloes do seu Orcamento', 15, yPos);
    yPos += 5;

    // Preparar dados da tabela
    const tableData = result.topWasters.slice(0, 5).map((waster, index) => {
      const usageLabel =
        waster.wasteLevel === 'WASTE' ? 'Sem uso' :
        waster.wasteLevel === 'LOW_USE' ? 'Uso baixo' :
        'Uso moderado';

      return [
        `#${index + 1}`,
        waster.serviceName,
        usageLabel,
        formatCurrency(waster.monthlyValue),
        formatCurrency(waster.yearlyValue),
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Servico', 'Uso', 'Mes', 'Ano']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: emeraldColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: blackColor,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        // Destacar primeira linha (maior vilão)
        if (data.section === 'body' && data.row.index === 0) {
          data.cell.styles.fillColor = [254, 226, 226]; // rose-100
        }
      },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // === SEÇÃO 4: POTENCIAL DE ECONOMIA ===
  if (result.savings.realistic > 0) {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Potencial de Economia (Realista)', 15, yPos);
    yPos += 10;

    // Box grande da economia
    const savingsBoxHeight = 30;
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(15, yPos, pageWidth - 30, savingsBoxHeight, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Economia anual estimada', 20, yPos + 10);

    doc.setFontSize(18);
    doc.setTextColor(...emeraldColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.savings.realistic), pageWidth - 20, yPos + 10, { align: 'right' });

    // Porcentagem
    const savingsPercentage = result.wasteYearly > 0
      ? Math.round((result.savings.realistic / result.wasteYearly) * 100)
      : 0;

    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`${savingsPercentage}% do seu desperdicio recuperado`, pageWidth - 20, yPos + 20, { align: 'right' });

    yPos += savingsBoxHeight + 10;

    // Grid de projeções (3 colunas)
    const projBoxWidth = (pageWidth - 50) / 3;
    const projBoxHeight = 25;
    const projBoxY = yPos;

    // Por mês
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(15, projBoxY, projBoxWidth, projBoxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Por mes', 15 + projBoxWidth / 2, projBoxY + 8, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(...emeraldColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.savings.realistic / 12), 15 + projBoxWidth / 2, projBoxY + 18, { align: 'center' });

    // Em 3 anos
    const box2X = 15 + projBoxWidth + 5;
    doc.setFillColor(204, 251, 241); // teal-100
    doc.roundedRect(box2X, projBoxY, projBoxWidth, projBoxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Em 3 anos', box2X + projBoxWidth / 2, projBoxY + 8, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(...tealColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.savings.realistic * 3), box2X + projBoxWidth / 2, projBoxY + 18, { align: 'center' });

    // Em 5 anos
    const box3X = box2X + projBoxWidth + 5;
    doc.setFillColor(224, 242, 254); // sky-100
    doc.roundedRect(box3X, projBoxY, projBoxWidth, projBoxHeight, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...slateColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Em 5 anos', box3X + projBoxWidth / 2, projBoxY + 8, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(...skyColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.savings.realistic * 5), box3X + projBoxWidth / 2, projBoxY + 18, { align: 'center' });

    yPos += projBoxHeight + 20;
  }

  // === SEÇÃO 5: PRÓXIMOS PASSOS ===
  // Verificar se precisa de nova página
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 25;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Proximos Passos', 15, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const steps = [
    'Revise os servicos que voce nunca ou raramente usa',
    'Cancele ou pause assinaturas desnecessarias',
    'Negocie valores de servicos essenciais',
    'Direcione a economia para investimentos ou reserva',
  ];

  steps.forEach((step, index) => {
    // Número como bullet
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...emeraldColor);
    doc.text(`${index + 1}.`, 18, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...blackColor);
    doc.text(step, 25, yPos);
    yPos += 7;
  });

  // === RODAPÉ ===
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(...slateColor);
  doc.text('Diagnostico gerado por custoZero - Seu consultor financeiro pessoal', pageWidth / 2, footerY, {
    align: 'center',
  });

  // Salvar PDF
  const fileName = `diagnostico-custoZero-${Date.now()}.pdf`;
  doc.save(fileName);
}
