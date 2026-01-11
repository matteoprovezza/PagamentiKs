package com.pagamenti.ks.controller;

import com.itextpdf.text.DocumentException;
import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.model.Pagamento;
import com.pagamenti.ks.model.enums.TipoPagamento;
import com.pagamenti.ks.service.PagamentoService;
import com.pagamenti.ks.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1/pagamenti")
@Tag(name = "Payments", description = "Payments management API")
public class PagamentoController {

    private final PagamentoService pagamentoService;
    private final PdfService pdfService;
    private final AtomicLong receiptCounter = new AtomicLong(1);

    public PagamentoController(PagamentoService pagamentoService, PdfService pdfService) {
        this.pagamentoService = pagamentoService;
        this.pdfService = pdfService;
    }

    @GetMapping
    @Operation(summary = "Get all payments with optional filters")
    public ResponseEntity<List<Pagamento>> getAll(
            @RequestParam(required = false) Long atletaId,
            @RequestParam(required = false) TipoPagamento tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        if (atletaId != null) {
            return ResponseEntity.ok(pagamentoService.findByAtleta(atletaId));
        }
        
        if (tipo != null) {
            return ResponseEntity.ok(pagamentoService.findByTipoPagamento(tipo));
        }
        
        if (fromDate != null && toDate != null) {
            return ResponseEntity.ok(pagamentoService.findByDateRange(fromDate, toDate));
        }
        
        return ResponseEntity.ok(pagamentoService.findAll());
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent payments (last X days)")
    public ResponseEntity<List<Pagamento>> getRecentPayments(
            @RequestParam(defaultValue = "7") int days) {
        List<Pagamento> payments = pagamentoService.findRecentPayments(days);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<Pagamento> getOne(@PathVariable Long id) {
        return pagamentoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/atleta/{atletaId}/totale")
    @Operation(summary = "Get total payments for an athlete")
    public ResponseEntity<Double> getTotalByAtleta(
            @PathVariable Long atletaId,
            @RequestParam(required = false) TipoPagamento tipo) {
        
        Double totale;
        if (tipo != null) {
            totale = pagamentoService.getTotalPagamentiByAtletaIdAndTipo(atletaId, tipo);
        } else {
            totale = pagamentoService.getTotalPaymentsByAtleta(atletaId);
        }
        
        return ResponseEntity.ok(totale != null ? totale : 0.0);
    }
    
    @GetMapping("/atleta/{atletaId}/total")
    @Operation(summary = "Get total payments amount for a specific athlete")
    public ResponseEntity<Double> getTotalPaymentsByAthlete(
            @PathVariable Long atletaId) {
        Double total = pagamentoService.getTotalPaymentsByAtleta(atletaId);
        return ResponseEntity.ok(total != null ? total : 0.0);
    }

    @PostMapping
    @Operation(summary = "Create a new payment")
    public ResponseEntity<Pagamento> create(@RequestBody Pagamento pagamento) {
        try {
            // Handle case where athlete is nested object
            if (pagamento.getAtleta() != null && pagamento.getAtleta().getId() != null) {
                // If athlete is properly set in the payment object, use createPagamento
                return ResponseEntity.ok(pagamentoService.createPagamento(pagamento.getAtleta().getId(), pagamento));
            } else {
                // Otherwise, save directly (for cases where athlete might not be set)
                return ResponseEntity.ok(pagamentoService.save(pagamento));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/atleta/{atletaId}")
    @Operation(summary = "Create a new payment for an athlete")
    public ResponseEntity<Pagamento> createForAthlete(
            @PathVariable Long atletaId, 
            @RequestBody Pagamento pagamento) {
        try {
            return ResponseEntity.ok(pagamentoService.createPagamento(atletaId, pagamento));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a payment")
    public ResponseEntity<Pagamento> update(
            @PathVariable Long id, 
            @RequestBody Pagamento pagamento) {
        try {
            return ResponseEntity.ok(pagamentoService.update(id, pagamento));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payment")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            pagamentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/total")
    @Operation(summary = "Get total payments amount within a date range")
    public ResponseEntity<Double> getTotalPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Pagamento> pagamenti = pagamentoService.findByDateRange(startDate, endDate);
        double total = pagamenti.stream()
            .mapToDouble(p -> p.getImporto() != null ? p.getImporto() : 0.0)
            .sum();
            
        return ResponseEntity.ok(total);
    }
    
    @GetMapping("/{id}/ricevuta")
    @Operation(summary = "Generate PDF receipt for payment")
    public ResponseEntity<byte[]> generateRicevuta(@PathVariable Long id) {
        try {
            System.out.println("Generating receipt for payment ID: " + id);
            
            // Get payment details
            Pagamento pagamento = pagamentoService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pagamento non trovato con id: " + id));
            
            System.out.println("Payment found: " + pagamento.getId() + ", athlete: " + pagamento.getAtleta());
            
            // Get athlete details
            Atleta atleta = pagamento.getAtleta();
            if (atleta == null) {
                System.out.println("Athlete is null in payment object, trying to get from atletaId");
                // If athlete is not loaded, fetch it separately
                Long atletaId = pagamento.getAtletaId();
                if (atletaId != null) {
                    atleta = pagamentoService.findAtletaById(atletaId)
                            .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + atletaId));
                } else {
                    System.out.println("Both atleta and atletaId are null");
                    return ResponseEntity.badRequest().build();
                }
            }
            
            System.out.println("Athlete found: " + (atleta != null ? "success" : "null") + 
                (atleta.getNome() != null ? atleta.getNome() : "N/A") + " " + 
                (atleta.getCognome() != null ? atleta.getCognome() : "N/A"));
            
            // Generate receipt number
            String numeroRicevuta = String.format("%03d", receiptCounter.getAndIncrement());
            
            // Generate PDF
            byte[] pdfContent = pdfService.generateRicevuta(pagamento, atleta, numeroRicevuta);
            
            System.out.println("PDF generated successfully, size: " + pdfContent.length + " bytes");
            
            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "ricevuta_" + (atleta != null ? atleta.getCognome() + "_" + atleta.getNome() : "unknown") + ".pdf");
            
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            System.out.println("RuntimeException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        } catch (IOException | DocumentException e) {
            System.out.println("IOException/DocumentException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            System.out.println("Generic Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/atleta/{atletaId}/ricevuta")
    @Operation(summary = "Generate PDF receipt for athlete's latest payment")
    public ResponseEntity<byte[]> generateRicevutaForAthlete(@PathVariable Long atletaId) {
        try {
            // Get athlete's payments
            List<Pagamento> pagamenti = pagamentoService.findByAtleta(atletaId);
            
            if (pagamenti.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Get the most recent payment
            Pagamento pagamento = pagamenti.get(pagamenti.size() - 1);
            
            // Get athlete details
            Atleta atleta = pagamentoService.findAtletaById(atletaId)
                    .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + atletaId));
            
            // Generate receipt number
            String numeroRicevuta = String.format("%03d", receiptCounter.getAndIncrement());
            
            // Generate PDF
            byte[] pdfContent = pdfService.generateRicevuta(pagamento, atleta, numeroRicevuta);
            
            // Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                "ricevuta_" + atleta.getCognome() + "_" + atleta.getNome() + ".pdf");
            
            return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException | DocumentException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}