/* ================================================================
   DUOSTATIC | AJUDA DOS EXERCÍCIOS
   Mostra COMO encontrar a resposta, somente quando a pessoa abre
   a explicação. Tudo utiliza os números da questão atual; nenhuma
   resposta é inserida como texto fixo de outro exercício.
   ================================================================ */
(function(){
 "use strict";
 const fmt=(n,d=2)=>Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const pct=(n,d=1)=>fmt(Number(n)*100,d)+"%";
 const html=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const ref=confidence=>({90:1.645,95:1.96,99:2.575})[confidence]||1.96;
 function stepsFor(model,step,index){
   const item=model.item||{},q=step.question||"",kind=item.type,arr=[];
   const add=(...items)=>arr.push(...items.filter(Boolean));
   const wants=(...parts)=>parts.some(x=>q.toLowerCase().includes(x.toLowerCase()));
   const amount=(v,d=2)=>fmt(v,d);
   const z=item.conf?ref(item.conf):1.96;
   if(kind==="prop"){
     const n=item.n,p=item.rate!==undefined?item.rate:Number(item.success)/n,rest=1-p;
     const se=Math.sqrt(p*rest/n),margin=z*se;
     if(wants("quanta variação costuma ocorrer","erro padrão")){
       add("Identifique o TOTAL observado: "+fmt(n,0)+".","Encontre a porcentagem de casos que interessam: "+(item.success!==undefined?fmt(item.success,0)+" dividido por "+fmt(n,0)+" = ":"")+pct(p,2)+" (em decimal: "+fmt(p,4)+").",
         "Ache o restante: 100% menos "+pct(p,2)+" = "+pct(rest,2)+" (em decimal: "+fmt(rest,4)+").",
         "Multiplique as duas partes: "+fmt(p,4)+" × "+fmt(rest,4)+" = "+fmt(p*rest,6)+".",
         "Divida pelo total: "+fmt(p*rest,6)+" ÷ "+fmt(n,0)+" = "+fmt(p*rest/n,8)+".",
         "Tire a raiz quadrada: "+fmt(se,6)+". Para mostrar em pontos percentuais, multiplique por 100: "+fmt(se*100,2)+" pontos percentuais.");
       return {steps:arr,reason:"Este resultado mede a variação típica da porcentagem entre amostras desse tamanho. Ainda NÃO é a margem de erro do intervalo.",answer:fmt(se*100,2)+" pontos percentuais"};
     }
     if(wants("margem","erro dessa porcentagem")){
       add("Separe os dois grupos: "+pct(p,2)+" e "+pct(rest,2)+".",
         "Calcule a variação básica da proporção: multiplique "+fmt(p,4)+" por "+fmt(rest,4)+", divida por "+n+" e tire a raiz quadrada. Resultado: "+fmt(se,6)+".",
         "Consulte a tabela da confiança: "+item.conf+"% corresponde a "+fmt(z,3)+".",
         "Multiplique "+fmt(se,6)+" por "+fmt(z,3)+" e depois por 100: "+fmt(margin*100,2)+" pontos percentuais.");
       return {steps:arr,reason:"A margem é maior que o erro padrão porque também considera o nível de confiança escolhido.",answer:fmt(margin*100,2)+" pontos percentuais"};
     }
     if(wants("intervalo","faixa","limite")){
       add("Porcentagem observada: "+pct(p,2)+".",
         "Margem calculada: "+pct(margin,2)+" pontos percentuais.",
         "Limite menor: "+pct(p,2)+" menos "+pct(margin,2)+" = "+pct(p-margin,2)+".",
         "Limite maior: "+pct(p,2)+" mais "+pct(margin,2)+" = "+pct(p+margin,2)+".");
       return {steps:arr,reason:"Esse intervalo estima a porcentagem da população, não descreve individualmente cada pessoa.",answer:pct(p-margin,1)+" até "+pct(p+margin,1)};
     }
     if(wants("quantos casos","quantos atendem","grupo que interessa")){
       if(item.fail!==undefined){
         add("O enunciado informa "+n+" itens no total, mas "+item.fail+" NÃO atendem ao critério.",
           "Subtraia a quantidade que não atende: "+n+" menos "+item.fail+" = "+item.success+" itens que atendem.");
       }else add("Procure o grupo pedido na pergunta — não conte todo mundo como um caso favorável.",
         "O exercício informa "+fmt(item.success,0)+" casos dentro dos "+fmt(n,0)+" elementos observados.");
       return {steps:arr,reason:"Precisamos contar apenas os casos correspondentes ao objetivo do exercício."};
     }
     if(wants("porcentagem","proporção")&&index>0){
       if(item.rate!==undefined)add("O enunciado já informa a taxa observada: "+pct(p,1)+". Não é necessário contar casos novamente.");
       else add("Quantidade que interessa: "+fmt(item.success,0)+". Quantidade total: "+fmt(n,0)+".",
         "Divida "+fmt(item.success,0)+" por "+fmt(n,0)+": "+fmt(p,4)+".",
         "Multiplique por 100 para virar porcentagem: "+pct(p,2)+".");
       return {steps:arr,reason:"A parte dividida pelo todo informa a proporção, que pode ser apresentada como porcentagem."};
     }
     if(wants("amostra","quantas pessoas","itens observados","quantidade")){
       add("Procure quantos elementos foram observados no total, não apenas os desempregados ou casos favoráveis.",
         "O enunciado informa "+fmt(n,0)+" observações.");
       return {steps:arr,reason:"Esse total é usado para reduzir a incerteza da estimativa."};
     }
   }
   if(kind==="mean"){
     const n=item.n,mean=item.mean,sd=item.sd,margin=z*sd/Math.sqrt(n),unit=item.unit||"";
     if(wants("margem","distância","cada lado")){
       add("Desvio padrão: "+fmt(sd,2)+" "+unit+". Total de medições: "+fmt(n,0)+".",
         "Calcule a raiz quadrada de "+n+": aproximadamente "+fmt(Math.sqrt(n),4)+".",
         "Divida "+fmt(sd,2)+" por "+fmt(Math.sqrt(n),4)+": aproximadamente "+fmt(sd/Math.sqrt(n),5)+".",
         "A confiança de "+item.conf+"% corresponde a "+fmt(z,3)+" na tabela. Multiplique para obter "+fmt(margin,2)+" "+unit+".");
       return {steps:arr,reason:"Esse é o tamanho da margem de cada lado da média observada.",answer:fmt(margin,2)+" "+unit};
     }
     if(wants("intervalo","faixa","limite")){
       add("A média da amostra é "+fmt(mean,2)+" "+unit+". A margem é "+fmt(margin,2)+" "+unit+".",
         "Limite menor: "+fmt(mean,2)+" menos "+fmt(margin,2)+" = "+fmt(mean-margin,2)+".",
         "Limite maior: "+fmt(mean,2)+" mais "+fmt(margin,2)+" = "+fmt(mean+margin,2)+".");
       return {steps:arr,reason:"A faixa descreve valores plausíveis para a média de toda a população.",answer:fmt(mean-margin,2)+" até "+fmt(mean+margin,2)+" "+unit};
     }
     if(wants("média amostral","média","desvio","dispersão","amostra")){
       add("Procure no texto o nome do número pedido e sua unidade.",
         "Nesta questão, a média observada é "+fmt(mean,2)+" "+unit+", o desvio padrão é "+fmt(sd,2)+" "+unit+" e o total observado é "+fmt(n,0)+".");
       return {steps:arr,reason:"A média é o centro da estimativa; o desvio mede variação entre medições; a quantidade observada indica o tamanho da pesquisa."};
     }
   }
   if(kind==="sampleProp"){
     const p=item.p,complement=1-p,e=item.err,raw=z*z*p*complement/(e*e),n=Math.ceil(raw-1e-10);
     if(wants("quantas","arredondar","observações necessárias","quantidade")){
       add("Procure a taxa anterior: "+pct(p,1)+"; o restante: "+pct(complement,1)+"; o erro máximo: "+pct(e,1)+"; e o nível de confiança: "+item.conf+"%.",
         "Na tabela, "+item.conf+"% de confiança corresponde a "+fmt(z,3)+".",
         "Multiplique "+fmt(z,3)+" por ele mesmo: "+fmt(z*z,6)+".",
         "Multiplique "+fmt(p,4)+" pelo complemento "+fmt(complement,4)+": "+fmt(p*complement,6)+".",
         "Multiplique os resultados: "+fmt(z*z,6)+" vezes "+fmt(p*complement,6)+" = "+fmt(z*z*p*complement,7)+".",
         "O erro em decimal é "+fmt(e,4)+". Multiplique esse erro por ele mesmo: "+fmt(e*e,8)+".",
         "Divida "+fmt(z*z*p*complement,7)+" por "+fmt(e*e,8)+" = "+fmt(raw,2)+". Arredonde para cima: "+fmt(n,0)+" observações.");
       return {steps:arr,reason:"O resultado é quantas pessoas ou testes precisam ser observados, não a quantidade de falhas previstas.",answer:fmt(n,0)+" observações"};
     }
     if(wants("restante")){
       add("O todo sempre corresponde a 100%.",
         "Subtraia a taxa anterior de 100%: 100% menos "+pct(p,1)+" = "+pct(complement,1)+".");
       return {steps:arr,reason:"É o complemento da taxa anterior. Exemplo: 30% de um grupo e 70% do restante; não quer dizer que só 30% foram entrevistados.",answer:pct(complement,1)};
     }
     if(wants("transformar","porcentagens")){
       add("Porcentagem significa 'por 100'.",
         "Divida "+pct(p,1)+" por 100 para obter "+fmt(p,4)+".",
         "Divida "+pct(e,1)+" por 100 para obter "+fmt(e,4)+".");
       return {steps:arr,reason:"O cálculo usa as porcentagens em forma decimal."};
     }
     if(wants("erro máximo","margem")){
       add("O erro máximo é informado pela questão: "+pct(e,1)+" pontos percentuais.",
         "Ele define quão perto queremos estar da taxa verdadeira. Não representa quantos testes vão falhar.");
       return {steps:arr,reason:"Quanto menor o erro permitido, maior tende a ser a quantidade de entrevistas ou testes necessários."};
     }
     if(wants("histórico","taxa","30%","15%")){
       add("A taxa anterior é "+pct(p,1)+" — uma estimativa feita em levantamentos anteriores.",
         "De cada 100 casos semelhantes, cerca de "+fmt(p*100,0)+" tiveram a característica estudada e "+fmt(complement*100,0)+" não tiveram.");
       return {steps:arr,reason:"O histórico serve para planejar uma nova coleta; ele não garante o resultado da nova pesquisa."};
     }
   }
   if(kind==="sampleMean"){
     const sd=item.sd,e=item.err,raw=(z*sd/e)**2,n=Math.ceil(raw-1e-10);
     if(wants("quantas","arredondar","observações","procedimento")){
       add("Procure o desvio padrão: "+fmt(sd,2)+", o erro máximo: "+fmt(e,2)+" e a confiança: "+item.conf+"%.",
         "A tabela informa "+fmt(z,3)+" para "+item.conf+"% de confiança.",
         "Multiplique o número da tabela pelo desvio: "+fmt(z,3)+" × "+fmt(sd,2)+" = "+fmt(z*sd,4)+".",
         "Divida pelo erro máximo: "+fmt(z*sd,4)+" ÷ "+fmt(e,2)+" = "+fmt(z*sd/e,5)+".",
         "Multiplique esse resultado por ele mesmo: "+fmt(raw,2)+".",
         "Arredonde para cima: "+fmt(n,0)+" medições.");
       return {steps:arr,reason:"Queremos medir uma quantidade inteira de observações para atingir a precisão planejada.",answer:fmt(n,0)+" medições"};
     }
     if(wants("desvio","erro máximo","confiança")){
       add("Desvio padrão encontrado no estudo anterior: "+fmt(sd,2)+".",
         "Erro máximo que a equipe aceita: "+fmt(e,2)+".",
         "Nível de confiança exigido: "+item.conf+"% (consulte a tabela).");
       return {steps:arr,reason:"Esses valores determinam quantas medições precisam ser feitas."};
     }
   }
   if(kind==="z"){
     const diff=item.value-item.mean,score=diff/item.sd,u=item.unit||"";
     if(wants("diferença")){
       add("Valor atual: "+fmt(item.value,2)+" "+u+". Média histórica: "+fmt(item.mean,2)+" "+u+".",
         "Subtraia "+fmt(item.mean,2)+" de "+fmt(item.value,2)+": "+fmt(diff,2)+" "+u+".");
       return {steps:arr,reason:"O sinal da diferença indica se a medição ficou acima ou abaixo da média.",answer:fmt(diff,2)+" "+u};
     }
     if(wants("desvios","escore","posição relativa")){
       add("Subtraia o valor da média ao valor observado: "+fmt(item.value,2)+" menos "+fmt(item.mean,2)+" = "+fmt(diff,2)+".",
         "Divida a diferença pelo desvio padrão: "+fmt(diff,2)+" ÷ "+fmt(item.sd,2)+" = "+fmt(score,2)+".");
       return {steps:arr,reason:"O resultado indica quantas unidades de desvio padrão separam o valor da média.",answer:fmt(score,2)};
     }
     if(wants("média","observado","desvio")){
       add("Procure as três informações no texto: medição atual ("+fmt(item.value,2)+" "+u+"), média habitual ("+fmt(item.mean,2)+" "+u+") e desvio padrão ("+fmt(item.sd,2)+" "+u+").");
       return {steps:arr,reason:"Não confunda o dado de hoje com o histórico usado como referência."};
     }
   }
   if(kind==="dataset"){
     const d=window.DUO_GUIDED?.stats?.(),mode=item.mode;
     if(d){
       if(mode==="frequency"){
         if(item.id==="excel-corr-2a")add("Há "+d.n+" registros. Conte as ocorrências de cada sexo: "+d.M+" para M e "+d.F+" para F.",
             "Divida "+d.M+" por "+d.n+" e multiplique por 100: "+pct(d.M/d.n,1)+". Para F, "+d.F+" dividido por "+d.n+" resulta em "+pct(d.F/d.n,1)+".");
         else if(item.id==="excel-corr-2b")add("O valor 30 horas aparece "+d.count30+" vezes entre "+d.n+" registros.",
           "Divida "+d.count30+" por "+d.n+" e multiplique por 100: "+pct(d.count30/d.n,1)+".");
         else add("Coloque os valores das horas em ordem crescente e some as contagens até 30 horas.",
          "Existem "+d.cum30+" registros de até 30 horas dentre "+d.n+": "+pct(d.cum30/d.n,1)+".");
       }else if(mode==="statMean")add("Some as "+d.n+" medições de horas registradas na tabela: o total é "+fmt(d.h*d.n,0)+" horas.",
         "Divida o total por "+d.n+": "+fmt(d.h*d.n,0)+" ÷ "+d.n+" = "+fmt(d.h,2)+" horas.");
       else if(mode==="statMode")add("Conte quantas vezes cada número de horas aparece na tabela.",
         "O valor que mais se repete é "+d.mode+" horas, chamado de moda.");
       else if(mode==="statMedian")add("Ordene os "+d.n+" valores de horas.",
         "Como a quantidade é par, observe as posições 15 e 16 e calcule a média desses dois valores: "+fmt(d.median,2)+" horas.");
       else if(mode==="statVariance"||mode==="statStd")add("Calcule a média dos "+d.n+" tempos: "+fmt(d.h,2)+" horas.",
         "Para cada tempo, subtraia a média e multiplique a diferença por ela mesma. Some todas as diferenças ao quadrado e divida por "+(d.n-1)+" (variância amostral).",
         "A variância é "+fmt(d.varH,2)+" horas ao quadrado. A raiz quadrada desse resultado dá o desvio padrão de "+fmt(d.sd,2)+" horas.");
       else if(mode==="quartile"||mode==="outlier"||mode==="outlierZ")add("Ordene os "+d.n+" tempos para calcular os quartis.",
         "O primeiro quartil é "+fmt(d.q1,2)+" e o terceiro é "+fmt(d.q3,2)+". A diferença entre eles é "+fmt(d.iqr,2)+".",
         "Para buscar possíveis valores atípicos, use uma cerca a "+fmt(d.iqr*1.5,2)+" de cada quartil. Para comparar 60 horas com a média, calcule (60 menos "+fmt(d.h,2)+") dividido por "+fmt(d.sd,2)+".");
       else if(["pearson","regression","prediction","reverseRegression","extrapolation","scatter"].includes(mode)){
         add("Encontre em cada linha um par com idade e horas semanais de acesso, mantendo os dois valores da mesma pessoa.",
           "Observe a direção da nuvem de pontos. A associação linear é aproximadamente "+fmt(d.r,3)+".");
         if(["regression","prediction","extrapolation"].includes(mode))add("A reta estimada para as horas usa aproximadamente "+fmt(d.regA,4)+" horas a mais por ano, partindo de "+fmt(d.regB,4)+" horas.",
           "Para 50 anos, multiplique "+fmt(d.regA,4)+" por 50 e some "+fmt(d.regB,4)+": cerca de "+fmt(d.estimate50,2)+" horas. Mas os dados observados só vão até 40 anos, portanto é uma extrapolação.");
         if(mode==="reverseRegression")add("Como a pergunta quer IDADE, agora essa é a informação que devemos prever. Ajuste uma reta diferente, usando horas como entrada.",
           "A reta inversa prevê aproximadamente "+fmt(d.ageFor50,2)+" anos para 50 horas semanais.");
       }
     }
   }
   if(!arr.length){
     add("Leia novamente o objetivo do exercício, não apenas os números isolados.",
       "Identifique o que a pergunta quer descobrir. Depois localize no enunciado os dados ligados a essa pergunta.",
       "Compare cada alternativa com o significado dos dados: "+(step.guide||step.why||"use a explicação do conceito para orientar sua escolha."));
   }
   return {steps:arr,reason:step.why||"A resposta segue a leitura dos dados da questão."};
 }
 function help(model,step,index){
   const explain=stepsFor(model,step,index);
   const right=step.options?.[step.right]||"";
   return '<details class="guide-solve"><summary><span>Como descobrir a resposta?</span><small>Ver a conta explicada passo a passo</small></summary>'+
     '<div class="guide-solve-body"><ol>'+explain.steps.map(x=>'<li>'+html(x)+'</li>').join("")+'</ol>'+
     (explain.reason?'<p class="guide-solve-meaning"><strong>Por que funciona:</strong> '+html(explain.reason)+'</p>':"")+
     '<p class="guide-solve-answer"><strong>Resposta desta etapa:</strong> '+html(right)+'</p></div></details>';
 }
 function table(model){
   const item=model.item||{},kind=item.type,conf=item.conf;
   if(["sampleProp","sampleMean","prop","mean"].includes(kind)){
     const rows=[{level:90,critical:1.645},{level:95,critical:1.96},{level:99,critical:2.575}];
     return '<details class="guide-values"><summary><span>Consultar tabela de valores</span><small>90%, 95% e 99% de confiança</small></summary>'+
      '<div class="guide-values-body"><p>O nível de confiança vem do enunciado. O número ao lado é o valor de referência usado na conta: <strong>você pode consultar, não precisa inventá-lo.</strong></p>'+
      '<table><thead><tr><th>Confiança pedida</th><th>Número da tabela</th></tr></thead><tbody>'+
      rows.map(x=>'<tr '+(x.level===conf?'class="guide-value-active" aria-current="true"':'')+'><td>'+x.level+'%</td><td>'+fmt(x.critical,3)+'</td></tr>').join("")+'</tbody></table>'+
      '<p class="guide-table-note">'+(conf?"Nesta questão, foram pedidos "+fmt(conf,0)+"% de confiança. Portanto, consulte a linha destacada: <strong>"+fmt(ref(conf),3)+"</strong>.":"Veja o nível de confiança solicitado no enunciado.")+
      ' Não confunda o número da tabela com a taxa observada nem com a margem de erro.</p></div></details>';
   }
   if(kind==="dataset" && ["quartile","outlier","outlierZ"].includes(item.mode))
     return '<details class="guide-values"><summary><span>Consultar tabela de valores</span><small>Quartis e BoxPlot</small></summary>'+
       '<div class="guide-values-body"><p>Valores de referência para os exercícios da aula, usando o método de quartis adotado no projeto:</p>'+
       '<table><thead><tr><th>Nome</th><th>O que representa</th></tr></thead><tbody><tr><td>Primeiro quartil</td><td>25% dos dados</td></tr><tr><td>Mediana</td><td>50% dos dados</td></tr><tr><td>Terceiro quartil</td><td>75% dos dados</td></tr><tr><td>Cerca do BoxPlot</td><td>1,5 vezes a distância entre os quartis</td></tr></tbody></table></div></details>';
   if(kind==="z"||item.mode==="outlierZ")
     return '<details class="guide-values"><summary><span>Consultar tabela de valores</span><small>Distância em desvios-padrão</small></summary>'+
       '<div class="guide-values-body"><table><thead><tr><th>Distância</th><th>Significado</th></tr></thead><tbody>'+
       '<tr><td>0</td><td>Na média</td></tr><tr><td>+1</td><td>Um desvio acima da média</td></tr><tr><td>−1</td><td>Um desvio abaixo da média</td></tr><tr><td>+2 / −2</td><td>Dois desvios da média</td></tr></tbody></table>'+
       '<p>Estes são exemplos de interpretação, não uma tabela obrigatória de resultados.</p></div></details>';
   return "";
 }
 window.DUO_HELP={stepsFor,help,table};
})();