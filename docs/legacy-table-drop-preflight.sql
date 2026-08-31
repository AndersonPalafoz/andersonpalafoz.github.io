-- PRÉ-VOO DA REMOÇÃO FÍSICA — SOMENTE LEITURA
-- Não executar em conjunto com o DROP. O resultado deve ser revisado e arquivado.

SELECT
  (SELECT COUNT(*)::int FROM external_classes) AS legacy_classes,
  (SELECT COUNT(*)::int FROM external_students) AS legacy_students,
  (SELECT COUNT(*)::int FROM external_class_grades) AS legacy_grades,
  (SELECT COUNT(*)::int FROM external_class_attendance) AS legacy_attendance,
  (SELECT COUNT(*)::int FROM external_class_materials) AS legacy_materials,
  (SELECT COUNT(*)::int FROM external_class_teacher_assignments) AS legacy_teacher_assignments,
  (SELECT COUNT(*)::int FROM legacy_external_class_grades_archive) AS archived_grades,
  (SELECT COUNT(*)::int FROM legacy_external_class_attendance_archive) AS archived_attendance,
  (SELECT COUNT(*)::int FROM event_logs WHERE "eventType" = 'legacy_fallback_read' AND "createdAt" >= NOW() - INTERVAL '30 days') AS fallback_30d,
  (SELECT COUNT(*)::int
   FROM pg_constraint con
   JOIN pg_class rc ON rc.oid = con.confrelid
   WHERE con.contype = 'f'
     AND rc.relname IN ('external_classes', 'external_students', 'external_class_grades', 'external_class_attendance', 'external_class_materials', 'external_class_teacher_assignments')) AS legacy_fk_count
LIMIT 1;

-- Todas as foreign keys restantes, com a tabela e ação de exclusão.
SELECT
  conrelid::regclass::text AS referencing_table,
  conname AS constraint_name,
  confrelid::regclass::text AS referenced_table,
  CASE con.confdeltype
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'NO ACTION'
    WHEN 'a' THEN 'RESTRICT'
    WHEN 'd' THEN 'SET DEFAULT'
    WHEN 'x' THEN 'SET NULL'
    ELSE con.confdeltype::text
  END AS on_delete
FROM pg_constraint con
JOIN pg_class rc ON rc.oid = con.confrelid
WHERE con.contype = 'f'
  AND rc.relname IN ('external_classes', 'external_students', 'external_class_grades', 'external_class_attendance', 'external_class_materials', 'external_class_teacher_assignments')
ORDER BY 1, 2
LIMIT 200;
