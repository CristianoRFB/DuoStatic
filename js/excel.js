/* Dados de exercícios extraídos dos arquivos Excel da disciplina.
   Textos das caixas de enunciado foram lidos das próprias planilhas.
   A planilha Tabela Slide.xlsx contém dados, mas não traz exercícios
   escritos: os desafios correspondentes são sinalizados como gerados. */
(function(){
 "use strict";
 const cases=[];
 const add=(topic,id,title,statement,extra)=>cases.push({topic,id,title,statement,source:"Excel",...extra});
 // Intervalo de confiança_Proporção_ADS.xlsx - Exercícios (1 a 6)
 add("prop","excel-prop-1","Desemprego no Estado",
 "Para se avaliar a taxa de desemprego em determinado Estado, escolhe-se uma amostra aleatória de 1000 habitantes em idade de trabalho e contam-se os desempregados: 89. Estimar a proporção de desempregados em todo o Estado (população). Avaliar o erro padrão de estimativa, para 95% de confiança.",
 {type:"prop",n:1000,success:89,conf:95,field:"desempregados",tokens:{n:"1000",success:"89",conf:"95%"},extra:"standardError",source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 1"});
 add("prop","excel-prop-2","Peixes próprios para consumo",
 "Dentre 100 peixes capturados num certo lago, 18 não estavam apropriados para consumo devido aos níveis de poluição do ambiente. Construa um intervalo de confiança de 99% para a correspondente verdadeira proporção de peixes apropriados para consumo.",
 {type:"prop",n:100,fail:18,success:82,conf:99,field:"peixes próprios para consumo",tokens:{n:"100",fail:"18",conf:"99%"},source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 2"});
 add("prop","excel-prop-3","Candidato B",
 "Numa pesquisa eleitoral, 40% dentre os 2.305 entrevistados afirmaram que votariam no candidato B. Qual o intervalo de confiança de nível 95% para a real proporção de votos deste candidato?",
 {type:"prop",n:2305,rate:.40,conf:95,field:"eleitores do candidato B",tokens:{p:"40%",n:"2.305",conf:"95%"},source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 3"});
 add("prop","excel-prop-4","Lançar um produto: 95%",
 "Um empreendedor deseja lançar um novo produto com a condição de que ao menos 25% das pessoas tenham interesse no produto. Para isso, contrata uma empresa de marketing que realiza uma pesquisa com 500 pessoas, das quais 155 declararam interesse em comprar o produto. Encontrar o intervalo de confiança de 95% para determinar se o empreendedor lançaria o produto.",
 {type:"prop",n:500,success:155,conf:95,target:.25,threshold:"minimum",field:"interessados no produto",tokens:{target:"25%",n:"500",success:"155",conf:"95%"},source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 4"});
 add("prop","excel-prop-5","Lançar um produto: 99%",
 "No problema anterior, querendo uma confiabilidade maior, o empreendedor deseja analisar os dados da pesquisa com 99% de confiança. Nestas condições, o empreendedor ainda lançaria o produto? Considere a mesma pesquisa: 155 interessados em 500 pessoas, com interesse mínimo exigido de 25%.",
 {type:"prop",n:500,success:155,conf:99,target:.25,threshold:"minimum",field:"interessados no produto",tokens:{conf:"99%",success:"155",n:"500",target:"25%"},source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 5 (dados retomados do exercício 4)"});
 add("prop","excel-prop-6","Preferência por analgésicos",
 "Um ensaio clínico foi realizado para determinar a preferência entre dois analgésicos, A e B, contra dor de cabeça. Cem pacientes receberam os dois em ordem aleatória. Dos 100 pacientes, 45 preferiram A e 55 preferiram B. Podemos dizer que há preferência por algum dos analgésicos? Use 95% de confiança.",
 {type:"prop",n:100,success:55,conf:95,target:.5,threshold:"difference",field:"pacientes que preferiram B",tokens:{n:"100",success:"55",conf:"95%"},source:"Intervalo de confiança_Proporção_ADS.xlsx · Exercícios · 6"});
 // Exemplo escrito na aba Erro para proporção
 add("prop","excel-prop-exemplo","Exemplo: candidato A",
 "Em uma pesquisa eleitoral, entre 2200 eleitores, 860 declararam que pretendem votar no candidato A. Construir um intervalo de confiança com 95% de confiança para as intenções de voto para esse candidato.",
 {type:"prop",n:2200,success:860,conf:95,field:"eleitores do candidato A",tokens:{n:"2200",success:"860",conf:"95%"},example:true,source:"Intervalo de confiança_Proporção_ADS.xlsx · Erro para proporção · Exemplo 1"});
 // Intervalo de confiança_Média_AMS.xlsx - Exercícios (1 a 9)
 add("media","excel-media-1","Plano de internet ilimitado",
 "Um provedor de acesso à internet deseja implantar um plano sem limite de horas. Para isso, verificou numa amostra de 50 usuários os tempos de utilização mensal, obtendo: média amostral de 140,8 horas com um desvio padrão de 6,5 horas. Encontre um intervalo de confiança 95% para a média populacional.",
 {type:"mean",n:50,mean:140.8,sd:6.5,conf:95,unit:"horas",tokens:{n:"50",mean:"140,8",sd:"6,5",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 1"});
 add("media","excel-media-2","Notas do teste",
 "Em uma amostra de 150 notas de um teste, temos que a média foi de 77,6 e o desvio padrão 14,2. Com um grau de confiança de 95%, determine: a) a margem de erro E; b) o intervalo de confiança para a média populacional.",
 {type:"mean",n:150,mean:77.6,sd:14.2,conf:95,unit:"pontos",extra:"margin",tokens:{n:"150",mean:"77,6",sd:"14,2",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 2"});
 add("media","excel-media-3","Preço da passagem",
 "Em uma pesquisa de marketing realizada com 50 pessoas sobre o valor ideal que uma passagem de ônibus municipal deveria custar, chegou-se a um valor médio de R$ 3,50 com um desvio padrão de R$ 0,50. Determinar o intervalo de confiança com 95% de grau de confiança para o estudo.",
 {type:"mean",n:50,mean:3.50,sd:.50,conf:95,unit:"R$",tokens:{n:"50",mean:"3,50",sd:"0,50",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 3"});
 add("media","excel-media-4","TVs compradas há anos",
 "Uma amostra consiste em 75 aparelhos de TV adquiridos há vários anos. Os tempos de substituição desses aparelhos têm média de 8,2 anos e desvio padrão de 1,1 ano. Construa um intervalo de 90% de confiança para o tempo médio de substituição dos aparelhos de TV daquela época. O resultado se aplica aos aparelhos de TV que estão sendo vendidos atualmente?",
 {type:"mean",n:75,mean:8.2,sd:1.1,conf:90,unit:"anos",threshold:"old-sample",tokens:{n:"75",mean:"8,2",sd:"1,1",conf:"90%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 4"});
 add("media","excel-media-5","Vida útil das lâmpadas",
 "O gerente de controle da qualidade de uma fábrica de lâmpadas precisa estimar a média da vida útil de uma grande remessa. Uma amostra aleatória contendo 64 lâmpadas indicou média de 350 horas. O desvio padrão do processo corresponde a 100 horas. a) Construa o IC de 95% para a vida útil média; b) o fabricante pode declarar média de 400 horas?",
 {type:"mean",n:64,mean:350,sd:100,conf:95,unit:"horas",target:400,threshold:"targetInRange",tokens:{n:"64",mean:"350",sd:"100",conf:"95%",target:"400"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 5"});
 add("media","excel-media-6","Espessura da pintura",
 "Numa fábrica de pintura de peças de carro, a espessura desejada é de 150 mícrons. Em 50 pontos da peça, a espessura média foi de 148 mícrons e o desvio padrão de 3,3 mícrons. Encontre o intervalo de confiança com grau de 95%. É plausível que a média corresponda ao valor desejado?",
 {type:"mean",n:50,mean:148,sd:3.3,conf:95,unit:"mícrons",target:150,threshold:"targetInRange",tokens:{target:"150",n:"50",mean:"148",sd:"3,3",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 6"});
 add("media","excel-media-7","Idade dos pós-graduandos",
 "Pedro leu que um aluno de pós-graduação tem em média 33 anos. Na universidade dele, uma amostra aleatória de 45 alunos apresentou idade média de 32,2 anos e desvio padrão de 4,3 anos. Encontre o intervalo com 95% de confiança. É possível que a média de todos também seja de 33 anos?",
 {type:"mean",n:45,mean:32.2,sd:4.3,conf:95,unit:"anos",target:33,threshold:"targetInRange",tokens:{target:"33",n:"45",mean:"32,2",sd:"4,3",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 7"});
 add("media","excel-media-8","Carregamento sem fio",
 "O projeto especifica que carregar uma bateria não pode levar mais de 2 horas. Uma amostra aleatória de 40 celulares teve tempo médio de carregamento de 124 minutos e desvio padrão de 7,23 minutos. Com 95% de confiança, encontre o IC para o tempo médio. Podemos afirmar que os tempos de carregamento cumprem as especificações?",
 {type:"mean",n:40,mean:124,sd:7.23,conf:95,unit:"minutos",target:120,threshold:"maximum",tokens:{target:"2 horas",n:"40",mean:"124",sd:"7,23",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 8"});
 add("media","excel-media-9","Aceitação do produto a R$ 50",
 "O fabricante quer vender um produto a R$ 50,00. Em pesquisa com 100 pessoas, o valor ideal médio foi de R$ 45,50, com desvio padrão de R$ 5,00. Encontre o intervalo de confiança de 99% para analisar a aceitação do preço desejado.",
 {type:"mean",n:100,mean:45.5,sd:5,conf:99,unit:"R$",target:50,threshold:"targetInRange",tokens:{target:"50,00",n:"100",mean:"45,50",sd:"5,00",conf:"99%"},source:"Intervalo de confiança_Média_AMS.xlsx · Exercícios · 9"});
 add("media","excel-media-exemplo","Exemplo: altura dos estudantes",
 "Em uma pesquisa com 40 estudantes de ADS da Fatec Jales, chegou-se à média de altura dos homens de 1,75 m e desvio padrão de 0,13 m. Determinar o intervalo de confiança com 95%.",
 {type:"mean",n:40,mean:1.75,sd:.13,conf:95,unit:"m",example:true,tokens:{n:"40",mean:"1,75",sd:"0,13",conf:"95%"},source:"Intervalo de confiança_Média_AMS.xlsx · Erro para média · Exemplo"});
 // Correlação e Regressão Linear.xlsx - Amostra, exercício com partes 1 a 6(f)
 const original="Considere os dados sobre os usuários de internet com relação ao sexo, idade e tempo de permanência na internet (horas por semana).";
 const corrSource="Correlação e Regressão Linear.xlsx · Amostra · Exercício";
 const common={source:corrSource,dataset:"usuarios",original};
 const task=(id,title,statement,taskId,question,opts,answer,explanation,kind="classification")=>{
   add(taskId==="q6"?"reg":"corr",id,title,statement,{...common,type:"dataset",task:taskId,question,opts,answer,explanation,mode:kind});
 };
 task("excel-corr-1a","Classificar a variável sexo",original+" 1) Classifique as variáveis da tabela: sexo, idade e tempo de acesso. Qual o tipo da variável sexo?","q1","A variável sexo é...",["Qualitativa nominal","Quantitativa discreta","Qualitativa ordinal","Quantitativa contínua"],0,"Sexo identifica categorias sem ordem natural.");
 task("excel-corr-1b","Classificar a idade",original+" 1) Classifique as variáveis. Como a idade está registrada nesta tabela?","q1","A idade, informada em anos inteiros, está registrada como...",["Quantitativa discreta","Qualitativa nominal","Qualitativa ordinal","Quantitativa contínua"],0,"Na tabela, idade foi registrada em anos inteiros; idade cronológica pode ser contínua fora desse registro.");
 task("excel-corr-1c","Classificar o tempo de acesso",original+" 1) Classifique as variáveis. Tempo semanal de acesso, medido em horas, é...", "q1","O tempo semanal de acesso é...",["Quantitativa contínua","Qualitativa nominal","Qualitativa ordinal","Quantitativa discreta"],0,"Tempo é mensurável continuamente, mesmo quando a planilha mostra horas inteiras.");
 task("excel-corr-2a","Frequência da variável sexo",original+" 2) Construa as frequências simples, percentuais e acumuladas da variável sexo. A tabela traz 30 usuários, dos quais 17 são M e 13 são F.","q2","Qual é a frequência percentual de M?",["56,7%","43,3%","17%","30%"],0,"A frequência relativa é 17 ÷ 30 ≈ 56,7%. Categorias nominais não possuem ordem natural para frequência acumulada.", "frequency");
 task("excel-corr-2b","Frequência das horas semanais",original+" 2) Construa as frequências simples, percentuais e acumuladas do tempo de acesso. O valor 30 horas aparece 7 vezes dentre 30 usuários.","q2","Qual é a frequência percentual de 30 horas?",["23,3%","30%","7%","70%"],0,"7 ÷ 30 × 100 ≈ 23,3%. A tabela pode ser ordenada para calcular a frequência acumulada.", "frequency");
 task("excel-corr-2c","Frequência acumulada",original+" 2) Calcule a frequência acumulada do tempo de acesso. A tabela tem 30 registros.","q2","O que é a frequência acumulada até 30 horas?",["A soma das frequências de todos os valores até 30","A quantidade apenas de valores iguais a 30","A soma de todos os tempos em horas","A média semanal de acessos"],0,"A frequência acumulada soma as contagens na ordem crescente, do menor valor até 30.", "frequency");
 task("excel-corr-3a","Gráfico para sexo",original+" 3) Construa um gráfico para a variável sexo.","q3","Qual é um gráfico adequado para as categorias sexo?",["Gráfico de barras","Dispersão entre X e Y","Curva normal obrigatória","Reta de regressão"],0,"Barras com as frequências M e F permitem comparar as categorias.", "chart");
 task("excel-corr-3b","Gráfico para horas",original+" 3) Construa um gráfico para o tempo de acesso semanal.","q3","Qual gráfico ajuda a mostrar como os tempos de acesso se distribuem?",["Histograma ou barras de frequência","Diagrama de setores com idades e renda","Reta de regressão sem outra variável","Mapa do Brasil"],0,"Um histograma ou barras de frequência revela onde as horas se concentram.", "chart");
 task("excel-corr-4a","Média semanal",original+" 4) Calcule a média do tempo de acesso semanal para os 30 usuários.","q4","Qual operação calcula a média de tempo semanal?",["Somar as 30 horas e dividir por 30","Pegar apenas a hora mais frequente","Pegar o maior tempo","Subtrair o menor do maior"],0,"A média aritmética usa a soma de todas as observações dividida por n.", "statMean");
 task("excel-corr-4b","Moda das horas",original+" 4) Calcule a moda do tempo semanal de acesso.","q4","Moda é...",["O tempo que mais se repete","A soma dividida pela quantidade","O valor central após ordenar","O desvio padrão"],0,"A moda corresponde ao tempo com maior frequência.", "statMode");
 task("excel-corr-4c","Mediana das horas",original+" 4) Calcule a mediana do tempo semanal de acesso.","q4","Com 30 valores ordenados, a mediana é...",["A média dos valores da posição 15 e 16","O valor da posição 1","A média dos extremos","A frequência mais alta"],0,"Em amostras pares, faça a média dos dois valores centrais.", "statMedian");
 task("excel-corr-4d","Variância amostral",original+" 4) Calcule a variância do tempo de acesso semanal.","q4","Qual é a ideia da variância?",["Medir o espalhamento quadrático em torno da média","Descobrir a categoria mais frequente","Montar a reta de regressão","Contar M e F"],0,"Para a variância amostral, some os quadrados das diferenças à média e divida por n−1.", "statVariance");
 task("excel-corr-4e","Desvio padrão amostral",original+" 4) Calcule o desvio padrão do tempo de acesso semanal.","q4","O desvio padrão amostral é...",["A raiz quadrada da variância amostral","A própria média","A porcentagem de M","O coeficiente de correlação"],0,"O desvio padrão retorna o espalhamento à unidade original, horas.", "statStd");
 task("excel-corr-5a","Quartis do BoxPlot",original+" 5) Construa o BoxPlot do tempo semanal e identifique os quartis.","q5","O que representam Q1 e Q3?",["Os cortes aproximados de 25% e 75% dos dados ordenados","Os tempos mínimo e máximo em toda ocasião","A média e o desvio","As colunas sexo e idade"],0,"Os quartis dividem o conjunto ordenado em quatro partes. O método de quartis precisa ser declarado.", "quartile");
 task("excel-corr-5b","Valor atípico no BoxPlot",original+" 5) Verifique se existem outliers nos tempos de acesso.","q5","Como o BoxPlot identifica um possível outlier?",["Valores além das cercas Q1−1,5×AIQ e Q3+1,5×AIQ","Todo valor acima da média","Todo valor repetido","Todo valor abaixo de 30"],0,"AIQ é Q3−Q1. As cercas indicam valores possivelmente atípicos.", "outlier");
 task("excel-corr-5c","Escore Z para outlier",original+" 5) Utilize o escore z para fazer a análise dos valores atípicos.","q5","O escore z mede...",["Quantos desvios o valor está distante da média","A frequência percentual de sexo","A inclinação da reta","A confiança da amostra"],0,"z = (valor−média)/desvio. Para 60 horas, o valor é quase 3 desvios acima da média.", "outlierZ");
 task("excel-corr-6a","Gráfico de dispersão",original+" 6) Analisar a correlação entre Idade e Tempo de acesso semanal. a) Construa o gráfico de dispersão.","q6","Quais pares entram no gráfico?",["Idade no eixo X e horas no eixo Y","Somente sexo no eixo X","A soma de idades no eixo X","Somente 30 horas no eixo Y"],0,"Cada linha fornece um par (idade, horas) que vira um ponto.", "scatter");
 task("excel-corr-6b","Sentido da correlação",original+" 6b) O que pode ser dito sobre a correlação entre idade e tempo de acesso?","q6","Os dados indicam uma associação linear...",["Forte e positiva","Forte e negativa","Exatamente nula","De causalidade comprovada"],0,"O Pearson é próximo de +0,883: quanto maior a idade, mais horas aparecem nesta amostra; não implica causalidade.", "pearson");
 task("excel-corr-6c","Equação da regressão",original+" 6c) Caso exista correlação, encontre a equação de regressão linear entre idade (X) e horas (Y).","q6","A equação deve permitir...",["Prever as horas Y a partir da idade X","Provar que a idade causa acessos","Estimar proporção de homens","Calcular o erro de uma pesquisa eleitoral"],0,"A regressão das horas em função da idade resulta aproximadamente Y = 0,9185X + 11,6016.", "regression");
 task("excel-corr-6d","Prever horas aos 50 anos",original+" 6d) Estime o tempo de acesso semanal para a idade de 50 anos.","q6","Qual método fornece a estimativa?",["Substituir X = 50 na reta Y = aX+b","Usar o percentual de mulheres","Calcular um IC de proporção","Multiplicar idade pela moda"],0,"A reta indica 57,53 horas aproximadamente, mas 50 anos está fora da faixa de idades observadas (12 a 40).", "prediction");
 task("excel-corr-6e","Prever horas aos 70 anos",original+" 6e) É possível estimar tempo de acesso para um usuário de 70 anos? Justifique.","q6","Qual é o problema de usar X = 70?",["Extrapolação muito além das idades observadas","70 não é um número inteiro","A idade é categórica","Precisamos de um IC para proporções"],0,"Pode-se calcular um número pela reta, mas não é uma previsão confiável porque a amostra vai só até 40 anos.", "extrapolation");
 task("excel-corr-6f","Estimar idade a partir de 50 horas",original+" 6f) Estime a idade para um usuário com tempo de acesso de 50 horas.","q6","O que muda quando queremos prever IDADE a partir de HORAS?",["Ajustar uma nova regressão com idade como Y e horas como X","Trocar o sinal de Pearson","Somar todas as idades e horas","Considerar automaticamente 50 anos"],0,"Ajuste idade = a×horas+b, invertendo qual é a variável resposta; não basta inverter ingenuamente uma reta de mínimos quadrados.", "reverseRegression");
 // Tabela Slide.xlsx contém dados, não enunciados. Exercícios extras claramente sinalizados.
 add("corr","excel-tabela-1","Tabela Slide: tipo de escolaridade",
 "Na aba Amostra de Tabela Slide.xlsx há 31 funcionários com escolaridade, salário, idade e tempo de serviço. Qual tipo de variável representa a escolaridade Fundamental, Médio ou Superior?",
 {source:"Tabela Slide.xlsx · Amostra (treino gerado a partir dos dados; não há enunciados na aba)",type:"dataset",mode:"classification",question:"A escolaridade registrada é...",opts:["Qualitativa ordinal","Quantitativa contínua","Qualitativa nominal sem ordenação","Quantitativa discreta"],answer:0,explanation:"Fundamental, Médio e Superior são categorias com ordem de nível.",generated:true});
 add("corr","excel-tabela-2","Tabela Slide: salário e escolaridade",
 "A tabela de funcionários contém salário em reais e escolaridade em níveis. Qual gráfico permite comparar salários por escolaridade?",
 {source:"Tabela Slide.xlsx · Amostra (treino gerado a partir dos dados; não há enunciados na aba)",type:"dataset",mode:"chart",question:"Para comparar as distribuições de salário por grupo, qual gráfico é mais informativo?",opts:["BoxPlots de salário separados por escolaridade","Gráfico de linhas ordenado por nome","Reta de regressão com sexo","Diagrama de setores com salário como categoria"],answer:0,explanation:"BoxPlots por categoria mostram mediana, dispersão e valores extremos dos salários.",generated:true});

 // Contexto didático: explica POR QUE cada caso existe. Os enunciados
 // originais continuam preservados no campo statement.
 const practicalContexts={
  "excel-prop-1":"Um órgão público precisa estimar o desemprego em todo um estado, mas não consegue entrevistar todos os moradores. Por isso, observa apenas uma amostra e conta quantos estão desempregados.",
  "excel-prop-2":"Uma equipe ambiental encontrou peixes impróprios para alimentação em um lago. A pergunta não é quantos estão contaminados, mas qual pode ser a porcentagem de peixes próprios para consumo no lago inteiro.",
  "excel-prop-3":"Uma pesquisa eleitoral ouviu parte dos eleitores para estimar o apoio ao candidato B na população. A taxa observada pode não ser exatamente a porcentagem de todos os eleitores.",
  "excel-prop-4":"Um empreendedor só deseja lançar seu produto se a procura for suficiente. Ele pesquisou consumidores e precisa verificar se o intervalo sustenta a meta mínima de interesse.",
  "excel-prop-5":"É a mesma decisão de lançar o produto, mas com um grau maior de confiança. Será que a conclusão continua igual quando a faixa fica mais larga?",
  "excel-prop-6":"Um estudo comparou dois remédios para dor de cabeça. Queremos descobrir se a diferença observada entre as preferências indica uma vantagem real ou pode ser apenas variação da amostra.",
  "excel-prop-exemplo":"Uma pesquisa eleitoral entrevistou parte da população para estimar a porcentagem real de intenção de voto em um candidato.",
  "excel-media-1":"Um provedor de internet avalia criar um plano sem limite de horas. Para planejar esse serviço, precisa estimar quanto tempo, em média, os usuários ficam conectados.",
  "excel-media-2":"Uma escola aplicou uma prova e quer conhecer a média de notas de todos os estudantes. Como só observou uma parte, precisa calcular uma faixa para a média.",
  "excel-media-3":"Uma empresa de ônibus pesquisou qual valor de passagem parece justo aos passageiros. A pesquisa busca uma faixa para o valor médio considerado ideal.",
  "excel-media-4":"Uma pesquisa mediu quanto tempo TVs antigas demoravam até ser substituídas. O desafio é estimar a média daquela época e reconhecer que TVs atuais são outra população.",
  "excel-media-5":"Uma fábrica quer saber a vida útil média de uma grande remessa de lâmpadas e conferir se pode anunciar determinada duração.",
  "excel-media-6":"Uma indústria de automóveis quer manter a pintura na espessura exigida. Ela mede várias partes da peça e usa uma faixa para verificar se a média parece atender ao padrão.",
  "excel-media-7":"Um estudante quer saber se a média de idade dos colegas da sua universidade pode ser compatível com a média divulgada para outros pós-graduandos.",
  "excel-media-8":"Uma fabricante promete carregamento de bateria em até duas horas. Ela mediu vários celulares e precisa verificar se os dados sustentam essa promessa.",
  "excel-media-9":"Uma empresa pretende cobrar R$ 50 por um produto. Ela pesquisou o preço que consumidores consideram justo e quer verificar se R$ 50 é compatível com o resultado.",
  "excel-media-exemplo":"Uma turma mediu a altura de parte dos estudantes. O objetivo é estimar uma faixa para a média de altura de todos os estudantes do grupo estudado."
 };
 const corrStory="Uma pesquisa acompanhou 30 usuários de internet. Para cada pessoa foram anotados sexo, idade e tempo de acesso por semana. Cada exercício examina uma característica diferente dessa mesma tabela.";
 const employeeStory="Uma empresa organizou informações de 31 funcionários, como idade, escolaridade, salário e tempo de serviço. A tarefa é entender como ler e comparar esses dados.";
 for(const item of cases){
   item.context=practicalContexts[item.id]||
     (item.id.startsWith("excel-corr-")?corrStory:
       item.id.startsWith("excel-tabela-")?employeeStory:"");
   item.reconstructed=false;
 }

 window.EXCEL_CASES=cases;
})();
