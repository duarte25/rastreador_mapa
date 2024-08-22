// Função para verificar se onde a função está sendo chamada está do lado do servidor ou do lado do cliente
const verificarRenderizacao = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL;
  } else {
    return process.env.API_URL;
  }
}

// Função fetchApi criada para garantir que todas requisições passem por aqui, garantir mesmo retorno e facilitar as validações em um único lugar
export const fetchApi = async (route, method, data, ...props) => {
  try {
    // chama função para pegar o env da API
    let urlApi = verificarRenderizacao();
    let dados = null;

    // se for método GET recebe as querys e cria uma URL já com encode
    if (method === "GET" && data) {
      let urlSearch = new URLSearchParams(data);
      route = `${route}?${urlSearch}`;
    }

    if (method !== "GET" && data) {
      if (data instanceof FormData) {
        // Se os dados forem uma instância de FormData (envio de arquivos)
        dados = data;
      } else {
        // Caso contrário, assume-se que são dados JSON
        dados = JSON.stringify(data);
      }
    }

    const response = await fetch(`${urlApi}${route}`, {
      method: method,
      body: dados,
      cache: "no-store",
      ...props
    });

    const responseData = await response.json();

    // se erro retorna o array de dados vazio
    if (responseData?.error) {
      return {
        data: [],
        error: true,
        errors: responseData?.errors ?? [{ message: "Não foi possível identificar o erro, contate o Administrador" }]
      };
    } else {
      return responseData;
    }

  } catch (error) {
    // se erro retorna o array de dados vazio
    console.log(error);

    return {
      data: [],
      error: true,
      errors: [{ message: error?.message ?? "Ocorreu um erro inesperado, contate o Administrador" }]
    };
  }
}

export const fetchApiDespaginado = async (route, method, body, ...props) => {
  let result = [];
  let pagina = 1;
  let maxPaginas = 100; // Só para não ir infinito (máximo 100 fetchs)
  while(pagina < maxPaginas) {
      const { data, ...fetchInfo } = await fetchApi(route, method, {
          ...body,
          ...{
              pagina: pagina
          }
      }, ...props);

      if(fetchInfo.error) {
        return fetchInfo;
      }

      for(let item of data) {
          result.push(item);
      }

      if(!fetchInfo.totalPaginas || pagina >= fetchInfo.totalPaginas) {
        break;
      }

      pagina++;
  }

  return {
    data: result,
    error: false,
    errors: []
  };
};