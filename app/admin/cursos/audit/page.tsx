export default function CourseActivityAuditPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const loadLogs = useCallback(async (currentOffset: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/activity-logs?limit=${limit}&offset=${currentOffset}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Acesso restrito a administradores. Faça login com palafozanderson@gmail.com.");
        }
        throw new Error(json.error || "Não foi possível carregar os registros de atividades.");
      }
      setLogs(Array.isArray(json.logs) ? json.logs : []);
      setTotal(typeof json.pagination?.total === "number" ? json.pagination.total : 0);
    } catch (err) {
      setLogs([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : "Erro ao carregar auditoria.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadLogs(offset);
  }, [offset, loadLogs]);
