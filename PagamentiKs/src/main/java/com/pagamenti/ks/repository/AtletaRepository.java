package com.pagamenti.ks.repository;

import com.pagamenti.ks.model.Atleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    List<Atleta> findByCognomeContainingIgnoreCaseOrNomeContainingIgnoreCase(String cognome, String nome);
}
