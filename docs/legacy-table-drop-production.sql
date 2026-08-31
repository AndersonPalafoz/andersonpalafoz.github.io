-- REMOÇÃO FÍSICA DEFINITIVA — NÃO EXECUTAR SEM APROVAÇÃO FINAL
-- Este arquivo fica fora de drizzle/migrations para impedir execução automática.
-- Pré-requisitos: backup restaurável, janela de manutenção, staging validado,
-- 30 dias sem fallback e migração das dependências concluída.

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

-- Impede execução parcial caso qualquer condição de prontidão não seja atendida.
DO $$
DECLARE
  fallback_count integer;
  legacy_count integer;
  fk_count integer;
  archive_grades integer;
  archive_attendance integer;
BEGIN
  SELECT COUNT(*) INTO fallback_count
  FROM event_logs
  WHERE "eventType" = 'legacy_fallback_read'
    AND "createdAt" >= NOW() - INTERVAL '30 days';

  SELECT COUNT(*) INTO legacy_count
  FROM (
    SELECT id FROM external_classes
    UNION ALL SELECT id FROM external_students
    UNION ALL SELECT id FROM external_class_grades
    UNION ALL SELECT id FROM external_class_attendance
    UNION ALL SELECT id FROM external_class_materials
    UNION ALL SELECT id FROM external_class_teacher_assignments
  ) records;

  SELECT COUNT(*) INTO fk_count
  FROM pg_constraint con
  JOIN pg_class rc ON rc.oid = con.confrelid
  WHERE con.contype = 'f'
    AND rc.relname IN ('external_classes', 'external_students', 'external_class_grades', 'external_class_attendance', 'external_class_materials', 'external_class_teacher_assignments');

  SELECT COUNT(*) INTO archive_grades FROM legacy_external_class_grades_archive;
  SELECT COUNT(*) INTO archive_attendance FROM legacy_external_class_attendance_archive;

  IF fallback_count > 0 THEN
    RAISE EXCEPTION 'DROP bloqueado: % fallback(s) nos últimos 30 dias', fallback_count;
  END IF;
  IF legacy_count > 0 THEN
    RAISE EXCEPTION 'DROP bloqueado: % registro(s) ainda existem nas tabelas legadas', legacy_count;
  END IF;
  IF fk_count > 0 THEN
    RAISE EXCEPTION 'DROP bloqueado: % foreign key(s) ainda referenciam tabelas legadas', fk_count;
  END IF;
  IF archive_grades < 18 OR archive_attendance < 2 THEN
    RAISE EXCEPTION 'DROP bloqueado: arquivo histórico incompleto (notas=%, frequências=%)', archive_grades, archive_attendance;
  END IF;
END $$;

-- A remoção só é alcançada quando todos os gates acima passam.
DROP TABLE external_class_teacher_assignments;
DROP TABLE external_class_materials;
DROP TABLE external_class_attendance;
DROP TABLE external_class_grades;
DROP TABLE external_students;
DROP TABLE external_classes;

COMMIT;
