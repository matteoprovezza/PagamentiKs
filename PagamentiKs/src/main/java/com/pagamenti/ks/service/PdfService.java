package com.pagamenti.ks.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.model.Pagamento;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {

    private static final String ASSOCIAZIONE_NOME = "A.S.D. KARATE-SAN";
    private static final String ASSOCIAZIONE_SEDE = "Via Galileo Galilei 67 - 20831 Seregno (MB)";
    private static final String ASSOCIAZIONE_CF = "91125000157";
    private static final String ASSOCIAZIONE_EMAIL = "Segreteria@karate-san.it";
    private static final String ASSOCIAZIONE_WEBSITE = "www.karate-san.it";
    private static final String ASSOCIAZIONE_TEL = "339-3909002";

    public byte[] generateRicevuta(Pagamento pagamento, Atleta atleta, String numeroRicevuta) throws IOException, DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);
        
        document.open();

        // Font definitions
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL);
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
        Font smallFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);

        // Header con logo reale - full width
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        
        PdfPCell logoCell;
        
        try {
            // Carica il logo A.S.D. KARATE-SAN
            ClassPathResource logoResource = new ClassPathResource("images/Intestazione.png");
            System.out.println("Loading logo from: " + logoResource.getPath());
            
            if (!logoResource.exists()) {
                System.out.println("Logo file not found: " + logoResource.getPath());
                throw new IOException("Logo file not found: " + logoResource.getPath());
            }
            
            InputStream logoInputStream = logoResource.getInputStream();
            System.out.println("Logo input stream opened successfully");
            
            BufferedImage logoImage = ImageIO.read(logoInputStream);
            System.out.println("Logo image loaded: " + (logoImage != null ? "success" : "failed") + " - size: " + 
                (logoImage != null ? logoImage.getWidth() + "x" + logoImage.getHeight() : "N/A"));
            
            if (logoImage == null) {
                System.out.println("Failed to read logo image");
                throw new IOException("Failed to read logo image");
            }
            
            com.itextpdf.text.Image logoPdf = com.itextpdf.text.Image.getInstance(logoImage, null);
            
            // Scala il logo per adattarsi alla larghezza della pagina (A4 width ~ 525px)
            float maxWidth = 525;
            if (logoPdf.getWidth() > maxWidth) {
                float ratio = maxWidth / logoPdf.getWidth();
                logoPdf.scaleAbsolute(maxWidth, logoPdf.getHeight() * ratio);
            }
            
            // Logo cell con immagine reale
            logoCell = new PdfPCell(logoPdf, true);
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            logoCell.setVerticalAlignment(Element.ALIGN_TOP);
            logoCell.setPadding(0);
            
            System.out.println("Logo added to PDF successfully");
        } catch (Exception e) {
            System.out.println("Error loading logo: " + e.getMessage());
            e.printStackTrace();
            
            // Fallback a testo se l'immagine non è disponibile
            logoCell = new PdfPCell(new Phrase("A.S.D. KARATE-SAN\n\n(Intestazione non disponibile)", new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD)));
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logoCell.setPadding(20);
            logoCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        }
        
        headerTable.addCell(logoCell);
        document.add(headerTable);
        
        // Spazio dopo header
        document.add(Chunk.NEWLINE);

        // Titolo e numero ricevuta centrati
        Paragraph titleParagraph = new Paragraph();
        titleParagraph.add(new Chunk("RICEVUTA", titleFont));
        titleParagraph.add(new Chunk(" numero ", normalFont));
        titleParagraph.add(new Chunk(numeroRicevuta, boldFont));
        titleParagraph.add(new Chunk(" del ", normalFont));
        titleParagraph.add(new Chunk(pagamento.getData().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), boldFont));
        titleParagraph.setAlignment(Element.ALIGN_CENTER);
        titleParagraph.setSpacingAfter(30);
        document.add(titleParagraph);

        // Corpo della ricevuta
        Paragraph corpo = new Paragraph();
        corpo.add(new Chunk("Con la presente si attesta che ", normalFont));
        corpo.add(new Chunk(atleta.getNome() + " " + atleta.getCognome(), boldFont));
        corpo.add(new Chunk(" con CF " + (atleta.getCf() != null ? atleta.getCf() : "N/D"), normalFont));
        corpo.add(new Chunk(" ha effettuato il pagamento di €", normalFont));
        corpo.add(new Chunk(String.format("%.2f", pagamento.getImporto()), boldFont));
        corpo.setAlignment(Element.ALIGN_JUSTIFIED);
        corpo.setSpacingAfter(50);
        document.add(corpo);

        // Tabella informazioni associazione
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(30);
        
        // Intestazione tabella
        PdfPCell infoHeaderCell = new PdfPCell(new Phrase("INFORMAZIONI DI CONTATTO", boldFont));
        infoHeaderCell.setColspan(2);
        infoHeaderCell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        infoHeaderCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        infoHeaderCell.setPadding(10);
        infoTable.addCell(infoHeaderCell);

        // Dati associazione
        addInfoTableRow(infoTable, "Sede legale:", ASSOCIAZIONE_SEDE, normalFont);
        addInfoTableRow(infoTable, "Codice Fiscale:", ASSOCIAZIONE_CF, normalFont);
        addInfoTableRow(infoTable, "Mail:", ASSOCIAZIONE_EMAIL, normalFont);
        addInfoTableRow(infoTable, "Website:", ASSOCIAZIONE_WEBSITE, normalFont);
        addInfoTableRow(infoTable, "Tel:", ASSOCIAZIONE_TEL, normalFont);

        document.add(infoTable);

        document.close();
        
        return outputStream.toByteArray();
    }

    public byte[] generateResoconto730(Atleta atleta, List<Pagamento> pagamenti, int anno) throws IOException, DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);
        
        document.open();

        // Header con intestazione.png centrata
        Image intestazione;
        try {
            ClassPathResource logoResource = new ClassPathResource("images/Intestazione.png");
            InputStream logoInputStream = logoResource.getInputStream();
            BufferedImage logoImage = ImageIO.read(logoInputStream);
            intestazione = Image.getInstance(logoImage, null);
            intestazione.scaleToFit(PageSize.A4.getWidth(), 120);
            intestazione.setAlignment(Element.ALIGN_TOP);
            document.add(intestazione);
            document.add(Chunk.NEWLINE);
            document.add(Chunk.NEWLINE);
        } catch (Exception e) {
            System.out.println("Error loading intestazione.png: " + e.getMessage());
            intestazione = null;
        }

        Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normal = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Font small = FontFactory.getFont(FontFactory.HELVETICA, 9);

        // Scritta associazione sotto la foto (solo se l'immagine è stata caricata)
        Paragraph associazione = new Paragraph("\n\n\n\n\n\n\n\n\n\n\n\nL'associazione sportiva dilettantistica A.S.D. KARATE-SAN,\ncon sede legale in Seregno, Via Galileo Galilei nr. 67,\ncodice fiscale n. 91125000157", normal);
        associazione.setAlignment(Element.ALIGN_LEFT);
        associazione.setSpacingBefore(10);
        document.add(associazione);
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // DICHIARA
        Paragraph dichiara = new Paragraph("DICHIARA:", normal);
        dichiara.setAlignment(Element.ALIGN_CENTER);
        document.add(dichiara);
        document.add(Chunk.NEWLINE);

        // Testo ricevuta
        document.add(new Paragraph(String.format("Di aver ricevuto per frequentazione al corso di KARATE per l'anno %d il seguente corrispettivo:", anno), normal));
        document.add(Chunk.NEWLINE);

        // Calcolo totale
        double totale = pagamenti.stream()
            .mapToDouble(p -> p.getImporto() != null ? p.getImporto() : 0.0)
            .sum();

        // Dati atleta centrati
        Paragraph nominativo = new Paragraph(atleta.getNome() + " " + atleta.getCognome() + "  Codice Fiscale: " + (atleta.getCf() != null ? atleta.getCf() : "N/D") + "    Somma versata: € " + String.format("%.2f", totale), bold);
        nominativo.setAlignment(Element.ALIGN_CENTER);
        document.add(nominativo);
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Testo fiscale
        document.add(new Paragraph("Si comunica che ai sensi dell'art. 15, comma 1°, lett. I-quinquies del TUIR, le spese, per un importo non superiore a 210 euro all'anno, ad associazioni sportive dilettantistiche sono detraibili nella misura del 19% e che l'associazione risulta in possesso dei requisiti a tal fine richiesti.", small));
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);

        // Data allineata a destra
        String data730 = String.format("31/12/%d", anno);
        Paragraph dataFirma = new Paragraph("Seregno, " + data730, normal);
        dataFirma.setAlignment(Element.ALIGN_RIGHT);
        document.add(dataFirma);
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);
        document.add(Chunk.NEWLINE);
        
        // Firma
        try {
            ClassPathResource firmaResource = new ClassPathResource("images/firma.png");
            InputStream firmaInputStream = firmaResource.getInputStream();
            BufferedImage firmaImage = ImageIO.read(firmaInputStream);
            Image firma = Image.getInstance(firmaImage, null);
            firma.scaleToFit(120, 50);
            firma.setAlignment(Element.ALIGN_RIGHT);
            document.add(firma);
        } catch (Exception e) {
            System.out.println("Firma image not found, skipping signature image: " + e.getMessage());
        }
        
        Paragraph presidente = new Paragraph("A.S.D. KARATE-SAN\nIl Presidente p.t.", small);
        presidente.setAlignment(Element.ALIGN_RIGHT);
        document.add(presidente);
        document.add(Chunk.NEWLINE);

        document.close();
        
        return outputStream.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addInfoTableRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        
        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
