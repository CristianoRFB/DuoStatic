/* DuoStatic — estudo guiado em microdecisões.
   Uma pergunta de cada vez. Nenhuma resolução completa é revelada antes da escolha. */
(function(){
 "use strict";
 const fmt=(n,d=2)=>Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const pct=(v,d=1)=>fmt(v*100,d)+"%";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const zValue=c=>({90:1.645,95:1.96,99:2.575})[c]||1.96;
 const randomItem=a=>a[Math.floor(Math.random()*a.length)];
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 function step(question,correct,wrong,why,reveal=[]){
   const candidates=[correct,...wrong].filter((v,i,a)=>a.indexOf(v)===i);
   if(candidates.length<4)throw new Error("Passo com menos de 4 opções: "+question);
   const opts=shuffle(candidates.slice(0,4));
   return {question,options:opts,right:opts.indexOf(correct),why,reveal};
 }
 function numStep(question,value,unit,reason,reveal,digits=2){
   const n=Number(value),s=Math.max(Math.abs(n)*.08,Math.pow(10,-digits)*7);
   const numbers=[n,n+s,n-s,n+s*2].map(x=>fmt(x,digits)+(unit?" "+unit:""));
   return step(question,numbers[0],numbers.slice(1),reason,reveal);
 }
 function intStep(question,value,reason,reveal,unit=""){
   const n=Math.round(value),alts=[n,n+1,Math.max(0,n-1),n+Math.max(3,Math.round(n*.2))];
   return step(question,fmt(alts[0],0)+unit,alts.slice(1).map(x=>fmt(x,0)+unit),reason,reveal);
 }
 function limits(center,margin,percent,scale=1){
   const lo=center-margin*scale,hi=center+margin*scale;
   return (percent?pct(lo,1):fmt(lo,2))+" até "+(percent?pct(hi,1):fmt(hi,2));
 }
 function compareMeaning(item,lo,hi){
   const target=item.target;
   if(item.threshold==="minimum"){
     const yes=lo>=target;
     return {
       correct:yes?"A porcentagem mínima exigida está abaixo de todo o intervalo. Há apoio para lançar.":"O intervalo ainda pode ficar abaixo do mínimo. Não dá para garantir a meta.",
       wrong:["A média de salários é igual à taxa de interesse.","A porcentagem observada prova que todos na população comprariam.","O intervalo fornece a idade média dos participantes."],
       why:"Compare o limite INFERIOR com a meta de "+pct(target,0)+". Aqui o limite inferior vale "+pct(lo,1)+"."
     };
   }
   if(item.threshold==="difference"){
     return {
       correct:lo<=target&&hi>=target?"Como 50% está dentro do intervalo, não há evidência clara de preferência por um dos dois.":"Como 50% ficou fora do intervalo, há indicação de uma preferência diferente de empate.",
       wrong:["O analgésico B é necessariamente preferido por toda a população.","O resultado representa uma média de tempo.","Não é preciso comparar com 50%."],
       why:"Com dois grupos, 50% representa ausência de preferência. Compare esse valor com o intervalo."
     };
   }
   if(item.threshold==="old-sample"){
     return {correct:"Não automaticamente: o estudo descreve as TVs antigas, não as vendidas atualmente.",
       wrong:["Sim, todas as TVs futuras terão a mesma duração.","Sim, o intervalo prova a qualidade de qualquer marca.","Não existe amostra porque há 75 televisores."],
       why:"Um intervalo de confiança só descreve a população representada pela amostra."};
   }
   if(item.threshold==="maximum"){
     const no=lo>target;
     return {correct:no?"Não. Até o menor limite do IC supera o máximo de "+fmt(target,0)+" minutos.":hi<=target?"Sim. Até o maior limite fica abaixo do máximo.":"O intervalo atravessa o máximo: ainda é inconclusivo.",
       wrong:["O limite de 2 horas não precisa ser convertido para minutos.","Um IC fala apenas de porcentagens.","Basta olhar o número de aparelhos, sem verificar o intervalo."],
       why:"Converta 2 horas para 120 minutos e compare os dois limites."};
   }
   if(item.threshold==="targetInRange"){
     const within=target>=lo&&target<=hi;
     return {correct:within?"O valor proposto está dentro do intervalo: é compatível com os dados.":"O valor proposto está fora do intervalo: não é sustentado por esta estimativa.",
       wrong:["Estar fora do intervalo significa que a amostra é inválida.","A confiança transforma qualquer valor em correto.","Para decidir, use só o tamanho da amostra."],
       why:"Compare "+fmt(target,2)+" com o intervalo "+limits((lo+hi)/2,(hi-lo)/2,false)+"."};
   }
   return {correct:"O intervalo apresenta uma faixa plausível para a média ou taxa da população, não para cada indivíduo.",
     wrong:["Todos os indivíduos terão o mesmo resultado.","O resultado é uma previsão exata e sem erro.","É a porcentagem de acertos da prova."],
     why:"A incerteza se refere ao parâmetro populacional estimado a partir da amostra."};
 }
 function materialize(raw,random){
   if(!random||!["mean","prop"].includes(raw.type))return {...raw,tokens:{...(raw.tokens||{})},variant:false};
   const item={...raw,tokens:{...(raw.tokens||{})},variant:true};
   const changes={};
   const opts=[.82,1.12,1.35];
   if(item.type==="mean"){
     item.n=Math.max(20,Math.round(raw.n*randomItem(opts)));
     item.mean=Number((raw.mean*randomItem([.9,1.08,1.16])).toFixed(2));
     item.sd=Number((raw.sd*randomItem([.82,1.1,1.25])).toFixed(2));
     changes.n=fmt(item.n,0);changes.mean=fmt(item.mean,raw.mean%1===0?0:2);changes.sd=fmt(item.sd,raw.sd%1===0?0:2);
   }else{
     item.n=Math.max(50,Math.round(raw.n*randomItem(opts)));
     if(raw.fail!==undefined){
       item.fail=Math.round(item.n*raw.fail/raw.n);
       item.success=item.n-item.fail;
       changes.fail=fmt(item.fail,0);
     }else if(raw.rate!==undefined){
       item.rate=Number((raw.rate*randomItem([.86,1.12,1.18])).toFixed(2));
       item.rate=Math.max(.05,Math.min(.95,item.rate));
       changes.p=pct(item.rate,0);
     }else{
       item.success=Math.round(item.n*raw.success/raw.n);
       changes.success=fmt(item.success,0);
     }
     changes.n=fmt(item.n,0);
   }
   // Só os números apontados nas células originais são trocados.
   const used=new Set();
   let text=raw.statement;
   for(const [key,oldToken] of Object.entries(raw.tokens||{})){
     if(changes[key]===undefined)continue;
     const position=text.indexOf(oldToken);
     if(position>=0&&!used.has(key)){
       text=text.slice(0,position)+changes[key]+text.slice(position+oldToken.length);
       used.add(key);
       item.tokens[key]=changes[key];
     }
   }
   item.statement=text;
   return item;
 }
 function buildMean(item){
   const z=zValue(item.conf),margin=z*item.sd/Math.sqrt(item.n),lo=item.mean-margin,hi=item.mean+margin;
   const s=[];
   s.push(step("Qual é a missão do exercício?","Calcular uma faixa para a média da população",
     ["Calcular uma taxa de defeito","Prever um Y pela idade","Descobrir quantas pessoas entrevistar"],
     "Ele já trouxe média e desvio de uma amostra. O pedido é um intervalo para a média.",[]));
   s.push(intStep("Qual número informa o tamanho da amostra (n)?",item.n,"n é a quantidade de observações coletadas.",["n"]));
   s.push(numStep("Qual valor é a média amostral?",item.mean,item.unit,"A média vai ficar no centro do intervalo.",["mean"],2));
   s.push(numStep("Qual valor mede a dispersão (desvio padrão)?",item.sd,item.unit,"O desvio diz quanto os valores variam entre si.",["sd"],2));
   s.push(step("Qual z crítico corresponde a "+item.conf+"% de confiança?",fmt(z,3),
     [fmt(zValue(90),3),fmt(zValue(95),3),fmt(zValue(99),3),"0,500"].filter(x=>x!==fmt(z,3)),
     "Na tabela da aula: 90% → 1,645; 95% → 1,960; 99% → 2,575.",["conf"]));
   s.push(step("O que fazemos com média, desvio, n e z?","Calcular E = z × desvio ÷ √n",
     ["Somar média + n","Dividir o valor total por 100","Multiplicar média por n e chamar de IC"],
     "Primeiro vem a margem de erro E; só depois calculamos os dois limites.",[]));
   s.push(numStep("Quanto vale a margem de erro E?",margin,item.unit,
     "E = "+fmt(z,3)+" × "+fmt(item.sd,2)+" ÷ √"+item.n+" ≈ "+fmt(margin,2)+" "+item.unit+".",[],2));
   s.push(step("Qual é o intervalo calculado?",limits(item.mean,margin,false),
     [limits(item.mean,margin,false,.5),limits(item.mean,margin,false,2),limits(item.mean,margin,false,1.6)],
     "Subtraia a margem da média e também some a margem.",["result"]));
   const end=compareMeaning(item,lo,hi);
   s.push(step(item.target!==undefined||item.threshold==="old-sample"?"O que esse resultado permite concluir?":"O que esse intervalo significa?",end.correct,end.wrong,end.why,["meaning"]));
   return {item,translation:"Ele quer usar uma média medida em "+item.n+" observações para encontrar uma FAIXA plausível para a média de toda a população. Não é uma previsão exata.",steps:s,result:limits(item.mean,margin,false)+" "+item.unit,meaning:end.correct,visual:"media",calc:{kind:"mean",mean:item.mean,sd:item.sd,n:item.n,conf:item.conf,z,lo,hi,margin,unit:item.unit}};
 }
 function buildProp(item){
   const z=zValue(item.conf),p=item.rate!==undefined?item.rate:item.success/item.n;
   const se=Math.sqrt(p*(1-p)/item.n),margin=z*se,lo=p-margin,hi=p+margin;
   const s=[];
   s.push(step("O que a questão quer descobrir?","A faixa possível para uma porcentagem da população",
     ["A média de idades","A previsão de horas pela idade","O número de observações para uma futura pesquisa"],
     "O enunciado fala em quantos atendem a um critério dentro de um total.",[]));
   s.push(intStep("Qual é o tamanho da amostra n?",item.n,
     "n é o TOTAL de observações, não o número de casos favoráveis.",["n"]));
   if(item.fail!==undefined){
     s.push(intStep("Quantos atendem à condição pedida?",item.success,
       "Ele quer peixes PRÓPRIOS: "+item.n+" peixes − "+item.fail+" impróprios = "+item.success+".",["fail","success"]));
   }else if(item.rate!==undefined){
     s.push(step("Qual porcentagem observada vira a proporção p?",pct(p,0),
       [pct(1-p,0),pct(p/2,0),pct(p*.1,1)],"Converta "+pct(p,0)+" em "+fmt(p,2)+" para a fórmula.",["p"]));
   }else{
     s.push(intStep("Quantos são do grupo que interessa (x)?",item.success,
       "Conte somente "+item.field+". Esse número é o numerador.",["success"]));
     s.push(step("Qual é a proporção p = x ÷ n?",pct(p,1),
       [pct(1-p,1),pct(p/2,1),pct(p*.1,1)],
       "p = "+item.success+" ÷ "+item.n+" = "+pct(p,1)+".",["p"]));
   }
   s.push(step("Qual z crítico usar para "+item.conf+"% de confiança?",fmt(z,3),
     [fmt(zValue(90),3),fmt(zValue(95),3),fmt(zValue(99),3),"0,500"].filter(x=>x!==fmt(z,3)),
     "O nível de confiança escolhe o valor crítico da distribuição normal.",["conf"]));
   if(item.extra==="standardError"){
     s.push(numStep("Qual é o erro padrão da proporção?",se*100,"p.p.",
       "Erro padrão = √[p(1−p)/n]. A margem de erro do IC ainda multiplica por z.",[],2));
   }
   s.push(step("Como calculamos a margem de erro E?","z × √[p(1−p) ÷ n]",
     ["p × n","média × desvio padrão","somente z ÷ n"],
     "Aqui trabalhamos com a proporção p (em decimal) e seu erro padrão.",[]));
   s.push(numStep("Qual é a margem E em pontos percentuais?",margin*100,"p.p.",
     "E = "+fmt(z,3)+" × √["+fmt(p,3)+"×(1−"+fmt(p,3)+")/"+item.n+"] ≈ "+pct(margin,2)+" ponto(s) percentuais.",[],2));
   s.push(step("Qual intervalo representa a resposta?",limits(p,margin,true),
     [limits(p,margin,true,.5),limits(p,margin,true,2),limits(p,margin,true,1.5)],
     "IC = p − E até p + E. Converta os dois limites em porcentagem.",["result"]));
   const end=compareMeaning(item,lo,hi);
   s.push(step(item.target!==undefined?"O que significa para a decisão?":"O que esse intervalo permite afirmar?",end.correct,end.wrong,end.why,["meaning"]));
   return {item,translation:"O exercício quer estimar a porcentagem real de "+item.field+" a partir de uma amostra. Precisamos transformar casos em porcentagem, calcular a margem e interpretar a faixa.",steps:s,result:limits(p,margin,true),meaning:end.correct,visual:"proporcao",calc:{kind:"prop",success:item.success,n:item.n,p,conf:item.conf,z,margin,lo,hi}};
 }
 const datasetSex=["M","F","M","F","F","F","M","M","M","M","F","M","M","M","F","M","M","F","F","M","M","M","F","F","M","F","F","M","F","M"];
 function stats(){
   const t=window.STUDY_DATA,ages=t.excelAges,hours=t.excelHours,n=hours.length;
   const avg=a=>a.reduce((sum,v)=>sum+v,0)/a.length;
   const h=avg(hours),a=avg(ages),varH=hours.reduce((sum,x)=>sum+(x-h)**2,0)/(n-1),sd=Math.sqrt(varH);
   const sorted=[...hours].sort((x,y)=>x-y),median=(sorted[14]+sorted[15])/2;
   const quant=p=>{const x=(n-1)*p,i=Math.floor(x),fract=x-i;return sorted[i]+(sorted[Math.min(n-1,i+1)]-sorted[i])*fract};
   const q1=quant(.25),q3=quant(.75),iqr=q3-q1;
   const c=(v)=>hours.filter(x=>x===v).length;
   const xx=ages.reduce((sum,x)=>sum+(x-a)**2,0),yy=hours.reduce((sum,x)=>sum+(x-h)**2,0),xy=ages.reduce((sum,x,i)=>sum+(x-a)*(hours[i]-h),0);
   const regA=xy/xx,regB=h-regA*a,reverseA=xy/yy,reverseB=a-reverseA*h;
   return {hours,ages,n,h,sd,varH,median,mode:30,q1,q3,iqr,highFence:q3+1.5*iqr,
     M:datasetSex.filter(x=>x==="M").length,F:datasetSex.filter(x=>x==="F").length,
     count30:c(30),cum30:hours.filter(x=>x<=30).length,
     r:xy/Math.sqrt(xx*yy),regA,regB,reverseA,reverseB,estimate50:regA*50+regB,estimate70:regA*70+regB,ageFor50:reverseA*50+reverseB,pairs:ages.map((x,i)=>[x,hours[i]])};
 }
 function dataResult(mode,d,itemId){
   const results={
     frequency:itemId==="excel-corr-2a"?"M = 17 (56,7%); F = 13 (43,3%)":itemId==="excel-corr-2b"?"30 h: 7 de 30 = 23,3%":"Até 30 h: 16 de 30 = 53,3%",statMean:fmt(d.h,2)+" horas",
     statMode:"30 horas",statMedian:fmt(d.median,0)+" horas",
     statVariance:fmt(d.varH,2)+" horas²",statStd:fmt(d.sd,2)+" horas",
     quartile:"Q1 = "+fmt(d.q1,2)+"; Q3 = "+fmt(d.q3,2),
     outlier:"60 horas é possível outlier",outlierZ:"z(60) = "+fmt((60-d.h)/d.sd,2),
     scatter:"Idade (X) versus horas (Y)",
     pearson:"r = "+fmt(d.r,3),
     regression:"y = "+fmt(d.regA,4)+"x + "+fmt(d.regB,4),
     prediction:fmt(d.estimate50,2)+" horas (com ressalva)",
     extrapolation:"Não é confiável extrapolar até 70 anos",
     reverseRegression:fmt(d.ageFor50,2)+" anos (regressão inversa)",
     classification:"Categorias ou números conforme a natureza da variável",
     chart:"Gráfico de barras ou histograma"
   };
   return results[mode]||"Interpretar os dados da tabela";
 }
 function buildDataset(item){
   const d=stats(),s=[],mode=item.mode;
   const concept=(["statMean","statMode","statMedian","statVariance","statStd","quartile","outlier","outlierZ"].includes(mode))?
     "Medir o centro ou a dispersão das horas de acesso":
     (["regression","prediction","reverseRegression","extrapolation"].includes(mode)?"Estudar a previsão entre duas variáveis":"Interpretar ou organizar os dados da tabela");
   s.push(step("Qual é a missão desta parte do Excel?",concept,
     ["Descobrir um IC de satisfação","Estimar o preço de lâmpadas","Calcular o tamanho de uma pesquisa futura"],
     "Leia o verbo: classificar, construir, calcular, analisar ou estimar.",[]));
   s.push(step(item.question,item.opts[item.answer],item.opts.filter((_,i)=>i!==item.answer),item.explanation,["source"]));
   const result=dataResult(mode,d,item.id);
   if(["frequency","statMean","statMode","statMedian","statVariance","statStd","quartile","outlier","outlierZ","pearson","regression","prediction","extrapolation","reverseRegression"].includes(mode)){
     const alternatives={
       frequency:["17 + 13 = 17","A frequência de 30 h é 30%","Há 30 pessoas com 30 horas de acesso"],
       statMean:[fmt(d.h+5,2)+" horas",fmt(d.sd,2)+" horas","30 horas"],
       statMode:[fmt(d.h,2)+" horas","40 horas","20 horas"],
       statMedian:["35 horas","40 horas",fmt(d.h,2)+" horas"],
       statVariance:[fmt(d.sd,2)+" horas",fmt(d.varH/2,2)+" horas²","33 horas"],
       statStd:[fmt(d.varH,2)+" horas²","30 horas","2 horas"],
       quartile:["Q1 = 20; Q3 = 60","Q1 = 30; Q3 = 33","Q1 = 40; Q3 = 27"],
       outlier:["Todos os valores são outliers","30 horas é o único outlier","Nenhum valor pode ser avaliado"],
       outlierZ:["z(60) = 0","z(60) = −3","z(60) = 60"],
       pearson:["r = −0,883","r = 0","r = 1,800"],
       regression:["y = −0,9185x + 11,60","y = 33,03x + 0,88","y = 1,000x + 1,000"],
       prediction:["20 horas","80 horas","50 horas sem ressalvas"],
       extrapolation:["Sim, porque a linha vale para qualquer idade","Sim, 70 está dentro de 12 a 40","Não, porque a correlação é zero"],
       reverseRegression:["50 anos automaticamente","57,53 anos, sem mudar a equação","20 anos sem calcular"]
     };
     s.push(step("Qual resultado se obtém usando os 30 registros?",result,alternatives[mode],
       item.explanation+" O cálculo usa os 30 valores da coluna, não um dado inventado.",["result"]));
   }else{
     s.push(step("Por que essa escolha faz sentido?",item.explanation,
       ["Qualquer gráfico prova causalidade.","O enunciado não contém dados suficientes para interpretar nada.","Uma porcentagem é a mesma coisa que uma regressão."],
       item.explanation,["result"]));
   }
   s.push(step("O que você deve lembrar para a prova?",
     "Ler o pedido e escolher o procedimento antes de fazer a conta.",
     ["Escolher sempre a primeira fórmula da lista.","Ignorar a unidade da variável.","Aceitar previsões fora da amostra sem ressalvas."],
     "O verbo do enunciado determina a ferramenta. Depois vêm os dados.",["meaning"]));
   let visual="none",calc={};
   if(["pearson","scatter","regression","prediction","extrapolation","reverseRegression"].includes(mode)){
     visual=["pearson","scatter"].includes(mode)?"correlacao":"regressao";
     calc=mode==="reverseRegression"?{pairs:d.pairs.map(pair=>[pair[1],pair[0]]),r:d.r,a:d.reverseA,b:d.reverseB,target:50,pred:d.ageFor50}:{pairs:d.pairs,r:d.r,a:d.regA,b:d.regB,target:mode==="extrapolation"?70:50,pred:mode==="extrapolation"?d.estimate70:d.estimate50};
   }
   if(mode==="outlier"||mode==="outlierZ"){visual="escore";calc={z:(60-d.h)/d.sd}}
   const descriptions={
     frequency:"O pedido é contar quantas vezes um valor aparece. A frequência percentual divide pela quantidade total; a acumulada soma as frequências em ordem crescente.",
     classification:"O exercício quer saber se a variável é um número mensurável ou uma categoria e, quando for categoria, se existe uma ordem.",
     chart:"O exercício quer que você escolha um gráfico que represente corretamente o tipo de dado.",
     statMean:"O exercício quer somar as 30 horas registradas e dividir por 30, obtendo um valor médio.",
     statMode:"O exercício quer encontrar o tempo que aparece mais vezes.",
     statMedian:"O exercício quer ordenar as 30 horas e olhar os dois valores centrais.",
     statVariance:"O exercício quer medir a dispersão das horas em torno da média, usando o cálculo amostral.",
     statStd:"O exercício quer medir quanto as horas variam em torno da média, na própria unidade de horas.",
     quartile:"O exercício quer dividir os 30 tempos ordenados em quatro partes para construir o BoxPlot.",
     outlier:"O exercício quer conferir se algum tempo está distante demais dos demais usando as cercas do BoxPlot.",
     outlierZ:"O exercício quer saber quantos desvios-padrão o valor extremo está afastado da média.",
     scatter:"O exercício quer colocar cada idade ao lado de seu tempo semanal, criando um ponto no gráfico.",
     pearson:"O exercício quer saber se idade e tempo semanal variam juntos e o quão forte é essa relação linear.",
     regression:"O exercício quer encontrar uma reta capaz de estimar as horas a partir da idade.",
     prediction:"O exercício quer substituir a idade de 50 anos na reta e avaliar se a estimativa é confiável.",
     extrapolation:"O exercício quer que você diga se prever para 70 anos faz sentido, considerando a faixa estudada.",
     reverseRegression:"O exercício quer a idade aproximada para quem acessa por 50 horas. Agora a variável que queremos prever é a idade."
   };
   const translation=descriptions[mode]||"Leia o enunciado e identifique a pergunta antes de escolher a conta.";
   return {item,translation,steps:s,result,meaning:item.explanation,visual,calc};
 }
 function buildSample(item){
   const z=zValue(item.conf||95),s=[];
   const isP=item.type==="sampleProp";
   s.push(step("O que o enunciado pede primeiro?","Planejar quantos dados coletar",
     ["Calcular um intervalo com dados já coletados","Prever a idade de alguém","Medir correlação entre duas variáveis"],
     "A pergunta é QUANTOS dados serão necessários; ainda não foi feita a coleta.",[]));
   if(isP){
     s.push(step("O que precisa estimar?","Uma porcentagem ou taxa",
       ["A média de salários","A reta y=ax+b","A dispersão das alturas"],"A futura pesquisa quer uma proporção.",[]));
     s.push(step("Qual proporção esperada p usar?",pct(item.p,1),
       [pct(1-item.p,1),pct(item.p/2,1),"100%"],
       "Quando o p é conhecido, use o histórico. Se não houver estimativa, p = 50% é conservador.",["p"]));
   }else{
     s.push(step("O que precisa estimar?","Uma média",
       ["Uma taxa de aprovação","Uma porcentagem de falhas","Uma correlação"],"O alvo é uma média populacional.",[]));
     s.push(numStep("Qual desvio padrão σ informa a variabilidade?",item.sd,"","É a medida de dispersão disponível.",["sd"],0));
   }
   s.push(numStep("Qual é o erro máximo aceitável E?",isP?item.err*100:item.err,isP?"p.p.":"",
     "O E é a precisão pedida. Para porcentagens, use o equivalente em decimal na fórmula.",["err"],isP?1:0));
   s.push(step("Qual z usar para o nível de confiança?",fmt(z,3),
     [fmt(zValue(90),3),fmt(zValue(95),3),fmt(zValue(99),3),"0,500"].filter(x=>x!==fmt(z,3)),
     "A confiança determina o z crítico.",["conf"]));
   const raw=isP?z*z*item.p*(1-item.p)/(item.err*item.err):(z*item.sd/item.err)**2;
   const n=Math.ceil(raw-1e-10);
   const formula=isP?"n = z² × p(1−p) ÷ E²":"n = (z × σ ÷ E)²";
   s.push(step("Qual fórmula junta esses dados?",formula,
     ["IC = média ± E","z = (x−média)/desvio","r = covariância/(desvios)"],
     "Como a pergunta é quantos coletar, a incógnita é n.",[]));
   s.push(intStep("Quantas observações são necessárias no mínimo?",n,
     "O cálculo fornece "+fmt(raw,2)+"; para não perder precisão, arredonde para cima.",["result"]," observações"));
   s.push(step("Por que arredondar para cima?",
     "Porque o mínimo precisa ser inteiro e não pode ficar abaixo do necessário.",
     ["Porque todos os intervalos são negativos.","Porque a média é uma porcentagem.","Porque o arredondamento não altera o erro."],
     "Ex.: n = 544,22 requer no mínimo 545 pessoas.",["meaning"]));
   return {item,translation:"Ele quer descobrir quantas pessoas, observações ou medições devem ser coletadas para atingir a confiança e o erro máximo exigidos.",steps:s,result:fmt(n,0)+" observações",meaning:"Este número é o mínimo a coletar para a precisão planejada, dadas as hipóteses.",visual:"amostra",calc:{kind:isP?"sampleProp":"sampleMean",n,raw,p:item.p,sd:item.sd,err:item.err,conf:item.conf,z}};
 }
 function buildZ(item){
   const z=(item.value-item.mean)/item.sd;
   const s=[
     step("O que queremos medir?","A distância do valor individual até a média em desvios padrão",
       ["Um intervalo de porcentagens","A previsão pela reta","Uma tabela de frequências"],"O escore Z padroniza a posição de um caso.",[]),
     numStep("Qual é o valor observado?",item.value,item.unit,"É o dado individual a ser avaliado.",["value"]),
     numStep("Qual média serve de referência?",item.mean,item.unit,"Você compara o valor com esta média.",["mean"]),
     numStep("Qual é o desvio padrão?",item.sd,item.unit,"Divida a diferença entre o valor e a média por ele.",["sd"]),
     numStep("Qual é o escore Z?",z,"","z = (valor−média) ÷ desvio = "+fmt(z,2)+".",["result"]),
     step("Como interpretar o sinal?",z>0?"O valor está acima da média":z<0?"O valor está abaixo da média":"O valor coincide com a média",
       ["Um z negativo sempre é ruim","O escore Z é a média em %","Não é possível saber a direção"],
       "O sinal mostra acima/abaixo; a intensidade |z| mede quão distante está.",["meaning"])
   ];
   return {item,translation:"Ele quer saber quantos desvios padrão um valor está acima ou abaixo da média.",steps:s,result:"z = "+fmt(z,2),meaning:"O sinal indica o lado da média; a distância indica o quanto o valor é incomum.",visual:"escore",calc:{z}};
 }
 function build(raw,random=false){
   const item=materialize(raw,random);
   if(item.type==="mean")return buildMean(item);
   if(item.type==="prop")return buildProp(item);
   if(item.type==="dataset")return buildDataset(item);
   if(item.type==="sampleMean"||item.type==="sampleProp")return buildSample(item);
   if(item.type==="z")return buildZ(item);
   throw new Error("Exercício sem roteiro: "+item.type);
 }
 function enunciado(item,revealed){
   let text=item.statement,parts="",keys=Object.entries(item.tokens||{}).sort((a,b)=>b[1].length-a[1].length);
   while(text.length){
     let match=null,start=text.length;
     for(const [id,token] of keys){
       let pos=text.indexOf(token);
       while(pos>=0){
         const before=pos>0?text[pos-1]:"",after=text[pos+token.length]||"";
         if(!(/[0-9]/.test(before)&&/^[0-9]/.test(token)) && !(/[0-9]/.test(after)&&/[0-9]$/.test(token)))break;
         pos=text.indexOf(token,pos+1);
       }
       if(pos>=0&&(pos<start||(pos===start&&token.length>(match?.token?.length||0)))){start=pos;match={id,token}}
     }
     if(!match){parts+=esc(text);break;}
     parts+=esc(text.slice(0,start));
     parts+=revealed.includes(match.id)?'<mark class="guide-reveal" aria-label="Dado identificado">'+esc(match.token)+'</mark>':esc(match.token);
     text=text.slice(start+match.token.length);
   }
   return parts;
 }
 function render(session){
   const model=session.model,cur=model.steps[session.index];
   if(!cur)return "";
   const total=model.steps.length,progress=(session.index+(session.answered?1:0))/total*100;
   const success=session.answered===true,incorrect=session.wrong;
   const visual=(session.index>=Math.max(2,total-3) && model.visual!=="none" && window.DUO_FLOW)?
     '<details class="guide-visual"><summary>Ver desenho deste cálculo</summary><div>'+window.DUO_FLOW.sceneSvg(model.visual,model.calc,total-1,total)+'</div></details>':"";
   return '<div class="view guide-view"><button class="back" data-action="guided-exit">‹ Voltar aos exercícios</button>'+
    '<div class="guide-top"><span class="pill">'+esc(model.item.source)+' '+(model.item.variant?"· Valores alterados":"· Dados originais")+'</span><span class="guide-count">'+(session.index+1)+'/'+total+'</span></div>'+
    '<div class="guide-progress" role="progressbar" aria-valuenow="'+(session.index+(success?1:0))+'" aria-valuemin="0" aria-valuemax="'+total+'"><span style="width:'+progress.toFixed(1)+'%"></span></div>'+
    '<div class="guide-card"><h1>'+esc(model.item.title)+'</h1><p class="guide-label">ENUNCIADO</p><div class="guide-statement">'+enunciado(model.item,session.revealed)+'</div>'+
    '<div class="guide-translation"><strong>Tradução do enunciado</strong><p>'+esc(model.translation)+'</p></div>'+
    '<div class="guide-current"><span class="guide-label">PASSO '+(session.index+1)+'</span><h2>'+esc(cur.question)+'</h2>'+
    '<div class="guide-choices" role="group" aria-label="Alternativas do passo">'+cur.options.map((o,i)=>'<button class="guide-choice '+(success?(i===cur.right?"guide-correct":"guide-dim"):incorrect===i?"guide-wrong":"")+'" data-action="guided-answer" data-choice="'+i+'" '+(success?"disabled":"")+'><b>'+String(i+1)+'</b><span>'+esc(o)+'</span></button>').join("")+'</div>'+
    (success?'<div class="guide-feedback good" role="status"><strong>Correto.</strong> '+esc(cur.why)+'</div>':incorrect!==null?'<div class="guide-feedback wrong" role="status">Não é essa. '+esc(session.wrongHint||"Releia o pedido e tente outra alternativa.")+'</div>':"")+
    '<div class="guide-bottom">'+(success?'<button class="btn btn-primary" data-action="guided-next">'+(session.index===total-1?"Ver conclusão":"Continuar ›")+'</button>':'<span class="muted tiny">Responda para liberar o próximo passo.</span>')+'</div></div>'+
    visual+'</div></div>';
 }
 function finished(session){
   const model=session.model;
   return '<div class="view guide-finished"><p class="eyebrow">✦ EXERCÍCIO CONCLUÍDO</p>'+
     '<img src="assets/arle-vitoria.webp" class="guide-win" alt="Arlecchino comemorando" loading="lazy">'+
     '<h1>Agora você sabe o caminho.</h1><p class="muted">'+esc(model.item.title)+'</p>'+
     '<div class="guide-end-result"><span>Resposta final</span><strong>'+esc(model.result)+'</strong><p>'+esc(model.meaning)+'</p></div>'+
     '<p class="muted tiny">Fonte: '+esc(model.item.source)+'</p>'+
     '<div class="guide-footer-actions"><button class="btn btn-quiet" data-action="guided-replay">Repetir</button><button class="btn btn-primary" data-action="guided-done">'+(session.infinite?"Próximo exercício ∞":"Ver exercícios")+'</button></div></div>';
 }
 window.DUO_GUIDED={build,render,finished,stats};
})();
