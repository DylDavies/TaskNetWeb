// utils/pdfExport.ts

import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import CompletionStats from '../interfaces/CompletionStatsInterface';
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { ProjectPieChart } from '../components/PdfComponents/ProjectPieChart';
import { MilestoneBarChart } from '../components/PdfComponents/MilestoneBarChart';
import React from 'react';
import { createRoot } from 'react-dom/client';
  

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
    export async function exportStatsToPDF(
      stats: CompletionStats,
      startDate: Date,
      endDate: Date,
      filename = 'completion-stats.pdf'
    ) {
      const doc = new jsPDF();
      const margin = 15;
      let y = margin;
    
      // --- Add Logo ---
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
    
      // --- Report Title ---
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Project Completion Report', 105, y, { align: 'center' });
      y += 10;
    
      // --- Date Range ---
      doc.setFontSize(11);
      doc.text(`Date Range: ${startDate.toDateString()} - ${endDate.toDateString()}`, 105, y, { align: 'center' });
      y += 20;
    
      // --- Stats Table ---
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
      
      // Type-safe access to finalY
      const safeDoc = doc as AutoTableFinalYDoc;
      y = (safeDoc.lastAutoTable?.finalY ?? y) + 15;
    
      // --- Helper: Render React Chart to Canvas ---
      async function renderChartToImage(ChartComponent: React.FC<{ stats: CompletionStats, width?: number, height?: number }>, props: { stats: CompletionStats; width?: number; height?: number }): Promise<HTMLCanvasElement> {
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
            } as Partial<Parameters<typeof html2canvas>[1]>; // <- this is key
            
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
    
      // --- Insert Project Pie Chart ---
      try {
        const pieCanvas = await renderChartToImage(ProjectPieChart, { stats, width: 600, height: 300 });
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
    
      // --- Insert Milestone Bar Chart ---
      try {
        const barCanvas = await renderChartToImage(MilestoneBarChart, { stats, width: 600, height: 300 });
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

      const pageCount = doc.getNumberOfPages();
      const generatedDate = new Date().toLocaleDateString();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);

        const footerText = `Page ${i} of ${pageCount}`;
        const dateText = `Generated on: ${generatedDate}`;

        // Left aligned date
        doc.text(dateText, margin, 290);

        // Right aligned page number
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
      
      // --- Save PDF ---
      doc.save(filename);
    }
    
 
  

