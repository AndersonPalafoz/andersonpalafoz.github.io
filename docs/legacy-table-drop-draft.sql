-- RASCUNHO — NÃO EXECUTAR AUTOMATICAMENTE
--
-- Este arquivo não está em drizzle/migrations de propósito. Ele só pode ser
-- promovido para uma migration após todos os gates de prontidão do plano.
-- A execução deve ocorrer em janela de manutenção, com backup restaurado
-- previamente em ambiente isolado e aprovação registrada.

BEGIN;

-- Gate 1: nenhuma leitura de fallback recente.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM event_logs
    WHERE "eventType" = 'legacy_fallback_read'
      AND "createdAt" >= NOW() - INTERVAL '14 days'
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'DROP bloqueado: houve leitura de fallback nos últimos 14 dias';
  END IF;
END $$;

-- Gate 2: nenhuma escrita/dado acadêmico legado pendente.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM external_classes LIMIT 1)
     OR EXISTS (SELECT 1 FROM external_students LIMIT 1)
     OR EXISTS (SELECT 1 FROM external_class_grades LIMIT 1)
     OR EXISTS (SELECT 1 FROM external_class_attendance LIMIT 1)
     OR EXISTS (SELECT 1 FROM external_class_materials LIMIT 1)
     OR EXISTS (SELECT 1 FROM grade_review_requests LIMIT 1) THEN
    RAISE EXCEPTION 'DROP bloqueado: ainda existem registros legados ou revisões de notas';
  END IF;
END $$;

-- Gate 3: estas dependências devem ter sido substituídas por um mapa histórico
-- e removidas em uma migration anterior. Nunca usar CASCADE silenciosamente.
DO $$
DECLARE
  dependency_count integer;
BEGIN
  SELECT COUNT(*) INTO dependency_count
  FROM pg_constraint con
  JOIN pg_class referenced_class ON referenced_class.oid = con.confrelid
  WHERE con.contype = 'f'
    AND referenced_class.relname IN (
      'external_students',
      'external_classes',
      'external_class_grades',
      'external_class_attendance',
      'external_class_materials',
      'external_class_teacher_assignments'
    );
  IF dependency_count > 0 THEN
    RAISE EXCEPTION 'DROP bloqueado: % foreign key(s) legada(s) ainda existem', dependency_count;
  END IF;
END $$;

-- A ordem abaixo só pode ser liberada depois de os gates acima passarem:
-- DROP TABLE IF EXISTS external_class_teacher_assignments;
-- DROP TABLE IF EXISTS external_class_materials;
-- DROP TABLE IF EXISTS external_class_attendance;
-- DROP TABLE IF EXISTS external_class_grades;
-- DROP TABLE IF EXISTS external_students;
-- DROP TABLE IF EXISTS external_classes;

ROLLBACK;
