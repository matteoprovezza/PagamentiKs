-- Script per aggiungere il campo scadenza_tesseramento_asc alla tabella atleti

-- Aggiungi la colonna se non esiste già
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='atleti' 
        AND column_name='scadenza_tesseramento_asc'
    ) THEN
        ALTER TABLE atleti 
        ADD COLUMN scadenza_tesseramento_asc DATE;
        
        RAISE NOTICE 'Colonna scadenza_tesseramento_asc aggiunta con successo';
    ELSE
        RAISE NOTICE 'La colonna scadenza_tesseramento_asc esiste già';
    END IF;
END $$;
