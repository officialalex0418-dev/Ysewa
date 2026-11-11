-- Enforce Σ debits = Σ credits for each journal entry,
-- updated on insert of all postings referencing the entry.
-- This runs AFTER EACH STATEMENT in the transaction, so by commit time
-- all postings must balance.

CREATE OR REPLACE FUNCTION yatrasewa_ledger_balance_check()
RETURNS TRIGGER AS $$
DECLARE
  total_debit  NUMERIC(14,2);
  total_credit NUMERIC(14,2);
  entry_ids    TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT "journalEntryId") INTO entry_ids FROM newtab;

  FOR i IN 1..array_length(entry_ids, 1) LOOP
    SELECT COALESCE(SUM("debitAmount"), 0),
           COALESCE(SUM("creditAmount"), 0)
      INTO total_debit, total_credit
      FROM "LedgerPosting"
     WHERE "journalEntryId" = entry_ids[i];

    IF total_debit <> total_credit THEN
      RAISE EXCEPTION 'Ledger unbalanced for journal_entry %: debits=% credits=%', entry_ids[i], total_debit, total_credit;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_balance ON "LedgerPosting";
CREATE TRIGGER trg_ledger_balance
AFTER INSERT ON "LedgerPosting"
REFERENCING NEW TABLE AS newtab
FOR EACH STATEMENT EXECUTE FUNCTION yatrasewa_ledger_balance_check();
