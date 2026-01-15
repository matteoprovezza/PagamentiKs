package com.pagamenti.ks.service;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.repository.AtletaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(AtletaService.class);

    @Transactional
    public Atleta update(Long id, Atleta atletaDetails) {
        logger.info("Inizio aggiornamento atleta con id: {}", id);
        logger.info("Dati ricevuti in ingresso: {}", atletaDetails);

        return atletaRepository.findById(id)
                .map(atleta -> {
                    logger.info("Atleta trovato nel DB prima dell'aggiornamento: {}", atleta);

                    // Log dei valori prima dell'aggiornamento
                    logger.info("Valore scadenzaTesseramentoAsc in ingresso: {}", atletaDetails.getScadenzaTesseramentoAsc());

                    // Aggiornamento campi
                    atleta.setNome(atletaDetails.getNome());
                    atleta.setCognome(atletaDetails.getCognome());
                    atleta.setCf(atletaDetails.getCf());
                    atleta.setDataNascita(atletaDetails.getDataNascita());
                    atleta.setIndirizzo(atletaDetails.getIndirizzo());
                    atleta.setTelefono(atletaDetails.getTelefono());
                    atleta.setEmail(atletaDetails.getEmail());
                    atleta.setDataScadenzaCertificato(atletaDetails.getDataScadenzaCertificato());

                    // Aggiornamento esplicito con log
                    LocalDate nuovaScadenza = atletaDetails.getScadenzaTesseramentoAsc();
                    logger.info("Imposto scadenzaTesseramentoAsc a: {}", nuovaScadenza);
                    atleta.setScadenzaTesseramentoAsc(nuovaScadenza);

                    LocalDate nuovaScadenzaFijlkam = atletaDetails.getScadenzaTesseramentoFijlkam();
                    logger.info("Imposto scadenzaTesseramentoFijlkam a: {}", nuovaScadenzaFijlkam);
                    atleta.setScadenzaTesseramentoFijlkam(nuovaScadenzaFijlkam);

                    atleta.setDataIscrizione(atletaDetails.getDataIscrizione());
                    if (atletaDetails.isAttivo() != null) {
                        atleta.setAttivo(atletaDetails.isAttivo());
                    }
                    atleta.setNote(atletaDetails.getNote());

                    Atleta atletaAggiornato = atletaRepository.save(atleta);
                    logger.info("Atleta dopo il salvataggio: {}", atletaAggiornato);

                    return atletaAggiornato;
                })
                .orElseThrow(() -> {
                    logger.error("Atleta non trovato con id: {}", id);
                    return new RuntimeException("Atleta non trovato con id: " + id);
                });
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
                .filter(atleta -> Boolean.TRUE.equals(atleta.isAttivo()))
                .toList();
    }

    public List<Atleta> findAthletesWithExpiringCertificate(int daysBefore) {
        LocalDate today = LocalDate.now();
        LocalDate dateLimit = LocalDate.now().plusDays(daysBefore);
        return atletaRepository.findAll().stream()
                .filter(atleta -> Boolean.TRUE.equals(atleta.isAttivo()) &&
                        atleta.getDataScadenzaCertificato() != null &&
                        !atleta.getDataScadenzaCertificato().isBefore(today) &&
                        !atleta.getDataScadenzaCertificato().isAfter(dateLimit))
                .toList();
    }

    public List<Atleta> findAthletesWithExpiringMembership(int daysBefore) {
        LocalDate today = LocalDate.now();
        LocalDate dateLimit = LocalDate.now().plusDays(daysBefore);
        return atletaRepository.findAll().stream()
                .filter(atleta -> Boolean.TRUE.equals(atleta.isAttivo()) &&
                        atleta.getScadenzaTesseramentoAsc() != null &&
                        !atleta.getScadenzaTesseramentoAsc().isBefore(today) &&
                        !atleta.getScadenzaTesseramentoAsc().isAfter(dateLimit))
                .toList();
    }

    public List<Atleta> findAthletesWithExpiringAscMembership(int daysBefore) {
        LocalDate today = LocalDate.now();
        LocalDate dateLimit = LocalDate.now().plusDays(daysBefore);
        return atletaRepository.findAll().stream()
                .filter(atleta -> Boolean.TRUE.equals(atleta.isAttivo()) &&
                        atleta.getScadenzaTesseramentoAsc() != null &&
                        !atleta.getScadenzaTesseramentoAsc().isBefore(today) &&
                        !atleta.getScadenzaTesseramentoAsc().isAfter(dateLimit))
                .toList();
    }

    public List<Atleta> findAthletesWithExpiringFijlkamMembership(int daysBefore) {
        LocalDate today = LocalDate.now();
        LocalDate dateLimit = LocalDate.now().plusDays(daysBefore);
        return atletaRepository.findAll().stream()
                .filter(atleta -> Boolean.TRUE.equals(atleta.isAttivo()) &&
                        atleta.getScadenzaTesseramentoFijlkam() != null &&
                        !atleta.getScadenzaTesseramentoFijlkam().isBefore(today) &&
                        !atleta.getScadenzaTesseramentoFijlkam().isAfter(dateLimit))
                .toList();
    }
}
