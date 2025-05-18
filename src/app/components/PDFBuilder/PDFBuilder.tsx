import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import CompletionStats from '../../interfaces/CompletionStatsInterface';
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import React from 'react';
import { createRoot } from 'react-dom/client';
import PaymentStats from '../../interfaces/PaymentStats.interface';
import { PDFUnifiedChart } from '../PdfComponents/PDFUnifiedChart';
import SkillAreaAnalysis from '@/app/interfaces/SkillAreaAnalysis.interface';
  
type ChartType = 'pie' | 'bar';

//exporting an element as a pdf
  export async function exportElementToPDF(elementId: string, filename = 'report.pdf') {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const dataUrl = await domtoimage.toPng(node);

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
      pdf.save(filename);
    };
  } catch (err) {
    console.error('Failed to export PDF:', err);
  }
  }

  // exporting the stats themselves as a pdf
  export async function exportCompletionStatsToPDF(
      stats: CompletionStats,
      startDate: Date,
      endDate: Date,
      filename = 'completion-stats.pdf'
    ) {
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;
    
      try {
        const logoResponse = await fetch('/images/Logo.png');
        const logoBlob = await logoResponse.blob();
        const logoUrl = URL.createObjectURL(logoBlob);
    
        const img = new Image();
        img.src = logoUrl;
        await new Promise(resolve => (img.onload = resolve));
    
        doc.addImage(img, 'PNG', 70, y, 70, 40);
        y += 50;
      } catch (error) {
        console.warn('Logo not found or failed to load:', error);
        y += 20;
      }
    
      //Title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Project Completion Report', 105, y, { align: 'center' });
      y += 10;
    
      //Date
      doc.setFontSize(11);
      doc.text(`Date Range: ${startDate.toDateString()} - ${endDate.toDateString()}`, 105, y, { align: 'center' });
      y += 20;
    
      //Table
      interface AutoTableFinalYDoc extends jsPDF {
        lastAutoTable?: {
          finalY?: number;
        };
      }

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Projects', stats.totalProjects.toString()],
          ['Completed Projects', stats.completedProjects.toString()],
          ['Hired Projects', stats.hiredProjects.toString()],
          ['Total Milestones', stats.totalMilestones.toString()],
          ['Completed Milestones', stats.CompletedMilestones.toString()],
          ['Completion Rate', stats.completionRate],
        ],
        styles: {
          halign: 'center',
          fontSize: 11,
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Fixes for the lint so we dont use any
      const safeDoc = doc as AutoTableFinalYDoc;
      y = (safeDoc.lastAutoTable?.finalY ?? y) + 15;
    
      //Piechart
      const PiedataValues: number[][] = [];
      PiedataValues.push([stats.completedProjects, stats.hiredProjects, stats.totalProjects - stats.hiredProjects - stats.completedProjects]);
      const PiedataLabels: string[] = ["Completed", "Hired", "In Progress"];
      const PieaxisLabels: string[] = ["Completed", "Hired", "In Progress"];
      const PiechartTitle: string= "Completion Stats";
      try {
        const pieCanvas = await  renderChartToImage(PDFUnifiedChart, { chartType: 'pie', dataValues: PiedataValues, dataLabels: PiedataLabels, axisLabels: PieaxisLabels, chartTitle: PiechartTitle , width: 600, height: 300 });
        const imgWidth = 180;
        const imgHeight = (pieCanvas.height * imgWidth) / pieCanvas.width;
    
        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }
    
        const pieImg = pieCanvas.toDataURL('image/png');
        doc.addImage(pieImg, 'PNG', 15, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Project Pie Chart.', 15, y);
        y += 10;
      }
    
      // Barchart
      //Chart values:
        const BardataValues: number[][] = [];
        BardataValues.push([stats.CompletedMilestones], [stats.totalMilestones - stats.CompletedMilestones]);
        const BardataLabels: string[] = ["Completed", "Remaining"];
        const BaraxisLabels: string[] = ["Milestones"];
        const BarchartTitle: string= "Milestone Stats";
      try {
        const barCanvas = await renderChartToImage(PDFUnifiedChart, { chartType: 'bar', dataValues: BardataValues, dataLabels: BardataLabels, axisLabels: BaraxisLabels, chartTitle: BarchartTitle , width: 600, height: 300 });
        const imgWidth = 180;
        const imgHeight = (barCanvas.height * imgWidth) / barCanvas.width;
    
        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }
    
        const barImg = barCanvas.toDataURL('image/png');
        doc.addImage(barImg, 'PNG', 15, y, imgWidth, imgHeight);
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Milestone Bar Chart.', 15, y);
      }


      //Footers for each page
      const pageCount = doc.getNumberOfPages();
      const generatedDate = new Date().toLocaleDateString();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);

        const footerText = `Page ${i} of ${pageCount}`;
        const dateText = `Generated on: ${generatedDate}`;

        doc.text(dateText, margin, 290);

        doc.text(footerText, doc.internal.pageSize.getWidth() - margin, 290, {
          align: 'right',
        });
      }
    
      //metadata 
      doc.setProperties({
        title: 'Project Completion Report',
        subject: 'Generated project metrics and charts',
        author: 'ProjectTracker',
        keywords: 'project, report, stats, pdf',
      });
      
      doc.save(filename);
  }


  export async function exportPaymentStatsToPDF(
      stats: PaymentStats,
      startDate: Date,
      endDate: Date,
      filename = 'Payment-stats.pdf'
    ) {
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;
    
      try {
        const logoResponse = await fetch('/images/Logo.png');
        const logoBlob = await logoResponse.blob();
        const logoUrl = URL.createObjectURL(logoBlob);
    
        const img = new Image();
        img.src = logoUrl;
        await new Promise(resolve => (img.onload = resolve));
    
        doc.addImage(img, 'PNG', 70, y, 70, 40);
        y += 50;
      } catch (error) {
        console.warn('Logo not found or failed to load:', error);
        y += 20;
      }
    
      //Title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Payment Report', 105, y, { align: 'center' });
      y += 10;
    
      //Date
      doc.setFontSize(11);
      doc.text(`Date Range: ${startDate.toDateString()} - ${endDate.toDateString()}`, 105, y, { align: 'center' });
      y += 20;
    
      //Table
      interface AutoTableFinalYDoc extends jsPDF {
        lastAutoTable?: {
          finalY?: number;
        };
      }
      const selectedIndices = [0, 1, 4, 6, 7, 8];
      const PDFTableInfo = stats.tabelInfo.map(row => selectedIndices.map(index => row[index]));

      const headers = ['Job ID', 'Job Title', 'Client ID', 'Total Paid', 'Unpaid', 'ESCROW']
      autoTable(doc, {
        startY: y,
        head: [headers],
        body: PDFTableInfo,
        styles: {
          halign: 'center',
          fontSize: 8,
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Fixes for the lint so we dont use any
      const safeDoc = doc as AutoTableFinalYDoc;
      y = (safeDoc.lastAutoTable?.finalY ?? y) + 15;
    
      //Piechart
      //Chart values:
        const PiedataValues: number[][] = [];
        PiedataValues.push([stats.totalESCROW, stats.totalPayed, stats.totalUnpaid]);
        const PiedataLabels: string[] = ["ESCROW", "Paid", "Unpaid"];
        const PieaxisLabels: string[] = ["ESCROW", "Paid", "Unpaid"];
        const PiechartTitle: string= "Percentage comparison";
      try {

        const pieCanvas = await renderChartToImage(PDFUnifiedChart, { chartType: 'pie', dataValues: PiedataValues, dataLabels: PiedataLabels, axisLabels: PieaxisLabels, chartTitle: PiechartTitle , width: 600, height: 300 });
        const imgWidth = 180;
        const imgHeight = (pieCanvas.height * imgWidth) / pieCanvas.width;
    
        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }
    
        const pieImg = pieCanvas.toDataURL('image/png');
        doc.addImage(pieImg, 'PNG', 15, y, imgWidth, imgHeight);
        y += imgHeight + 40;
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Project Pie Chart.', 15, y);
        y += 10;
      }
    
      // Barchart
      //Chart values:
        const BardataValues: number[][] = [];
        BardataValues.push([stats.totalESCROW], [stats.totalPayed], [stats.totalUnpaid]);
        const BardataLabels: string[] = ["ESCROW", "Paid", "Unpaid"];
        const BaraxisLabels: string[] = ["Categories"];
        const BarchartTitle: string= "Comparison in $";
      try {
        const barCanvas = await renderChartToImage(PDFUnifiedChart, { chartType: 'bar', dataValues: BardataValues, dataLabels: BardataLabels, axisLabels: BaraxisLabels, chartTitle: BarchartTitle , width: 600, height: 300 });
        const imgWidth = 180;
        const imgHeight = (barCanvas.height * imgWidth) / barCanvas.width;
    
        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }
    
        const barImg = barCanvas.toDataURL('image/png');
        doc.addImage(barImg, 'PNG', 15, y, imgWidth, imgHeight);
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Milestone Bar Chart.', 15, y);
      }


      //Footers for each page
      const pageCount = doc.getNumberOfPages();
      const generatedDate = new Date().toLocaleDateString();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);

        const footerText = `Page ${i} of ${pageCount}`;
        const dateText = `Generated on: ${generatedDate}`;

        doc.text(dateText, margin, 290);

        doc.text(footerText, doc.internal.pageSize.getWidth() - margin, 290, {
          align: 'right',
        });
      }
    
      //metadata 
      doc.setProperties({
        title: 'Project Payment Report',
        subject: 'Generated project metrics and charts',
        author: 'ProjectTracker',
        keywords: 'project, report, stats, pdf',
      });
      
      doc.save(filename);
  }

  async function renderChartToImage(ChartComponent: React.FC<{ chartType: ChartType; dataValues: number[][]; dataLabels: string[]; axisLabels: string[]; chartTitle: string;width?: number;height?: number; maintainAspectRatio?: boolean;showLegend?: boolean;}>,
                                           props: { chartType: ChartType; dataValues: number[][]; dataLabels: string[]; axisLabels: string[]; chartTitle: string;width?: number;height?: number; maintainAspectRatio?: boolean;showLegend?: boolean; }): Promise<HTMLCanvasElement> {
        return new Promise(async (resolve, reject) => {
          try {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-10000px';
            container.style.top = '0';
            container.style.width = '600px';
            container.style.backgroundColor = 'white';
            document.body.appendChild(container);
    
            const root = createRoot(container);
            root.render(React.createElement(ChartComponent, props));
    
            await new Promise(res => setTimeout(res, 500)); // Wait for render
    
            const options = {
              scale: 3,
              useCORS: true,
              allowTaint: true,
              windowWidth: container.scrollWidth * 3,
              windowHeight: container.scrollHeight * 3,
            } as Partial<Parameters<typeof html2canvas>[1]>; 
            
            const canvas = await html2canvas(container, options);

            root.unmount();
            document.body.removeChild(container);
            resolve(canvas);
          } catch (err) {
            console.error('Chart rendering failed:', err);
            reject(err);
          }
        });
  }

  export async function exportSkillStatsToPDF(
      //initialization
      stats: SkillAreaAnalysis[],
      startDate: Date,
      endDate: Date,
      filename = 'Skill-stats.pdf'
    ) {
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;
    
      try {

        //header of the file: containing the task net logo
        const logoResponse = await fetch('/images/Logo.png');
        const logoBlob = await logoResponse.blob();
        const logoUrl = URL.createObjectURL(logoBlob);
    
        const img = new Image();
        img.src = logoUrl;
        await new Promise(resolve => (img.onload = resolve));
    
        doc.addImage(img, 'PNG', 70, y, 70, 40);
        y += 50;
      } catch (error) {
        console.warn('Logo not found or failed to load:', error);
        y += 20;
      }
    
      //Title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Payment Report', 105, y, { align: 'center' });
      y += 10;
    
      //Date
      doc.setFontSize(11);
      doc.text(`Date Range: ${startDate.toDateString()} - ${endDate.toDateString()}`, 105, y, { align: 'center' });
      y += 20;
    
      //Table
      interface AutoTableFinalYDoc extends jsPDF {
        lastAutoTable?: {
          finalY?: number;
        };
      }
      // Summary Table (Total, Hired, Completed Projects per Skill Area)
      autoTable(doc, {
        startY: y,
        head: [['Skill Area', 'Total Projects', 'Hired Projects', 'Completed Projects']],
        body: stats.map(area => [
          area.skillArea,
          area.totalProjects.toString(),
          area.hiredProjects.toString(),
          area.completedProjects.toString(),
        ]),
        styles: {
          fontSize: 10,
          halign: 'center',
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
      
      // Fixes for the lint so we dont use any
      const safeDoc = doc as AutoTableFinalYDoc;
      y = (safeDoc.lastAutoTable?.finalY ?? y) + 15;

       // Section title
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Most In-Demand Skills', 105, y, { align: 'center' });
      y += 6;

      // Horizontal divider
      doc.setDrawColor(180);
      doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
      y += 6;

      // Table per skill area for most in-demand skills
      for (const area of stats) {
      if (y + 40 > 280) {
        doc.addPage();
        y = margin;
      }

      // Table of skills
      autoTable(doc, {
        startY: y,
       head: [
      // First row: custom section heading
      [{ content: `${area.skillArea}`, colSpan: 2, styles: { halign: 'center', fontSize: 12, textColor: [33, 33, 33], fillColor: [230, 230, 250] } }],
      // Second row: column headers
      ['Skill', 'Count'],
    ],
        body: area.mostInDemandSkills.map(skill => [skill.skill, skill.count.toString()]),
        styles: {
          fontSize: 10,
          halign: 'center',
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
      });

      y = (safeDoc.lastAutoTable?.finalY ?? y) + 20;
    }
    
      // Piechart - Projects per Skill Area
      const PiedataValues: number[][] = [stats.map(area => area.totalProjects)];
      const PiedataLabels: string[] = stats.map(area => area.skillArea);
      const PieaxisLabels: string[] = stats.map(area => area.skillArea);
      const PiechartTitle: string = "Projects per Skill Area";

      try {
        const pieCanvas = await renderChartToImage(PDFUnifiedChart, {
          chartType: 'pie',
          dataValues: PiedataValues,
          dataLabels: PiedataLabels,
          axisLabels: PieaxisLabels,
          chartTitle: PiechartTitle,
          width: 600,
          height: 300,
        });

        const imgWidth = 180;
        const imgHeight = (pieCanvas.height * imgWidth) / pieCanvas.width;

        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }

        const pieImg = pieCanvas.toDataURL('image/png');
        doc.addImage(pieImg, 'PNG', 15, y, imgWidth, imgHeight);
        y += imgHeight + 40;
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Skill Area Pie Chart.', 15, y);
        y += 10;
      }

    
      // Barchart - Projects per Skill Area
      const BardataValues: number[][] = stats.map(area => [area.totalProjects]);
      const BardataLabels: string[] = stats.map(area => area.skillArea);
      const BaraxisLabels: string[] = ['Skill Areas'];
      const BarchartTitle: string = 'Projects per Skill Area';

      try {
        const barCanvas = await renderChartToImage(PDFUnifiedChart, {
          chartType: 'bar',
          dataValues: BardataValues,
          dataLabels: BardataLabels,
          axisLabels: BaraxisLabels,
          chartTitle: BarchartTitle,
          width: 600,
          height: 300,
        });

        const imgWidth = 180;
        const imgHeight = (barCanvas.height * imgWidth) / barCanvas.width;

        if (y + imgHeight > 280) {
          doc.addPage();
          y = 20;
        }

        const barImg = barCanvas.toDataURL('image/png');
        doc.addImage(barImg, 'PNG', 15, y, imgWidth, imgHeight);
        y += imgHeight + 40;
      } catch {
        doc.setFontSize(10);
        doc.text('Error rendering Skill Area Bar Chart.', 15, y);
        y += 10;
      }



      //Footers for each page
      const pageCount = doc.getNumberOfPages();
      const generatedDate = new Date().toLocaleDateString();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);

        const footerText = `Page ${i} of ${pageCount}`;
        const dateText = `Generated on: ${generatedDate}`;

        doc.text(dateText, margin, 290);

        doc.text(footerText, doc.internal.pageSize.getWidth() - margin, 290, {
          align: 'right',
        });
      }
    
      //metadata 
      doc.setProperties({
        title: 'Project Skills Report',
        subject: 'Generated project metrics and charts',
        author: 'ProjectTracker',
        keywords: 'project, report, stats, pdf',
      });
      
      doc.save(filename);
  }
    
 
  

