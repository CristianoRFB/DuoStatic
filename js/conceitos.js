/* DUOSTATIC — alfabetização estatística.
   A matemática continua no cálculo interno. Na tela o aluno lê ações
   e significados em português, sem ter de decifrar letras de fórmulas.
   Cada explicação usa os valores do exercício que está na tela. */
(function () {
 "use strict";
 const number=(v,d=2)=>Number(v).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const percent=(v,d=0)=>number(v*100,d)+"%";
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const add=(list,title,meaning,here)=>list.push({title,meaning,here});
 function terms(model){
  const item=model.item||{},calc=model.calc||{},t=item.type,arr=[],conf=item.conf,rate=t==="sampleProp"?item.p:(t==="prop"?(item.rate??(item.success/item.n)):null);
  add(arr,"O que é uma pesquisa ou estudo?",
    "É observar pessoas, objetos ou acontecimentos de maneira organizada para responder a uma pergunta. Não exige que você já saiba estatística.",
    item.context||"Aqui alguém coleta dados para tomar uma decisão, não para adivinhar um resultado.");
  if(["sampleProp","prop"].includes(t)){
    const p=Number(rate);
    const remainder=1-p;
    const who=t==="sampleProp"?(item.title==="Pesquisa de opinião"?"pessoas com a opinião pesquisada":"testes com falha"):
      (item.field||"casos que atendem ao critério");
    add(arr,"O que é porcentagem ou proporção?",
      "É uma parte de um total de 100. Por exemplo: 30% quer dizer 30 de cada 100; os 70 restantes NÃO fazem parte desses 30.",
      Number.isFinite(p)?"Aqui, "+percent(p,Math.abs(p*100-Math.round(p*100))<.01?0:1)+" é a parte de "+who+"; "+percent(remainder,Math.abs(remainder*100-Math.round(remainder*100))<.01?0:1)+" é a parte restante. Não significa que só "+percent(p)+" das pessoas foram entrevistadas.":"Identifique primeiro o grupo que a pergunta quer contar.");
    if(t==="sampleProp")add(arr,"O que é proporção anterior?",
      "É a porcentagem que se observou em pesquisas ou testes antigos. Serve como referência para planejar quantos dados vamos coletar depois.",
      "O histórico aponta "+percent(p)+". O restante, "+percent(remainder)+", é o complemento: 100% menos "+percent(p)+" = "+percent(remainder)+". Na conta do número mínimo de observações usamos as duas partes.");
    else add(arr,"O que é tamanho da amostra?",
      "É quantas pessoas, itens ou medições foram realmente observados. Não confunda o total com a quantidade que respondeu 'sim'.",
      "Neste exercício, foram observados "+number(item.n,0)+" ao todo."+(item.success!==undefined?" Desses, "+number(item.success,0)+" são os casos que nos interessam.":""));
  }
  if(["sampleMean","mean"].includes(t)){
    if(t==="mean")add(arr,"O que é média da amostra?",
      "É somar todos os resultados observados e dividir pela quantidade de observações. A média da amostra pode ser diferente da média de toda a população.",
      "A média das "+number(item.n,0)+" observações é "+number(item.mean,2)+" "+(item.unit||"")+". Ela é o centro da faixa que iremos calcular.");
    add(arr,"O que é desvio padrão?",
      "Mede o quanto os resultados costumam ficar espalhados em relação à média. Desvio maior significa valores mais variados; não é uma margem de erro.",
      "Aqui o desvio informado é "+number(item.sd,Number.isInteger(item.sd)?0:2)+" "+(item.unit||"")+". Ele entra na conta porque valores muito diferentes exigem mais cuidado ao estimar.");
    add(arr,"O que significa tamanho da amostra?",
      "É a quantidade de medições ou pessoas usadas como base. Quando queremos planejar uma pesquisa, é justamente esse número que ainda precisamos descobrir.",
      t==="sampleMean"?"A equipe ainda não decidiu quantas medições fará. Este é o resultado que queremos encontrar.":"A equipe já mediu "+number(item.n,0)+" observações.");
  }
  if(["sampleProp","sampleMean","mean","prop"].includes(t)){
    if(conf!==undefined)add(arr,"O que é nível de confiança?",
      "É uma característica do método de estimação: se fizéssemos muitas pesquisas semelhantes, aproximadamente essa porcentagem dos intervalos calculados conteria o valor verdadeiro. Não é a porcentagem de pessoas que aprovou e não garante a resposta de cada teste.",
      "Nesta questão o método precisa ter "+number(conf,0)+"% de confiança. Esse valor vem do enunciado e escolhe um número de referência numa tabela. Não é a taxa observada.");
    if(t==="sampleProp"||t==="sampleMean"){
      add(arr,"O que é margem de erro?",
       "É o tamanho máximo da imprecisão que aceitamos na estimativa. Quanto menor a margem tolerada, mais observações costumam ser necessárias.",
       t==="sampleProp"?
       "Aqui a equipe aceita "+percent(item.err)+" pontos percentuais. Imagine uma estimativa futura de "+percent(rate)+": uma faixa ilustrativa seria de "+percent(rate-item.err)+" a "+percent(rate+item.err)+". Isso não diz que "+percent(item.err)+" dos testes vão falhar.":
       "Aqui a equipe aceita uma diferença de no máximo "+number(item.err,Number.isInteger(item.err)?0:2)+" "+(item.unit||"")+" em sua estimativa da média.");
    }else{
      add(arr,"O que é margem de erro?",
       "É a distância calculada entre o resultado central da amostra e cada limite da faixa estimada para a população.",
       t==="prop"?"Neste caso, calculamos essa distância usando a porcentagem favorável, a restante, o total observado e a confiança.":
         "Neste caso, a margem usa o desvio padrão, a quantidade observada e a confiança.");
    }
    add(arr,"O que é intervalo de confiança?",
      "É uma faixa de valores estimada a partir de uma amostra. Não significa que cada pessoa ou objeto terá um resultado dentro dessa faixa.",
      t==="sampleProp"||t==="sampleMean"?"Aqui a pergunta é anterior ao intervalo: precisamos descobrir QUANTAS observações coletar para conseguir a precisão desejada.":
       "Aqui o objetivo é encontrar a faixa que pode conter a média ou porcentagem verdadeira da população.");
  }
  if(t==="z"){
    add(arr,"O que significa a média?","É o valor típico calculado a partir de vários resultados anteriores.",
      "Aqui a média é "+number(item.mean,Number.isInteger(item.mean)?0:2)+" "+(item.unit||"")+". É o ponto de referência para avaliar o teste atual.");
    add(arr,"O que é desvio padrão?","É uma régua para medir o quanto cada resultado se afasta do comportamento habitual.",
      "Nesta questão uma unidade dessa régua mede "+number(item.sd,Number.isInteger(item.sd)?0:2)+" "+(item.unit||"")+".");
    add(arr,"O que é escore de posição relativa?",
      "É a distância entre uma medição e a média, expressa em unidades de desvio padrão. Valor positivo está acima, negativo abaixo.",
      "Compararemos a medição "+number(item.value,Number.isInteger(item.value)?0:2)+" com a média "+number(item.mean,Number.isInteger(item.mean)?0:2)+".");
  }
  if(t==="dataset"){
    add(arr,"O que significa uma variável?","É uma característica que muda de pessoa para pessoa ou de situação para situação.",
      "Na tabela cada usuário tem, por exemplo, idade e horas semanais de acesso.");
    add(arr,"O que é frequência?","É a quantidade de vezes que determinado valor ou categoria aparece nos dados.",
      "Para descobrir a porcentagem de um valor, contamos quantas vezes aparece e dividimos pelo total de registros.");
    add(arr,"O que é correlação?","Mede se duas grandezas costumam crescer juntas, uma crescer enquanto outra cai, ou não mostram relação linear clara.",
      "Idade e tempo de acesso podem ser comparados, mas uma relação não prova que a idade seja a causa.");
    add(arr,"O que é regressão?","É uma maneira de desenhar uma reta que resume a relação entre dados e ajuda a fazer previsões aproximadas.",
      "Se a pergunta pede prever horas a partir de uma idade, usamos as duas colunas para ajustar uma reta.");
    add(arr,"O que é média, mediana e moda?","Média é a soma dividida pelo total; mediana é o centro da lista ordenada; moda é o valor que aparece mais vezes.",
      "São três maneiras diferentes de resumir os tempos dos usuários.");
  }
  return arr;
 }
 function glossary(model){
  const data=terms(model);
  if(!data.length)return "";
  return '<details class="guide-glossary"><summary><span>▤ Entender os termos deste exercício</span><small>'+data.length+' explicações que você pode abrir</small></summary>'+
   '<div class="guide-glossary-list">'+data.map((t,i)=>
      '<details class="guide-definition"><summary>'+esc(t.title)+'</summary><div><p>'+esc(t.meaning)+'</p><p class="guide-specific"><strong>Nesta questão:</strong> '+esc(t.here)+'</p></div></details>'
   ).join("")+'</div></details>';
 }
 // As alternativas que exigem escolher uma CONTA são escritas em palavras.
 // O gabarito e o resultado numérico permanecem os mesmos.
 function plainStep(model,stepObj){
   const step={...stepObj,options:[...stepObj.options]},item=model.item||{},type=item.type;
   const replaceCorrect=(newRight,others)=>{
     const index=step.right;
     step.options[index]=newRight;
     const wrong=others.filter(x=>x!==newRight);
     let j=0;
     for(let i=0;i<step.options.length;i++)if(i!==index)step.options[i]=wrong[j++];
   };
   const q=step.question;
   if(type==="sampleProp" && /Como escrever as duas porcentagens/.test(q)){
     const p=item.p,e=item.err;
     step.question="Para fazer a conta, como transformar as porcentagens em números?";
     replaceCorrect("Dividir as duas porcentagens por 100: "+percent(p)+" vira "+number(p,2)+" e "+percent(e)+" vira "+number(e,2),[
       "Usar "+number(p*100,0)+" e "+number(e*100,0)+" sem dividir por 100",
       "Trocar as duas porcentagens de lugar",
       "Transformar as duas em 100"]);
     step.why="Porcentagem significa 'a cada 100'. Por isso "+percent(p)+" dividido por 100 vira "+number(p,2)+" e "+percent(e)+" vira "+number(e,2)+".";
   }
   if((type==="sampleProp"||type==="sampleMean") && /qual conta encontra a quantidade/.test(q)){
     const p=item.p,e=item.err,s=item.sd;
     step.question="Qual é o próximo procedimento para descobrir quantas observações fazer?";
     if(type==="sampleProp"){
       const complement=1-p;
       replaceCorrect("Usar a confiança e as duas partes ("+percent(p)+" e "+percent(complement)+"); depois ajustar pelo erro máximo",[
        "Somar as porcentagens e chamar o resultado de número de testes",
        "Dividir a confiança pela taxa de falhas e parar",
        "Subtrair o erro máximo da porcentagem histórica e parar"]);
       step.why="O cálculo combina o valor de referência da confiança multiplicado por ele mesmo; a parte de "+percent(p)+" multiplicada pela parte restante de "+percent(complement)+"; e divide tudo pelo erro máximo multiplicado por ele mesmo. Essas porcentagens entram em decimal.";
     }else{
       replaceCorrect("Multiplicar o valor de referência da confiança pelo desvio, dividir pelo erro máximo e multiplicar o resultado por ele mesmo",[
        "Somar a confiança à média e encerrar",
        "Subtrair o erro máximo do desvio padrão e encerrar",
        "Dividir o erro máximo pela quantidade de servidores"]);
       step.why="Primeiro multiplique o valor de confiança pelo desvio padrão. Depois divida pelo erro máximo. Por fim, multiplique o resultado por ele mesmo.";
     }
   }
   if(type==="mean" && /O que fazemos com média, desvio/.test(q)){
     step.question="Como descobrir a margem de erro para a média?";
     replaceCorrect("Dividir o desvio pela raiz quadrada da quantidade observada; depois multiplicar pelo valor de referência da confiança",[
       "Somar a média e a quantidade observada",
       "Dividir a média pelo total de pessoas",
       "Multiplicar a média pela quantidade de observações"]);
     step.why="Comece pelo desvio padrão. Divida-o pela raiz quadrada do total de observações e multiplique pelo valor de referência escolhido para a confiança.";
   }
   if(type==="prop" && /Como calculamos a margem/.test(q)){
     step.question="O que fazemos para descobrir a margem de erro dessa porcentagem?";
     replaceCorrect("Multiplicar a parte favorável pela restante, dividir pelo total, tirar a raiz quadrada e usar o valor de confiança",[
       "Multiplicar diretamente a porcentagem pelo total",
       "Somar a média de idade ao total observado",
       "Usar só a confiança e ignorar o tamanho da amostra"]);
     step.why="Use a parte favorável e a restante, em decimais. Multiplique, divida pelo total, tire a raiz quadrada e multiplique pelo número de referência da confiança.";
   }
   if((type==="prop"||type==="mean") && /Qual .*valor crítico|Qual z crítico/.test(q)){
     step.question="Qual número da tabela corresponde a "+number(item.conf,0)+"% de confiança?";
     step.why="O nível de confiança foi informado no enunciado. A tabela da aula associa 90% a 1,645; 95% a 1,960; e 99% a 2,575. Esse número ajuda a calcular a margem.";
   }
   if(type==="sampleProp" && /histórico fala/.test(q)){
     const p=item.p,rest=1-p;
     step.why="O histórico descreve "+percent(p)+" com a característica pesquisada e "+percent(rest)+" sem ela. É uma referência de estudos anteriores, NÃO significa que só "+percent(p)+" da população foi entrevistada.";
   }
   // Outros rótulos abreviados são trocados por nomes, sem mexer no cálculo.
   const clean=(str)=>String(str)
     .replace(/\bIC\b/g,"intervalo de confiança")
     .replace(/\bp\s*=\s*x\s*÷\s*n\b/gi,"quantidade de casos dividida pelo total")
     .replace(/\bz\s*=\s*\(/gi,"diferença entre o valor e a média, dividida pelo desvio (")
     .replace(/\bE\s*=\s*/g,"margem de erro: ")
     .replace(/\bE\b/g,"margem de erro")
     .replace(/\bz crítico\b/gi,"valor de referência da confiança")
     .replace(/\bproporção p\b/gi,"proporção observada")
     .replace(/\bn\b(?=[ ?.:,])/g,"quantidade observada")
     .replace(/\bp\b(?=[ ?.:,])/g,"proporção")
     .replace(/p\s*±\s*margem/gi,"porcentagem observada menos a margem, até porcentagem observada mais a margem")
     .replace(/média\s*±\s*margem/gi,"média menos a margem, até média mais a margem");
   step.question=clean(step.question);
   step.options=step.options.map(clean);
   step.why=clean(step.why);
   step.guide=clean(step.guide||"");
   return step;
 }
 window.DUO_PLAIN={terms,glossary,plainStep};
})();