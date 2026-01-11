package com.pagamenti.ks.controller;

import com.pagamenti.ks.model.Pagamento;
import com.pagamenti.ks.model.enums.TipoPagamento;
import com.pagamenti.ks.service.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pagamenti")
@Tag(name = "Payments", description = "Payments management API")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
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
    
    @GetMapping("/atleta/{atletaId}/ricevuta")
    @Operation(summary = "Generate PDF receipt for athlete's latest payment")
    public ResponseEntity<String> generateRicevuta(@PathVariable Long atletaId) {
        // Implementazione temporanea - restituisce un messaggio invece di generare il PDF
        return ResponseEntity.ok("Generazione ricevuta non ancora implementata per l'atleta " + atletaId);
    }
}