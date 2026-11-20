# DuoStatic — Academia Carmesim

Minijogo responsivo para aprender **a interpretar enunciados** de Estatística Aplicada, com trilha de lições, desenhos, perguntas interativas, treino infinito e cinco chibis da Arlecchino enviadas pelo usuário e cuidadosamente recortadas.

**Site:** https://duostatic-carmesim.pages.dev

## Conteúdo

São seis territórios e quatro casas em cada (24 etapas), em ordem de **prioridade dos materiais mais recentes**:
1. Tamanho da amostra — 10 de novembro.
2. Intervalo de confiança da proporção — 27 de outubro.
3. Intervalo de confiança da média — 27 de outubro.
4. Correlação de Pearson — 25 de agosto.
5. Regressão linear simples — 25 de agosto.
6. Escore Z — 11 de agosto.

Acompanhamento visual: cada tema tem **fluxograma interativo com nós conectados**, cálculo por etapas, valores do exemplo real ou aleatório e ilustrações SVG. É possível tocar em qualquer etapa para ver como o número foi obtido. 

A sequência principal agora é **enunciado → tradução em português claro → identificar os dados → escolher a operação → calcular → interpretar**. Cada resposta correta libera apenas a próxima etapa e destaca números no enunciado; respostas incorretas permitem nova tentativa sem entregar o gabarito. O treino infinito aceita todos os territórios ou até dois escolhidos, sem fim automático.

## Exercícios Excel realmente incluídos

- **Intervalo de confiança da proporção:** seis exercícios sobre desemprego, peixes, eleições, lançamento de produto (95% e 99%) e preferência de analgésicos; inclui também o exemplo resolvido do candidato A.
- **Intervalo de confiança da média:** os nove exercícios da aba `Exercícios` (internet, notas, passagem de ônibus, TV, lâmpadas, pintura, pós-graduação, carregamento e preço de produto) e o exemplo de altura.
- **Correlação e Regressão Linear:** todos os itens do enunciado original, incluindo classificação das três variáveis; tabelas de frequência, gráficos, média, moda, mediana, variância, desvio, BoxPlot, quartis, outliers, escore Z, correlação, regressão e previsões diretas e inversas.
- **Tabela Slide.xlsx:** contém apenas uma base de funcionários, sem exercícios escritos. Há dois desafios claramente identificados como **treinos gerados** a partir desses dados.

Total: **41 roteiros** de prática guiada, incluindo exemplos e desafios derivados. O modo Infinito seleciona os roteiros conforme o tema; a aba **Excel** apresenta todos para estudo individual. Na aba Configurações, a opção *Dados aleatórios* recalcula os valores em cenários numéricos, enquanto *Dados reais* mantém os parâmetros originais das planilhas.

Os cálculos usam os valores críticos normais ensinados nos materiais (z = 1,645/1,96/2,575). A variância e o desvio padrão do conjunto de tempos de acesso usam a fórmula **amostral**; os quartis do BoxPlot usam a convenção **inclusiva**. Algumas conclusões exigem verificar se o valor proposto está dentro do intervalo ou se seria uma extrapolação fora dos dados observados.

## Instalar e usar offline

1. Abra **https://duostatic-carmesim.pages.dev** com internet, uma vez.
2. Aguarde o aviso **Offline pronto** na barra superior. Ele indica que o Service Worker guardou o aplicativo, as lições, os gráficos SVG, as cinco imagens e os scripts.
3. Depois, abra novamente o endereço mesmo sem internet. O site poderá carregar pelo cache.
4. Opcionalmente, acesse **Configurações → Estudar sem internet → Instalar aplicativo**. No Chrome, se o botão nativo não aparecer, use o menu ⋮ → Instalar aplicativo/Adicionar à tela inicial. No Safari do iOS, Compartilhar → Adicionar à Tela de Início.

**A instalação é opcional:** o modo offline também pode funcionar dentro do navegador. O progresso continua salvo no `localStorage` local. O modo offline inclui também `js/excel.js`, `js/guiado.js` e `css/guiado.css`. Não há sincronização entre aparelhos: limpar dados do navegador ou desinstalar o aplicativo pode apagar as respostas. A leitura em voz alta depende das vozes disponíveis no dispositivo.

Arquivos do modo offline: `manifest.webmanifest`, `sw.js`, `js/offline.js` e `assets/app-icon.svg`. O Service Worker usa a estratégia **rede primeiro e cache na ausência de conexão**, com pré-armazenamento de todos os arquivos essenciais. Em ambiente local, o Service Worker funciona em `http://localhost` ou HTTPS, não em `file://`. Para atualizar a lista de recursos armazenados, altere `CACHE_VERSION` em `sw.js`.

## Dados de aula

O jogo contém os 53 exercícios-base anteriores, mais **41 atividades guiadas de planilhas Excel**. As atividades foram extraídas dos textos de caixas/objetos incorporados ao arquivo Excel, além dos valores registrados nas células. O estudo guiado mostra uma decisão por vez, destaca os dados encontrados com animação e toca sinais distintos de acerto e erro.

Os materiais utilizados foram fornecidos em aula pela professora Andrea P. Silva:

- `Correlação e Regressão Linear_AMS.pdf`: servidores, complexidade × bugs, usuários × banda, conceitos e alertas.
- `Correlação e Regressão Linear.xlsx`: todos os **30 pares** idade × tempo semanal de acesso da aba Amostra.
- `Intervalo de confiança_Média.pdf`: alturas, servidor, RAM e sessões.
- `Intervalo de confiança_Proporção.pdf`: bugs, 2FA, satisfação, preferências e etiquetas.
- `Tamanho da Amostra_AMS.pdf`: API, margem de erro, testes de qualidade e pesquisas.
- `Medida de posição relativa_AMS.pptx`: escore Z, servidores, RAM, latência e acessos.

A opção **Configurações → Valores dos exercícios** alterna entre:
- **Dados reais:** preserva os valores dos casos e das planilhas.
- **Aleatórios:** modifica os parâmetros e recalcula respostas e alternativas.

Resultados numéricos são calculados pelo próprio JavaScript com os valores críticos **1,645 (90%), 1,96 (95%) e 2,575 (99%)** usados nos materiais. O código não copia possíveis inconsistências de rótulo/resultado dos slides (por exemplo, a indicação “39%; 41%” ao lado do intervalo “0,37; 0,41” no exemplo de pesquisa eleitoral do PDF de proporção).

**Nota:** Os métodos implementados seguem os exercícios introdutórios com aproximação normal. Em aplicações avançadas, é importante analisar pressupostos, tamanho da amostra e casos em que a distribuição t ou outro método é mais adequado.

## Estrutura

```text
DuoStatic/
├── index.html            # Estrutura sem frameworks
├── assets/
│   ├── arle-calma.webp      # Recepção / boas-vindas
│   ├── arle-vitoria.webp    # Respostas corretas / conclusão
│   ├── arle-sentada.webp    # Aulas / menu do treino infinito
│   ├── arle-irritada.webp   # Respostas incorretas
│   ├── arle-pensativa.webp  # Dicas / interpretação
│   ├── app-icon.svg       # Ícone PWA
│   └── mascote.svg         # Mascote anterior (legado, não utilizado)
├── css/
│   ├── style.css         # Cores, animações e responsividade
│   └── fluxo.css         # Fluxos de cálculo SVG e modo offline
├── js/
│   ├── dados.js          # Conceitos, pistas, casos e exercícios
│   ├── app.js            # Cálculos, telas, trilha, treino e progresso
│   ├── fluxo.js          # Fluxos SVG dinâmicos
│   └── offline.js        # Instalação e indicação do cache offline
├── sw.js                 # Service Worker e cache
├── manifest.webmanifest  # Metadados do app instalável
└── tests/
    └── smoke.test.js     # Testes automatizados sem dependências
```

Não há API, login, rastreamento ou biblioteca externa. O progresso permanece **somente no localStorage do dispositivo atual**.

## Executar localmente

Abra `index.html` num navegador moderno. Alternativamente, na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Depois visite `http://localhost:8000`.

## Testar

Requer Node.js 20 ou superior, sem `npm install`:

```bash
node --test tests/smoke.test.js
```

Os testes conferem as 24 casas, os 53 exercícios-base, a consistência das opções em ambos os modos, feedback, progressão e navegação.

## Publicação

Repositório `CristianoRFB/DuoStatic`, branch `main`. Cloudflare Pages está conectado ao repositório. O deploy usa **comando de build vazio** e **diretório de saída `.`**. Alterações em `main` geram novas publicações automaticamente.

## Editar exercícios

- Abra `js/dados.js` e inclua objetos em `questions`.
- Use `kind: "choice"` para interpretação e `kind: "z" | "mean" | "prop" | "sampleMean" | "sampleProp" | "pearson" | "regression" | "compareZ"` para casos calculados.
- Anote a fonte no campo `src`, a pista no campo `cue` e mantenha `why` para explicar o motivo da resposta.
- Execute os testes antes de publicar.

As cinco ilustrações são **imagens fornecidas pelo usuário**. O tratamento do projeto removeu o fundo e preservou a arte original. As imagens permanecem sujeitas aos direitos de seus respectivos autores.
