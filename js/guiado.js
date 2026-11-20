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
 function step(question,correct,wrong,why,reveal=[],guide=""){
   const candidates=[correct,...wrong].filter((v,i,a)=>a.indexOf(v)===i);
   if(candidates.length<4)throw new Error("Passo com menos de 4 opções: "+question);
   const opts=shuffle(candidates.slice(0,4));
   return {question,options:opts,right:opts.indexOf(correct),why,reveal,guide};
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
   if(!random||!["mean","prop"].includes(raw.type))return {...raw,tokens:{...(raw.tokens||{})},variant:!!raw.variant};
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
    s.push(step("A pessoa já mediu parte do grupo. O que ela quer descobrir agora?",
     "Entre quais valores pode estar a média do grupo inteiro",
     ["O valor exato de cada pessoa observada","Quantas pessoas ainda devem ser entrevistadas","Qual é o maior resultado possível para toda a população"],
     "Como só foi observada uma amostra, a média dessa amostra é uma pista. O intervalo de confiança dá uma faixa plausível para a média de toda a população.",[],
     "Não precisamos prever cada pessoa. Queremos estimar a MÉDIA de um grupo maior."));
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
   return {item,translation:(item.context?item.context+" ":"")+"Em palavras simples: ele quer uma faixa para a média verdadeira, usando as "+item.n+" medições. Não quer a resposta exata de cada pessoa.",steps:s,result:limits(item.mean,margin,false)+" "+item.unit,meaning:end.correct,visual:"media",calc:{kind:"mean",mean:item.mean,sd:item.sd,n:item.n,conf:item.conf,z,lo,hi,margin,unit:item.unit}};
 }
 function buildProp(item){
   const z=zValue(item.conf),p=item.rate!==undefined?item.rate:item.success/item.n;
   const se=Math.sqrt(p*(1-p)/item.n),margin=z*se,lo=p-margin,hi=p+margin;
   const s=[];
   s.push(step("O estudo observou uma parte do grupo. O que quer saber sobre o grupo inteiro?",
     "Entre quais porcentagens pode estar a taxa verdadeira",
     ["O resultado exato de cada pessoa","Quantas pessoas devem ser entrevistadas em outra pesquisa","Quanto vale a média de todos os salários"],
     "A porcentagem vista na amostra é uma pista. O intervalo de confiança estima uma faixa para a porcentagem da população.",[],
     "Aqui o resultado é uma PORCENTAGEM. Porcentagem é uma parte de 100."));
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
     s.push(numStep("Qual é o erro padrão da proporção?",se*100,"pontos percentuais",
       "Erro padrão = √[p(1−p)/n]. A margem de erro do IC ainda multiplica por z.",[],2));
   }
   s.push(step("Como calculamos a margem de erro E?","z × √[p(1−p) ÷ n]",
     ["p × n","média × desvio padrão","somente z ÷ n"],
     "Aqui trabalhamos com a proporção p (em decimal) e seu erro padrão.",[]));
   s.push(numStep("Qual é a margem E em pontos percentuais?",margin*100,"pontos percentuais",
     "E = "+fmt(z,3)+" × √["+fmt(p,3)+"×(1−"+fmt(p,3)+")/"+item.n+"] ≈ "+pct(margin,2)+" ponto(s) percentuais.",[],2));
   s.push(step("Qual intervalo representa a resposta?",limits(p,margin,true),
     [limits(p,margin,true,.5),limits(p,margin,true,2),limits(p,margin,true,1.5)],
     "IC = p − E até p + E. Converta os dois limites em porcentagem.",["result"]));
   const end=compareMeaning(item,lo,hi);
   s.push(step(item.target!==undefined?"O que significa para a decisão?":"O que esse intervalo permite afirmar?",end.correct,end.wrong,end.why,["meaning"]));
   return {item,translation:(item.context?item.context+" ":"")+"A tarefa é estimar a porcentagem real de "+item.field+". Primeiro identificamos quem entra na contagem; depois encontramos uma faixa plausível.",steps:s,result:limits(p,margin,true),meaning:end.correct,visual:"proporcao",calc:{kind:"prop",success:item.success,n:item.n,p,conf:item.conf,z,margin,lo,hi}};
 }
 const datasetSex=["M","F","M","F","F","F","M","M","M","M","F","M","M","M","F","M","M","F","F","M","M","M","F","F","M","F","F","M","F","M"];
 const employeeData=[[40,3,"Médio",3400,3,"Sim"],[25,2,"Superior",4300,1,"Sim"],[32,2,"Médio",3500,0,"Sim"],[30,1,"Superior",5000,0,"Sim"],[34,2,"Fundamental",1621,1,"Sim"],[20,1,"Fundamental",1621,0,"Não"],[22,3,"Médio",3578,0,"Não"],[21,3,"Fundamental",1621,0,"Não"],[31,3,"Superior",4705,1,"Sim"],[18,1,"Fundamental",1621,0,"Não"],[30,2,"Médio",3450,1,"Sim"],[41,2,"Médio",3350,1,"Sim"],[36,3,"Médio",2500,2,"Sim"],[27,2,"Fundamental",1621,1,"Sim"],[43,3,"Superior",6000,3,"Sim"],[37,2,"Médio",2800,2,"Sim"],[50,2,"Médio",2900,3,"Sim"],[27,3,"Fundamental",1621,1,"Não"],[25,2,"Fundamental",1621,2,"Não"],[24,1,"Médio",2300,1,"Sim"],[25,1,"Superior",4500,1,"Sim"],[41,1,"Médio",2570,1,"Sim"],[20,2,"Fundamental",1621,0,"Não"],[33,1,"Médio",2350,2,"Sim"],[45,4,"Superior",6300,3,"Sim"],[23,1,"Fundamental",1621,2,"Não"],[35,2,"Médio",2450,1,"Sim"],[55,4,"Superior",7250,4,"Sim"],[23,1,"Médio",2800,0,"Sim"],[27,1,"Médio",2900,2,"Não"],[30,3,"Médio",3100,1,"Sim"]];
 function sourceTable(item){
   let rows=[],heads=[],description="";
   if(item.dataset==="usuarios"){
     const t=window.STUDY_DATA;
     heads=["Sexo","Idade","Horas/semana"];
     rows=t.excelAges.map((age,i)=>[datasetSex[i],age,t.excelHours[i]]);
     description="30 registros de Correlação e Regressão Linear.xlsx";
   }else if(item.source&&item.source.includes("Tabela Slide.xlsx")){
     heads=["Idade","Serviço (anos)","Escolaridade","Salário R$","Dependentes","Automóvel"];
     rows=employeeData;
     description="31 registros de Tabela Slide.xlsx";
   }else return "";
   return '<details class="guide-source-data"><summary>Consultar a tabela original ('+rows.length+' registros)</summary><div class="guide-table-scroll"><table><thead><tr>'+heads.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div><p>'+esc(description)+'</p></details>';
 }
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
   const conclusions={
     frequency:"A frequência percentual mostra a parte do total; a acumulada soma os valores anteriores em ordem.",
     statMean:"A média representa o tempo médio nesta amostra, não o tempo de todos os usuários.",
     statMode:"A moda é o tempo mais frequente, não a média.",
     statMedian:"A mediana separa os 30 registros ordenados em duas metades.",
     statVariance:"Quanto maior a variância, maior o espalhamento quadrático dos tempos.",
     statStd:"O desvio padrão indica a dispersão típica das horas na mesma unidade.",
     quartile:"A caixa mostra a metade central dos dados entre Q1 e Q3.",
     outlier:"Um possível outlier merece investigação, mas não prova que seja erro.",
     outlierZ:"Um z de quase 3 aponta um valor muito acima da média.",
     scatter:"Cada ponto liga idade e horas do mesmo usuário; não garante causa e efeito.",
     pearson:"Idade e horas têm associação positiva forte nesta amostra, sem provar causalidade.",
     regression:"A reta serve para estimar horas a partir da idade na faixa observada.",
     prediction:"O número calculado para 50 anos é extrapolação, pois a maior idade observada é 40.",
     extrapolation:"Não é confiável concluir para 70 anos a partir da amostra de 12 a 40.",
     reverseRegression:"Para prever idade a partir de horas, ajusta-se outra regressão com a resposta invertida.",
     classification:"O tipo da variável orienta qual cálculo e qual gráfico fazem sentido.",
     chart:"O gráfico precisa corresponder ao tipo de dado que se quer mostrar."
   };
   const conclusion=conclusions[mode]||"Primeiro entenda a pergunta; só depois escolha a conta.";
   s.push(step("O que significa o resultado?",
     conclusion,
     ["A correlação sempre prova causa e efeito.","Qualquer fórmula serve, desde que tenha números.","Toda previsão pode ser estendida indefinidamente fora da amostra."],
     item.explanation,["meaning"]));
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
   const translation=(item.context?item.context+" ":"")+(descriptions[mode]||"Leia o pedido e escolha uma operação de cada vez.");
   return {item,translation,steps:s,result,meaning:item.explanation,visual,calc};
 }
 function buildSample(item){
   const z=zValue(item.conf||95),s=[],isP=item.type==="sampleProp";
   const opinion=item.title==="Pesquisa de opinião";
   const task=isP?(opinion?"entrevistas":"testes"):"medições de resposta da API";
   const questionQuantity=isP&&!opinion?"Quantos":"Quantas";
   const neededWord=isP&&!opinion?"necessários":"necessárias";
   const goal=isP?(opinion?"a porcentagem de pessoas que compartilham certa opinião":"a porcentagem de testes que apresentam falhas"):
     "o tempo médio que a API leva para responder";
   const pText=pct(item.p||0,0),eText=isP?fmt(item.err*100,0)+" pontos percentuais":fmt(item.err,0)+" "+(item.unit||"ms");
   s.push(step("O que a equipe precisa decidir ANTES de começar?",
     questionQuantity+" "+task+" deverá fazer",
     ["Qual será o resultado exato de cada observação","Que resultado os próximos testes terão, um por um","Se a pesquisa já provou a conclusão"],
     "A equipe ainda não coletou os novos dados. Por isso precisa planejar a quantidade mínima para uma estimativa confiável.",[],
     "Pense no objetivo da história: há uma pesquisa ou teste futuro para organizar."));
   s.push(step("O que será medido nessas observações?",
     goal.charAt(0).toUpperCase()+goal.slice(1),
     isP?(opinion?["O salário de todos os entrevistados","A idade de cada pessoa em uma única entrevista","O nome da pessoa que organizou a pesquisa"]:
       ["A quantidade de linhas de código do sistema","O preço de cada teste","Se um único teste isolado é perfeito"]):
       ["A quantidade de falhas, sem olhar o tempo","O preço de contratação da equipe","A média exata de um único teste"],
     "Agora identificamos o TIPO de resultado: "+(isP?"é uma contagem de casos dentro de um total. Isso vira porcentagem (também chamada proporção).":
       "cada requisição produz um número de milissegundos. Queremos calcular a MÉDIA desses tempos."),[],
     "Pergunte: cada observação terá um número de tempo ou uma resposta do tipo sim/não?"));
   if(isP){
     const meaning=opinion?"aproximadamente "+pText+" das pessoas deram a resposta estudada em pesquisas anteriores":
       "em cada 100 testes antigos, cerca de "+fmt(item.p*100,0)+" apresentaram falhas";
     s.push(step("O histórico fala em "+pText+". O que isso quer dizer?",
       meaning.charAt(0).toUpperCase()+meaning.slice(1),
       ["O próximo teste obrigatoriamente dará falha","Exatamente "+fmt(item.p*100,0)+" pessoas precisam ser entrevistadas","A pesquisa já está concluída"],
       "A taxa anterior é uma referência, não uma certeza sobre os próximos testes. É a porcentagem esperada para o grupo estudado.",["p"],
       "Porcentagem é uma parte de 100: 15% significa 15 em cada 100."));
   const remaining=1-item.p;
   const alternatives=[
     pct(Math.max(.01,remaining-.13),0),
     pct(Math.max(.01,item.p/2),0),
     pct(Math.min(.99,remaining+.11),0)
   ];
   s.push(step("Se "+pct(item.p,0)+" representam a parte estudada, qual porcentagem é o RESTANTE?",
     pct(remaining,0),alternatives,
     "O todo equivale a 100%. Subtraímos "+pct(item.p,0)+" de 100% e encontramos "+pct(remaining,0)+
     ". Esse restante entra na conta da quantidade mínima de observações. Não significa que somente "+pct(item.p,0)+" das pessoas foram analisadas.",
     [],"Imagine 100 casos: "+fmt(item.p*100,0)+" fazem parte do grupo estudado. Quantos dos 100 ficam de fora?"));
   }else{
     s.push(step("O desvio padrão anterior é "+fmt(item.sd,0)+" "+(item.unit||"ms")+". O que ele descreve?",
       "O quanto os tempos costumam variar de uma requisição para outra",
       ["O tempo exato que toda requisição demora","O número de servidores na empresa","O valor máximo que a API pode atingir"],
       "Desvio padrão NÃO é a média. Ele mede o espalhamento dos tempos: quanto maior, maior a variabilidade.",["sd"],
       "A API pode levar tempos diferentes a cada tentativa. O desvio ajuda a medir essas diferenças."));
   }
   s.push(step("O erro máximo permitido é "+eText+". Para que ele serve?",
     "Para limitar o quanto a estimativa pode se afastar do valor real",
     ["Para limitar quantos testes podem falhar","Para garantir que nunca acontecerá uma falha","Para dizer quantas pessoas já responderam"],
     "A margem de erro é uma meta de precisão. "+(isP?
       "Imagine que a taxa futura seja "+pct(item.p,0)+". Uma margem de "+fmt(item.err*100,0)+" pontos percentuais criaria uma faixa de "+pct(item.p-item.err,0)+" até "+pct(item.p+item.err,0)+". Isso é apenas um exemplo da ideia de margem.":
       "Se a média estimada fosse 500 ms, uma margem de 100 ms produziria limites de 400 ms a 600 ms."),["err"],
     isP?"Não confunda: 3% de margem NÃO significa que só 3% dos testes podem falhar.":"Margem de erro é a tolerância da estimativa, não o tempo que cada requisição deve durar."));
   s.push(step("E os "+item.conf+"% de confiança significam o quê?",
     "O nível de confiança usado para planejar a precisão da pesquisa",
     ["Que "+item.conf+"% dos testes darão certo","Que a resposta será exatamente igual ao valor real","Que "+item.conf+"% dos participantes concordam com a pesquisa"],
     "Se repetíssemos muitas pesquisas semelhantes, cerca de "+item.conf+"% dos intervalos calculados por esse método conteriam o valor verdadeiro. A confiança também indica qual número usar na tabela da aula.",["conf"],
     "Confiança é sobre o MÉTODO da pesquisa. Não é a porcentagem de testes que passarão."));
   const referenceValues=[["90%",1.645],["95%",1.96],["99%",2.575]];
   const current=referenceValues.find(v=>v[0]===item.conf+"%")||referenceValues[1];
   s.push(step("Qual número da tabela da aula corresponde à confiança de "+item.conf+"%?",
     fmt(current[1],3),
     referenceValues.filter(v=>v[0]!==current[0]).map(v=>fmt(v[1],3)).concat(["0,500"]),
     "Essa tabela já faz parte do método da aula: 90% usa 1,645; 95% usa 1,960; e 99% usa 2,575. O nível de confiança vem do enunciado, não é calculado a partir da taxa anterior.",[],
     "Aqui você não precisa decorar uma fórmula: apenas localizar "+item.conf+"% na tabela dos valores de confiança."));
   if(isP){
     s.push(step("Como escrever as duas porcentagens para calcular?",
       "Proporção p = "+fmt(item.p,2)+" e erro E = "+fmt(item.err,2),
       ["p = "+fmt(item.p*100,0)+" e E = "+fmt(item.err*100,0),"p = "+fmt(item.err,2)+" e E = "+fmt(item.p,2),"p = 1 e E = 0"],
       "Na fórmula entram decimais: por exemplo, 15% vira 0,15 e 3% vira 0,03.",[],
       "Para passar de porcentagem a decimal, divida por 100."));
   }
   const raw=isP?z*z*item.p*(1-item.p)/(item.err*item.err):(z*item.sd/item.err)**2;
   const n=Math.ceil(raw-1e-10);
   const formula=isP?"n = z² × p(1−p) ÷ E²":"n = (z × desvio ÷ E)²";
   s.push(step("Agora que identificamos os dados, qual conta encontra a quantidade n?",
     formula,
     ["Somar todos os números do enunciado","Dividir o erro máximo pela confiança","Usar a média ± margem para estimar uma faixa"],
     "n significa quantidade necessária de observações. Usamos z = "+fmt(z,3)+
     (isP?", p = "+fmt(item.p,2)+" e E = "+fmt(item.err,2):", desvio = "+fmt(item.sd,0)+" e E = "+fmt(item.err,0))+
     ". Depois, calculamos o resultado numérico.",[],
     "A pergunta é QUANTOS coletar: a incógnita da conta é n."));
   s.push(intStep("Depois de calcular e arredondar para cima, "+questionQuantity.toLowerCase()+" "+task+" serão "+neededWord+"?",
     n,"A conta resulta em "+fmt(raw,2)+". Como não existe fração de "+(opinion?"entrevista":"teste")+
     ", arredondamos para cima: "+fmt(n,0)+".",["result"]," "+task));
   s.push(step("No final, o número "+fmt(n,0)+" serve para quê?",
     "Planejar PELO MENOS "+fmt(n,0)+" "+task+" com a precisão escolhida",
     ["Garantir que exatamente "+fmt(n,0)+" observações darão o mesmo resultado",
      "Provar que a porcentagem histórica nunca mudará","Confirmar que não existirão erros nos testes"],
     "A conta determina a quantidade mínima para o plano de pesquisa, sob as hipóteses usadas; ela não prevê o resultado exato de cada teste.",["meaning"],
     "O resultado é uma QUANTIDADE de medições, não uma porcentagem."));
   return {item,translation:(item.goal||("Precisamos descobrir "+questionQuantity.toLowerCase()+" "+task+" realizar.")),
     steps:s,result:fmt(n,0)+" "+task,
     meaning:"A equipe deverá coletar pelo menos "+fmt(n,0)+" "+task+" para buscar a precisão definida, se as condições do planejamento forem atendidas.",
     visual:"amostra",calc:{kind:isP?"sampleProp":"sampleMean",n,raw,p:item.p,sd:item.sd,err:item.err,conf:item.conf,z}};
 }
 function buildZ(item){
   const z=(item.value-item.mean)/item.sd,unit=item.unit||"unidades";
   const difference=item.value-item.mean;
   const high=z>0,low=z<0;
   const significance=Math.abs(z)>2?"é mais distante do que o limite de 2 desvios usado na aula e merece atenção":
     Math.abs(z)===2?"está no limite de atenção de 2 desvios usado na aula":"não ultrapassa o limite de atenção de 2 desvios usado na aula";
   const s=[
     step("A equipe tem um valor recente. O que ela quer saber?",
       "Se essa medição ficou muito acima ou abaixo do habitual",
       ["O resultado exato da próxima medição","O preço médio de uma pesquisa","O número de pessoas a entrevistar"],
       "O problema é comparar UMA medição com o histórico, e não fazer uma nova pesquisa.",
       [],"Pense: algo mudou em relação ao comportamento normal da rede, servidor ou programa?"),
     step("Para descobrir se o resultado é normal, qual comparação ajuda?",
       "Comparar com a média das medições antigas",
       ["Comparar somente com o maior número da tabela","Comparar com o preço do equipamento","Comparar com a quantidade de funcionários"],
       "A média histórica é nosso ponto de referência para saber se o valor está acima ou abaixo do habitual.",
       [],"A média resume o valor típico das medições anteriores."),
     numStep("Qual foi o valor observado AGORA?",item.value,unit,
       "É a medição atual que queremos analisar.",["value"],Number.isInteger(item.value)?0:1),
     numStep("Qual era a média histórica?",item.mean,unit,
       "Esse é o valor usado como referência para o comportamento habitual.",["mean"],Number.isInteger(item.mean)?0:1),
     step("E o desvio padrão de "+fmt(item.sd,Number.isInteger(item.sd)?0:1)+" "+unit+" indica o quê?",
       "Quanto os resultados costumam variar em torno da média",
       ["Que cada medição será igual à média","A quantidade de falhas permitidas no sistema","A duração da próxima medição com certeza"],
       "O desvio padrão informa o tamanho de uma variação comum no grupo. Não é a média.",["sd"],
       "Se o desvio é 40 ms, dizemos que 40 ms representa uma unidade de variação usada na comparação."),
     numStep("Primeiro, qual é a diferença entre o valor atual e a média?",difference,unit,
       "Diferença = "+fmt(item.value,2)+" − "+fmt(item.mean,2)+" = "+fmt(difference,2)+" "+unit+".",
       [],Number.isInteger(difference)?0:1),
     step("Para entender essa diferença, o que fazemos agora?",
       "Dividimos a diferença pelo desvio padrão",
       ["Somamos o desvio ao valor atual","Dividimos a média por 100","Multiplicamos o valor atual pela amostra"],
       "Assim descobrimos quantos desvios-padrão cabem entre o valor atual e a média.",[],
       "É como medir uma distância usando o desvio como uma régua."),
     numStep("Quantos desvios-padrão o valor está da média?",z,"",
       "z = ("+fmt(item.value,2)+" − "+fmt(item.mean,2)+") ÷ "+fmt(item.sd,2)+" = "+fmt(z,2)+".",
       ["result"],2),
     step("O que esse número significa?",
       "O valor está "+(high?"acima":low?"abaixo":"exatamente na")+" média e "+significance,
       [
         "O valor calculado representa uma porcentagem de falhas",
         "O resultado permite prever com certeza o próximo teste",
         "Um resultado acima da média significa obrigatoriamente que o sistema está quebrado"
       ],"O sinal indica o lado da média; o valor absoluto de z indica a distância. A interpretação de ser bom ou ruim depende da variável.",
       ["meaning"],
       "Um resultado incomum pode ser bom ou ruim: latência mais BAIXA, por exemplo, pode ser ótima.")
   ];
   return {item,translation:item.goal||"Queremos comparar a medição recente com o que costuma acontecer, para saber se ela é comum ou incomum.",
     steps:s,result:"z = "+fmt(z,2),meaning:"O sinal mostra acima ou abaixo da média; o módulo mostra a distância. Aqui o valor "+significance+".",
     visual:"escore",calc:{z}};
 }
 function build(raw,random=false){
   const item=materialize(raw,random);
   let model;
   if(item.type==="mean")model=buildMean(item);
   else if(item.type==="prop")model=buildProp(item);
   else if(item.type==="dataset")model=buildDataset(item);
   else if(item.type==="sampleMean"||item.type==="sampleProp")model=buildSample(item);
   else if(item.type==="z")model=buildZ(item);
   else throw new Error("Exercício sem roteiro: "+item.type);
   if(window.DUO_PLAIN)model.steps=model.steps.map(ste=>window.DUO_PLAIN.plainStep(model,ste));
   return model;
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
 function hintFor(question,item){
   const q=question.toLowerCase();
   if(/amostra|tamanho da amostra|\bn\?/.test(q))return "Amostra é o grupo de pessoas, itens ou medições que foi observado. n é a quantidade de elementos.";
   if(/proporção|porcentagem|taxa/.test(q))return "Proporção é a parte de um total: 15 em cada 100 correspondem a 15%.";
   if(/média/.test(q))return "Média é um valor que representa o grupo: soma dos valores dividida pela quantidade de valores.";
   if(/desvio/.test(q))return "Desvio padrão indica o quanto as medições variam em relação à média.";
   if(/margem|erro máximo/.test(q))return "Margem de erro é o quanto de imprecisão a pesquisa aceita, não a taxa de falhas.";
   if(/confiança|crítico/.test(q))return "Nível de confiança indica a confiabilidade do método em muitas amostragens semelhantes.";
   if(/intervalo|\bic\b/.test(q))return "Intervalo de confiança é uma faixa de valores plausíveis para a média ou a porcentagem da população.";
   if(/regressão|reta/.test(q))return "Regressão usa uma variável conhecida para estimar outra, por meio de uma reta.";
   if(/correlação/.test(q))return "Correlação mede se duas grandezas variam juntas e em que direção.";
   if(/escore z/.test(q))return "O escore Z mede quantos desvios-padrão um valor está acima ou abaixo da média.";
   return "Primeiro entenda o pedido da história. A fórmula vem depois.";
 }
 function render(session){
   const model=session.model,cur=model.steps[session.index];
   if(!cur)return "";
   const total=model.steps.length,progress=(session.index+(session.answered?1:0))/total*100;
   const success=session.answered===true,incorrect=session.wrong;
   const compact=session.index>0&&!session.expanded;
   const sourceShort=model.item.source.includes("xlsx")?"Excel · "+(model.item.source.split(" · ")[1]||"Exercício"):model.item.source;
   const originLabel=model.item.reconstructed?
     (model.item.variant?"· Exemplo adaptado":"· Situação recriada; números do material"):
     (model.item.variant?"· Valores de treino":"· Exercício da planilha");
   const visual=(session.index>=Math.max(2,total-3) && model.visual!=="none" && window.DUO_FLOW)?
     '<details class="guide-visual"><summary>Ver desenho deste cálculo</summary><div>'+window.DUO_FLOW.sceneSvg(model.visual,model.calc,total-1,total)+'</div></details>':"";
   return '<div class="view guide-view"><button class="back" data-action="guided-exit">‹ Voltar aos exercícios</button>'+
    '<div class="guide-top"><span class="pill">'+esc(sourceShort)+' '+esc(originLabel)+'</span><span class="guide-count">'+(session.index+1)+'/'+total+'</span></div>'+
    '<div class="guide-progress" role="progressbar" aria-valuenow="'+(session.index+(success?1:0))+'" aria-valuemin="0" aria-valuemax="'+total+'"><span style="width:'+progress.toFixed(1)+'%"></span></div>'+
    '<div class="guide-card"><h1>'+esc(model.item.title)+'</h1><p class="guide-label">ENUNCIADO</p><div class="guide-statement '+(compact?"is-compact":"")+'">'+enunciado(model.item,session.revealed)+'</div>'+
    (session.index>0?'<button type="button" class="guide-expand-text" data-action="guided-expand">'+(session.expanded?"Recolher enunciado":"Ver enunciado completo")+"</button>":"" )+
    sourceTable(model.item)+'<div class="guide-translation '+(compact?"is-compact":"")+'"><strong>Tradução do enunciado</strong><p>'+esc(model.translation)+'</p></div>'+
    (window.DUO_PLAIN?window.DUO_PLAIN.glossary(model):"")+
    '<div class="guide-current"><span class="guide-label">PASSO '+(session.index+1)+'</span><h2>'+esc(cur.question)+'</h2>'+
    '<div class="guide-step-context">'+esc(cur.guide||window.DUO_GUIDED.hintFor(cur.question,model.item))+'</div>'+
    (window.DUO_HELP?window.DUO_HELP.help(model,cur,session.index):"")+
    (window.DUO_HELP?window.DUO_HELP.table(model):"")+
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
 window.DUO_GUIDED={build,render,finished,stats,hintFor};
})();
