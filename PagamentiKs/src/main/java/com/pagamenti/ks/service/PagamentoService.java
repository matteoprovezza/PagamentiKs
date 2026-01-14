package com.pagamenti.ks.service;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.model.Pagamento;
import com.pagamenti.ks.model.enums.TipoPagamento;
import com.pagamenti.ks.repository.AtletaRepository;
import com.pagamenti.ks.repository.PagamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final AtletaRepository atletaRepository;

    public PagamentoService(PagamentoRepository pagamentoRepository, AtletaRepository atletaRepository) {
        this.pagamentoRepository = pagamentoRepository;
        this.atletaRepository = atletaRepository;
    }

    public List<Pagamento> findAll() {
        return pagamentoRepository.findAllWithAtleta();
    }

    public Optional<Pagamento> findById(Long id) {
        return pagamentoRepository.findAllWithAtleta().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    public Pagamento save(Pagamento pagamento) {
        // Handle case where athlete is nested object
        if (pagamento.getAtleta() != null && pagamento.getAtleta().getId() != null) {
            // If athlete is properly set in the payment object, use createPagamento
            return createPagamento(pagamento.getAtleta().getId(), pagamento);
        } else {
            // Otherwise, save directly (for cases where athlete might not be set)
            return pagamentoRepository.save(pagamento);
        }
    }

    public Pagamento createPagamento(Long atletaId, Pagamento pagamento) {
        Atleta atleta = atletaRepository.findById(atletaId)
                .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + atletaId));
        
        // Set the athlete for the payment
        pagamento.setAtleta(atleta);
        
        // Save the payment - cascade will handle the relationship
        return pagamentoRepository.save(pagamento);
    }

    public Pagamento update(Long id, Pagamento pagamentoDetails) {
        return pagamentoRepository.findById(id)
                .map(pagamento -> {
                    pagamento.setImporto(pagamentoDetails.getImporto());
                    pagamento.setData(pagamentoDetails.getData());
                    pagamento.setMetodoPagamento(pagamentoDetails.getMetodoPagamento());
                    return pagamentoRepository.save(pagamento);
                })
                .orElseThrow(() -> new RuntimeException("Pagamento non trovato con id: " + id));
    }

    public void deleteById(Long id) {
        pagamentoRepository.deleteById(id);
    }

    public List<Pagamento> findByAtleta(Long atletaId) {
        return pagamentoRepository.findByAtletaIdWithAtleta(atletaId);
    }

    public List<Pagamento> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return pagamentoRepository.findBetweenDatesWithAtleta(startDate, endDate);
    }

    public List<Pagamento> findByMetodoPagamento(String metodoPagamento) {
        TipoPagamento tipoPagamento = TipoPagamento.fromValue(metodoPagamento);
        return pagamentoRepository.findByTipoPagamentoWithAtleta(tipoPagamento);
    }

    public Double getTotalPaymentsByAtleta(Long atletaId) {
        return pagamentoRepository.getTotalPagamentiByAtletaId(atletaId);
    }

    public List<Pagamento> findRecentPayments(int days) {
        LocalDate cutoffDate = LocalDate.now().minusDays(days);
        return pagamentoRepository.findByDataAfterWithAtleta(cutoffDate);
    }
    
    public Double getTotalPagamentiByAtletaIdAndTipo(Long atletaId, TipoPagamento tipo) {
        return pagamentoRepository.getTotalPagamentiByAtletaIdAndTipo(atletaId, tipo);
    }
    
    public List<Pagamento> findByTipoPagamento(TipoPagamento tipo) {
        return pagamentoRepository.findByTipoPagamentoWithAtleta(tipo);
    }
    
    public List<Pagamento> findByAtletaAndDateRange(Long atletaId, LocalDate startDate, LocalDate endDate) {
        return pagamentoRepository.findByAtletaIdAndDataBetweenWithAtleta(atletaId, startDate, endDate);
    }
    
    public Optional<Atleta> findAtletaById(Long atletaId) {
        return atletaRepository.findById(atletaId);
    }
}
