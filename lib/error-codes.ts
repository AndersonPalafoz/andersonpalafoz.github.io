export interface HttpErrorDescription {
  status: number;
  title: string;
  message: string;
  actionHint: string;
}

export function describeHttpError(status: number, defaultMessage?: string): HttpErrorDescription {
  switch (status) {
    case 400:
      return {
        status: 400,
        title: "Erro 400: Requisição Inválida",
        message: defaultMessage || "Os dados enviados estão incompletos ou em formato inválido.",
        actionHint: "Verifique os campos preenchidos e tente novamente.",
      };
    case 401:
      return {
        status: 401,
        title: "Erro 401: Não Autenticado",
        message: defaultMessage || "Sua sessão expirou ou você não está conectado.",
        actionHint: "Faça login novamente com sua conta autorizada.",
      };
    case 403:
      return {
        status: 403,
        title: "Erro 403: Acesso Negado",
        message: defaultMessage || "Você não possui permissão para executar esta operação.",
        actionHint: "Certifique-se de acessar com a conta de administrador (palafozanderson@gmail.com).",
      };
    case 404:
      return {
        status: 404,
        title: "Erro 404: Não Encontrado",
        message: defaultMessage || "O recurso solicitado não foi encontrado no servidor.",
        actionHint: "Atualize a página ou verifique se o item ainda existe.",
      };
    case 409:
      return {
        status: 409,
        title: "Erro 409: Conflito de Dados",
        message: defaultMessage || "Já existe um registro com estes dados (ex: e-mail ou matrícula duplicados).",
        actionHint: "Utilize outro identificador ou edite o registro existente.",
      };
    case 500:
    default:
      return {
        status: status || 500,
        title: `Erro ${status || 500}: Falha Interna no Servidor`,
        message: defaultMessage || "Ocorreu um erro inesperado no banco de dados ou no servidor.",
        actionHint: "Tente novamente em alguns instantes ou contate o suporte.",
      };
  }
}
