-- Append-only audit log and ledger postings: prevent UPDATE and DELETE.

CREATE OR REPLACE FUNCTION yatrasewa_prevent_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Append-only table: cannot update or delete rows from %', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_security_audit_immutable ON "SecurityAuditLog";
CREATE TRIGGER trg_security_audit_immutable
BEFORE UPDATE OR DELETE ON "SecurityAuditLog"
FOR EACH ROW EXECUTE FUNCTION yatrasewa_prevent_mutation();

DROP TRIGGER IF EXISTS trg_ledger_posting_immutable ON "LedgerPosting";
CREATE TRIGGER trg_ledger_posting_immutable
BEFORE UPDATE OR DELETE ON "LedgerPosting"
FOR EACH ROW EXECUTE FUNCTION yatrasewa_prevent_mutation();
