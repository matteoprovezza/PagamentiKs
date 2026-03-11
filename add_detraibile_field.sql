-- Script per aggiungere il campo detraibile alla tabella pagamenti

-- Aggiungi la colonna se non esiste già
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='pagamenti' 
        AND column_name='detraibile'
    ) THEN
        ALTER TABLE pagamenti 
        ADD COLUMN detraibile BOOLEAN DEFAULT TRUE;
        
        RAISE NOTICE 'Colonna detraibile aggiunta con successo';
    ELSE
        RAISE NOTICE 'La colonna detraibile esiste già';
    END IF;
END $$;
