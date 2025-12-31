package com.pagamenti.ks.service;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.model.Pagamento;
import com.pagamenti.ks.model.enums.TipoPagamento;
import com.pagamenti.ks.repository.AtletaRepository;
import com.pagamenti.ks.repository.PagamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        return pagamentoRepository.findAll();
    }

    public Optional<Pagamento> findById(Long id) {
        return pagamentoRepository.findById(id);
    }

    public Pagamento save(Pagamento pagamento) {
        return pagamentoRepository.save(pagamento);
    }

    public Pagamento createPagamento(Long atletaId, Pagamento pagamento) {
        Atleta atleta = atletaRepository.findById(atletaId)
                .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + atletaId));
        List<Pagamento> pagamenti = List.of(pagamento);
        atleta.setPagamenti(pagamenti);

        //pagamento.setAtleta(atleta);
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
        return pagamentoRepository.findByAtletaId(atletaId);
    }

    public List<Pagamento> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return pagamentoRepository.findBetweenDates(startDate, endDate);
    }

    public List<Pagamento> findByMetodoPagamento(String metodoPagamento) {
        return pagamentoRepository.findByMetodoPagamento(metodoPagamento);
    }

    public Double getTotalPaymentsByAtleta(Long atletaId) {
        return pagamentoRepository.getTotalPagamentiByAtletaId(atletaId);
    }

    public List<Pagamento> findRecentPayments(int days) {
        LocalDate cutoffDate = LocalDate.now().minusDays(days);
        return pagamentoRepository.findByDataAfter(cutoffDate);
    }
    
    public Double getTotalPagamentiByAtletaIdAndTipo(Long atletaId, TipoPagamento tipo) {
        return pagamentoRepository.getTotalPagamentiByAtletaIdAndTipo(atletaId, tipo);
    }
    
    public List<Pagamento> findByTipoPagamento(TipoPagamento tipo) {
        return pagamentoRepository.findByTipoPagamento(tipo);
    }
}
