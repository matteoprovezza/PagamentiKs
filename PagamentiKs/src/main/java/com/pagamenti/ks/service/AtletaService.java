package com.pagamenti.ks.service;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.repository.AtletaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AtletaService {

    private final AtletaRepository atletaRepository;

    public AtletaService(AtletaRepository atletaRepository) {
        this.atletaRepository = atletaRepository;
    }

    public List<Atleta> findAll() {
        return atletaRepository.findAll();
    }

    public Optional<Atleta> findById(Long id) {
        return atletaRepository.findById(id);
    }

    public Atleta save(Atleta atleta) {
        if (atleta.getDataIscrizione() == null) {
            atleta.setDataIscrizione(LocalDate.now());
        }
        return atletaRepository.save(atleta);
    }

    public Atleta update(Long id, Atleta atletaDetails) {
        return atletaRepository.findById(id)
                .map(atleta -> {
                    atleta.setNome(atletaDetails.getNome());
                    atleta.setCognome(atletaDetails.getCognome());
                    atleta.setCf(atletaDetails.getCf());
                    atleta.setDataNascita(atletaDetails.getDataNascita());
                    atleta.setIndirizzo(atletaDetails.getIndirizzo());
                    atleta.setTelefono(atletaDetails.getTelefono());
                    atleta.setEmail(atletaDetails.getEmail());
                    atleta.setDataScadenzaCertificato(atletaDetails.getDataScadenzaCertificato());
                    atleta.setAttivo(atletaDetails.isAttivo());
                    atleta.setNote(atletaDetails.getNote());
                    return atletaRepository.save(atleta);
                })
                .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + id));
    }

    public void deleteById(Long id) {
        atletaRepository.deleteById(id);
    }

    public List<Atleta> search(String searchTerm) {
        return atletaRepository.findByCognomeContainingIgnoreCaseOrNomeContainingIgnoreCase(searchTerm, searchTerm);
    }

    public Atleta disableAtleta(Long id) {
        return atletaRepository.findById(id)
                .map(atleta -> {
                    atleta.setAttivo(false);
                    atleta.setDisableDate(LocalDate.now());
                    return atletaRepository.save(atleta);
                })
                .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + id));
    }

    public Atleta enableAtleta(Long id) {
        return atletaRepository.findById(id)
                .map(atleta -> {
                    atleta.setAttivo(true);
                    atleta.setDisableDate(null);
                    return atletaRepository.save(atleta);
                })
                .orElseThrow(() -> new RuntimeException("Atleta non trovato con id: " + id));
    }

    public List<Atleta> findActiveAthletes() {
        return atletaRepository.findAll().stream()
                .filter(Atleta::isAttivo)
                .toList();
    }

    public List<Atleta> findAthletesWithExpiringCertificate(int daysBefore) {
        LocalDate dateLimit = LocalDate.now().plusDays(daysBefore);
        return atletaRepository.findAll().stream()
                .filter(atleta -> atleta.isAttivo() && 
                        atleta.getDataScadenzaCertificato() != null &&
                        atleta.getDataScadenzaCertificato().isBefore(dateLimit))
                .toList();
    }
}
