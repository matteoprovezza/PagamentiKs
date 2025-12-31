package com.pagamenti.ks.repository;

import com.pagamenti.ks.model.Pagamento;
import com.pagamenti.ks.model.enums.TipoPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    List<Pagamento> findByAtletaId(Long atletaId);
    
    List<Pagamento> findByTipoPagamento(TipoPagamento tipoPagamento);
    
    @Query("SELECT p FROM Pagamento p WHERE p.data BETWEEN :startDate AND :endDate")
    List<Pagamento> findBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(p.importo) FROM Pagamento p WHERE p.atleta.id = :atletaId")
    Double getTotalPagamentiByAtletaId(@Param("atletaId") Long atletaId);
    
    @Query("SELECT SUM(p.importo) FROM Pagamento p WHERE p.atleta.id = :atletaId AND p.tipoPagamento = :tipo")
    Double getTotalPagamentiByAtletaIdAndTipo(
        @Param("atletaId") Long atletaId, 
        @Param("tipo") TipoPagamento tipo
    );
    
    @Query("SELECT p FROM Pagamento p WHERE p.atleta.id = :atletaId AND p.tipoPagamento = :tipo")
    List<Pagamento> findByAtletaIdAndTipoPagamento(
        @Param("atletaId") Long atletaId,
        @Param("tipo") TipoPagamento tipo
    );
    
    List<Pagamento> findByMetodoPagamento(String metodoPagamento);
    
    List<Pagamento> findByDataAfter(LocalDate date);
}
