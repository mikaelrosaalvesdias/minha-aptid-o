"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

export function DownloadPDFButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const W = doc.internal.pageSize.getWidth();
      const margin = 18;
      const usable = W - margin * 2;
      let y = 20;

      // ── helpers ────────────────────────────────────
      const purple = [123, 66, 246] as const;
      const blue = [14, 165, 233] as const;
      const dark = [20, 20, 28] as const;
      const white = [255, 255, 255] as const;
      const gray = [160, 160, 170] as const;

      function checkPage(needed: number) {
        if (y + needed > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage();
          // dark bg for new page
          doc.setFillColor(...dark);
          doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");
          drawGradientBar(0, 0, W, 2);
          y = 16;
        }
      }

      function drawGradientBar(x: number, yPos: number, w: number, h: number) {
        const steps = 40;
        const stepW = w / steps;
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const r = Math.round(purple[0] + (blue[0] - purple[0]) * t);
          const g = Math.round(purple[1] + (blue[1] - purple[1]) * t);
          const b = Math.round(purple[2] + (blue[2] - purple[2]) * t);
          doc.setFillColor(r, g, b);
          doc.rect(x + i * stepW, yPos, stepW + 0.5, h, "F");
        }
      }

      function sectionTitle(title: string, icon?: string) {
        checkPage(16);
        drawGradientBar(margin, y, usable, 1);
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...purple);
        doc.text((icon ? icon + " " : "") + title.toUpperCase(), margin, y);
        y += 8;
      }

      // ── background ─────────────────────────────────
      doc.setFillColor(...dark);
      doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

      // ── header gradient strip ──────────────────────
      drawGradientBar(0, 0, W, 4);

      // ── title ──────────────────────────────────────
      y = 22;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(...white);
      doc.text("Mapa de Aptidão", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(...gray);
      doc.text("Resultado do teste de aptidão profissional", margin, y);
      y += 4;
      doc.setFontSize(9);
      doc.text("Gerado em " + new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), margin, y);
      y += 14;

      // ── extract data from DOM ──────────────────────
      const heroH1 = document.querySelector(".result-hero h1")?.textContent ?? "Seu Perfil";
      const heroSummary = document.querySelector(".result-summary")?.textContent ?? "";
      const scoreEl = document.querySelector(".result-score-card strong");
      const scoreText = scoreEl?.textContent ?? "";
      const userName = document.querySelector(".result-hero .muted")?.textContent ?? "";

      // ── main profile block ─────────────────────────
      doc.setFillColor(30, 30, 40);
      doc.roundedRect(margin, y, usable, 38, 4, 4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...white);
      doc.text(heroH1, margin + 8, y + 14);

      if (scoreText) {
        doc.setFontSize(32);
        doc.setTextColor(...purple);
        doc.text(scoreText, W - margin - 8, y + 18, { align: "right" });
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text("compatibilidade", W - margin - 8, y + 24, { align: "right" });
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      const summaryLines = doc.splitTextToSize(heroSummary, usable - 60);
      doc.text(summaryLines.slice(0, 2), margin + 8, y + 24);

      if (userName) {
        doc.setFontSize(8);
        doc.text(userName, margin + 8, y + 34);
      }
      y += 46;

      // ── profile bars ───────────────────────────────
      sectionTitle("Top Perfis");
      const barRows = document.querySelectorAll(".bar-row");
      barRows.forEach((row) => {
        checkPage(14);
        const label = row.querySelector(".bar-label span")?.textContent ?? "";
        const pct = row.querySelector(".bar-label strong")?.textContent ?? "";
        const fillEl = row.querySelector(".bar-fill") as HTMLElement | null;
        const width = fillEl ? parseFloat(fillEl.style.width) || 0 : 0;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...white);
        doc.text(label, margin, y);
        doc.setTextColor(...purple);
        doc.text(pct, W - margin, y, { align: "right" });
        y += 3;

        // bar background
        doc.setFillColor(40, 40, 50);
        doc.roundedRect(margin, y, usable, 4, 2, 2, "F");
        // bar fill
        if (width > 0) {
          drawGradientBar(margin, y, (usable * width) / 100, 4);
        }
        y += 9;
      });

      // ── profile details ────────────────────────────
      const profileCards = document.querySelectorAll(".profile-card");
      profileCards.forEach((card, idx) => {
        const name = card.querySelector("h3")?.textContent ?? "";
        const desc = card.querySelector("p")?.textContent ?? "";
        const chips = Array.from(card.querySelectorAll(".pill")).map(el => el.textContent ?? "");

        checkPage(28);
        doc.setFillColor(28, 28, 38);
        doc.roundedRect(margin, y, usable, 4, 2, 2, "F");

        // rank circle
        doc.setFillColor(...purple);
        doc.circle(margin + 6, y + 8, 5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...white);
        doc.text(String(idx + 1), margin + 6, y + 9.5, { align: "center" });

        // name
        doc.setFontSize(12);
        doc.text(name, margin + 16, y + 10);
        y += 14;

        // description
        if (desc) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...gray);
          const lines = doc.splitTextToSize(desc, usable - 16);
          doc.text(lines.slice(0, 3), margin + 16, y);
          y += lines.slice(0, 3).length * 4 + 2;
        }

        // chips
        if (chips.length > 0) {
          let cx = margin + 16;
          chips.forEach(chip => {
            const tw = doc.getTextWidth(chip) + 6;
            if (cx + tw > W - margin) { cx = margin + 16; y += 6; }
            checkPage(8);
            doc.setFillColor(50, 30, 80);
            doc.roundedRect(cx, y - 3, tw, 5, 2, 2, "F");
            doc.setFontSize(7);
            doc.setTextColor(196, 181, 253);
            doc.text(chip, cx + 3, y);
            cx += tw + 3;
          });
          y += 5;
        }
        y += 6;
      });

      // ── strengths & attention ──────────────────────
      const twoColSections = document.querySelectorAll(".two-columns");
      if (twoColSections[0]) {
        sectionTitle("Forças e pontos de atenção");

        const leftCol = twoColSections[0].children[0];
        const rightCol = twoColSections[0].children[1];

        // Strengths
        const pills = leftCol?.querySelectorAll(".pill");
        if (pills && pills.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...white);
          doc.text("Forças Detectadas", margin, y);
          y += 5;

          let cx = margin;
          pills.forEach(pill => {
            const text = pill.textContent ?? "";
            const tw = doc.getTextWidth(text) + 8;
            if (cx + tw > W - margin) { cx = margin; y += 7; }
            checkPage(8);
            doc.setFillColor(50, 30, 80);
            doc.roundedRect(cx, y - 3.5, tw, 6, 2, 2, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(196, 181, 253);
            doc.text(text, cx + 4, y);
            cx += tw + 3;
          });
          y += 10;
        }

        // Attention points
        const lis = rightCol?.querySelectorAll("li");
        if (lis && lis.length > 0) {
          checkPage(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...white);
          doc.text("Pontos de Atenção", margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...gray);
          lis.forEach(li => {
            checkPage(6);
            doc.text("• " + (li.textContent ?? ""), margin + 2, y);
            y += 5;
          });
          y += 4;
        }
      }

      // ── degrees & short courses ────────────────────
      if (twoColSections[1]) {
        sectionTitle("Cursos e faculdades recomendadas");

        const leftCol = twoColSections[1].children[0];
        const rightCol = twoColSections[1].children[1];

        const degrees = leftCol?.querySelectorAll("li");
        if (degrees && degrees.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...white);
          doc.text("Graduações sugeridas", margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...gray);
          degrees.forEach(li => {
            checkPage(6);
            doc.text("• " + (li.textContent ?? ""), margin + 2, y);
            y += 5;
          });
          y += 4;
        }

        const shortCourses = rightCol?.querySelectorAll(".pill");
        if (shortCourses && shortCourses.length > 0) {
          checkPage(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...white);
          doc.text("Cursos rápidos para testar", margin, y);
          y += 5;
          let cx = margin;
          shortCourses.forEach(pill => {
            const text = pill.textContent ?? "";
            const tw = doc.getTextWidth(text) + 8;
            if (cx + tw > W - margin) { cx = margin; y += 7; }
            checkPage(8);
            doc.setFillColor(20, 60, 60);
            doc.roundedRect(cx, y - 3.5, tw, 6, 2, 2, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(110, 231, 183);
            doc.text(text, cx + 4, y);
            cx += tw + 3;
          });
          y += 10;
        }
      }

      // ── action plan ────────────────────────────────
      if (twoColSections[2]) {
        sectionTitle("Plano de ação");

        const leftCol = twoColSections[2].children[0];
        const rightCol = twoColSections[2].children[1];

        [leftCol, rightCol].forEach((col, ci) => {
          const title = ci === 0 ? "Primeiros 7 dias" : "Primeiros 30 dias";
          const items = col?.querySelectorAll("li");
          if (!items || items.length === 0) return;

          checkPage(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...white);
          doc.text(title, margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...gray);
          items.forEach((li, i) => {
            checkPage(6);
            const lines = doc.splitTextToSize(`${i + 1}. ${li.textContent ?? ""}`, usable - 4);
            doc.text(lines, margin + 2, y);
            y += lines.length * 4 + 1;
          });
          y += 4;
        });
      }

      // ── footer on all pages ─────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const ph = doc.internal.pageSize.getHeight();
        drawGradientBar(0, ph - 3, W, 3);
        doc.setFontSize(7);
        doc.setTextColor(...gray);
        doc.text("aptidao.n8nmikael.com.br", margin, ph - 6);
        doc.text(`Página ${i} de ${pageCount}`, W - margin, ph - 6, { align: "right" });
      }

      doc.save("resultado-mapa-de-aptidao.pdf");
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="button download-pdf-btn" type="button" onClick={handleDownload} disabled={loading} style={{ marginTop: '16px', width: '100%' }}>
      {loading ? <Loader2 className="spin" size={17} /> : <Download size={17} />}
      {loading ? "Gerando PDF..." : "Baixar resultado em PDF"}
    </button>
  );
}
