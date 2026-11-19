/* =============================================================
   DUOSTATIC | LÓGICA DO JOGO — JavaScript puro, sem dependências
   Cada seção tem uma responsabilidade simples:
   1. salvar progresso; 2. calcular exercícios; 3. desenhar;
   4. montar as telas; 5. tratar os botões e teclas.
   ============================================================= */
(function () {
 "use strict";
 const DATA=window.STUDY_DATA;
 const root=document.getElementById("app");
 if(!root||!DATA){if(root)root.textContent="Não foi possível carregar os dados de estudo.";return;}
 const KEY="duostatic-carmesim-v1";
 const defaultState=()=>({xp:0,streak:0,best:0,correct:0,total:0,progress:{},settings:{values:"real",sound:false,reducedMotion:false},selectedTopics:[],libraryTopic:"corr",view:"trilha",session:null});
 function readState(){
   let s=defaultState();
   try{
     const old=JSON.parse(localStorage.getItem(KEY)||"null");
     if(old&&typeof old==="object"){
       s={...s,...old,settings:{...s.settings,...(old.settings||{})},progress:{...(old.progress||{})}};
       s.session=null;s.view="trilha";
       s.selectedTopics=Array.isArray(s.selectedTopics)?s.selectedTopics.filter(t=>DATA.topics.some(x=>x.id===t)).slice(0,2):[];
     }
   }catch(err){console.warn("O progresso anterior não pôde ser lido.",err)}
   return s;
 }
 let state=readState();
 function save(){try{localStorage.setItem(KEY,JSON.stringify({...state,session:null}))}catch(err){console.warn("Navegação privada: progresso não persistido.",err)}}
 function topic(id){return DATA.topics.find(t=>t.id===id)||DATA.topics[0]}
 function format(n,d=2){return Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d})}
 function pct(n,d=1){return format(n*100,d)+"%"}
 function zCritical(conf){return ({90:1.645,95:1.96,99:2.575})[conf]||1.96}
 function rand(arr){return arr[Math.floor(Math.random()*arr.length)]}
 function between(a,b){return Math.floor(Math.random()*(b-a+1))+a}
 function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){let j=between(0,i);[b[i],b[j]]=[b[j],b[i]]}return b}
 function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
 function flow(steps){return '<div class="flowchart">'+steps.map((s,i)=>(i?'<span class="flow-arrow">›</span>':'')+'<span class="flow-step">'+esc(s)+'</span>').join("")+'</div>'}
 function listPairs(key){
   const all={
     server:[DATA.serverX,DATA.serverY],
     bugs:[DATA.bugsX,DATA.bugsY],
     excel:[DATA.excelAges,DATA.excelHours],
     band:[DATA.usersX,DATA.bandY]
   };
   const [xx,yy]=all[key]||all.server;
   return xx.map((x,i)=>[x,yy[i]]);
 }
 function stats(pairs){
   if(!Array.isArray(pairs)||pairs.length<2)return {r:0,a:0,b:0};
   const n=pairs.length,mx=pairs.reduce((a,p)=>a+p[0],0)/n,my=pairs.reduce((a,p)=>a+p[1],0)/n;
   let xx=0,xy=0,yy=0;
   for(const [x,y] of pairs){xx+=(x-mx)**2;yy+=(y-my)**2;xy+=(x-mx)*(y-my)}
   const a=xx?xy/xx:0;
   return {r:xx&&yy?Math.max(-1,Math.min(1,xy/Math.sqrt(xx*yy))):0,a,b:my-a*mx};
 }
 function pickOptions(correct, wrong){
   const c=String(correct);const seen=new Set([c]);const items=[{text:c,correct:true}];
   for(const w of wrong){const v=String(w);if(!seen.has(v)){items.push({text:v,correct:false});seen.add(v)}if(items.length>=4)break}
   return shuffle(items);
 }
 function bounds(margin,center,d=2,unit=""){return format(center-margin,d)+"–"+format(center+margin,d)+(unit?" "+unit:"")}
 function buildQuestion(seed){
   const real=state.settings.values==="real";
   let q={...seed,opts:[],right:0,why:seed.why||"",cue:seed.cue||"",diagram:seed.visual||topic(seed.t).visual};
   let items=[];
   if(seed.kind==="choice"){
     items=pickOptions(seed.opts[seed.a],seed.opts.filter((_,i)=>i!==seed.a));
   }else if(seed.kind==="z"){
     let v=seed.value,m=seed.mean,sd=seed.sd;
     if(!real){m=between(5,35)*10;sd=rand([5,10,20,25,40]);v=m+sd*rand([-3,-2,-1,1,2,3])}
     if(!real)q.prompt="Com os números mostrados, como interpretar o Escore Z?";
     const z=(v-m)/sd;
     const label=z>2?"Acima da média e incomum":z< -2?"Abaixo da média e incomum":z===2?"Acima da média, no limite de atenção":z===-2?"Abaixo da média, no limite de atenção":z>0?"Acima da média, sem ultrapassar o limite":z<0?"Abaixo da média, sem ultrapassar o limite":"Exatamente na média";
     const wrong=["Acima da média e incomum","Abaixo da média e incomum","Acima da média, no limite de atenção","Abaixo da média, no limite de atenção","Acima da média, sem ultrapassar o limite","Abaixo da média, sem ultrapassar o limite","Exatamente na média"].filter(x=>x!==label);
     items=pickOptions(label,shuffle(wrong));q.context="Valor observado: "+format(v,Number.isInteger(v)?0:1)+" "+seed.unit+" · média: "+format(m,Number.isInteger(m)?0:1)+" · desvio padrão: "+format(sd,Number.isInteger(sd)?0:1);
     q.why="z = ("+format(v,Number.isInteger(v)?0:1)+" − "+format(m,Number.isInteger(m)?0:1)+") ÷ "+format(sd,Number.isInteger(sd)?0:1)+" = "+format(z,2)+". O sinal mostra de que lado da média está; a distância mede os desvios. Importante: ser incomum não é automaticamente ruim.";
     q.cue="Valor observado + média + desvio padrão → Escore Z.";
     q.path=["Valor individual","Compare com a média","Divida pelo desvio","Classifique o sinal e |z|"];q.zValue=z;
   }else if(seed.kind==="compareZ"){
     let a=[seed.aVal,seed.aMean,seed.aSd],b=[seed.bVal,seed.bMean,seed.bSd];
     if(!real){a=[95,65,10];b=[205,160,25]}
     if(!real)q.prompt="Qual dos sistemas se destacou mais RELATIVAMENTE à própria média?";
     const za=(a[0]-a[1])/a[2],zb=(b[0]-b[1])/b[2];
     const winner=za>zb?"Sistema A":"Sistema B";
     items=pickOptions(winner,["Sistema A","Sistema B","Empate de posições relativas","Não podemos comparar os escores"].filter(x=>x!==winner));
     q.context="A: "+a.join(" / ")+" (valor / média / DP) · B: "+b.join(" / ");
     q.why="z(A) = "+format(za,2)+" e z(B) = "+format(zb,2)+". O maior escore indica melhor resultado RELATIVO quando maior desempenho é desejável.";
     q.cue="Compare os escores padronizados, não os valores brutos.";
     q.path=["Identifique os dois grupos","Calcule z para cada um","Compare z(A) e z(B)","Escolha o maior desempenho relativo"];
   }else if(seed.kind==="mean"){
     let m=seed.mean,sd=seed.sd,n=seed.n,conf=seed.conf;
     if(!real){const factor=rand([.8,1.1,1.2]);m=Number((m*factor).toFixed(seed.digits));n=rand([36,49,64,81,100]);conf=rand([90,95,99])}
     if(!real)q.prompt="A partir dos dados mostrados, qual é o intervalo de confiança para a MÉDIA?";
     const margin=zCritical(conf)*sd/Math.sqrt(n),d=seed.digits||2;
     const good=bounds(margin,m,d,seed.unit);
     const wrong=[
       bounds(margin*2,m,d,seed.unit),bounds(margin*.5,m,d,seed.unit),
       bounds(margin*1.5,m,d,seed.unit),bounds(margin*3,m,d,seed.unit),
       bounds(margin,m+margin*2,d,seed.unit)
     ];
     items=pickOptions(good,wrong);q.context="Média amostral: "+format(m,d)+" "+seed.unit+" · desvio padrão: "+format(sd,d)+" · n = "+n+" · confiança = "+conf+"%.";
     q.why="Primeiro determine z = "+format(zCritical(conf),3)+". Depois, margem = z × "+format(sd,d)+" ÷ √"+n+" ≈ "+format(margin,d)+". A faixa é a média menos a margem até a média mais a margem: "+good+".";
     q.cue="A palavra MÉDIA e um desvio padrão indicam IC da média.";
     q.path=["Estimar uma média","Encontre média, DP e n","Calcule a margem","Média ± margem"];
     q.interval={lo:m-margin,hi:m+margin,center:m};
   }else if(seed.kind==="prop"){
     let successes=seed.success,n=seed.n,conf=seed.conf;
     if(!real){n=rand([100,200,400,500,800]);const p0=rand([.15,.30,.40,.63,.70,.75]);successes=Math.round(n*p0);conf=rand([90,95,99])}
     if(!real)q.prompt="Com esses dados, qual o intervalo de confiança para a PROPORÇÃO indicada?";
     const p=successes/n,margin=zCritical(conf)*Math.sqrt(p*(1-p)/n);
     const good=bounds(margin,p,3,"").replace(/([0-9]),/g,"$1,"); // limites em decimal, precisão padronizada
     const fmtRange=(mult)=>pct(Math.max(0,p-margin*mult),1)+"–"+pct(Math.min(1,p+margin*mult),1);
     const right=fmtRange(1);
     items=pickOptions(right,[fmtRange(.5),fmtRange(2),fmtRange(1.5),fmtRange(3),good]);
     q.context=successes+" "+seed.event+" de "+n+" observações · confiança = "+conf+"%.";
     q.why="p = "+successes+" ÷ "+n+" = "+pct(p,1)+". Margem = "+format(zCritical(conf),3)+" × √[p(1−p)/n] ≈ "+pct(margin,1)+" ponto(s) percentuais. IC: "+right+".";
     q.cue="Uma contagem de casos dentro de um total → proporção, não média.";
     q.path=["Defina o evento","p = casos / total","Margem percentual","p ± margem"];q.success=successes;q.n=n;
   }else if(seed.kind==="sampleMean"){
     let sd=seed.sd,err=seed.error,conf=seed.conf;
     if(!real){sd=rand([500,800,1200,1500]);err=rand([50,75,100,125]);conf=rand([90,95,99])}
     if(!real)q.prompt="Com a precisão e confiança indicadas, quantas MEDIÇÕES são necessárias no mínimo?";
     const n=Math.ceil(((zCritical(conf)*sd)/err)**2-1e-10);
     items=pickOptions(format(n,0)+" medições",[format(Math.max(1,n-1),0)+" medições",format(n+between(8,55),0)+" medições",format(Math.max(1,Math.floor(n/2)),0)+" medições",format(Math.round(n*1.25),0)+" medições"]);
     q.context="Desvio padrão conhecido: "+format(sd,0)+" "+seed.unit+" · erro máximo: "+format(err,0)+" "+seed.unit+" · confiança: "+conf+"%.";
     q.why="Para planejar uma MÉDIA: n = (z × σ / E)². Aqui: ("+format(zCritical(conf),3)+" × "+format(sd,0)+" / "+format(err,0)+")² = "+format(((zCritical(conf)*sd)/err)**2,2)+". Arredonde para cima: "+n+".";
     q.cue="Número mínimo de medições + desvio padrão + erro máximo → n da média.";
     q.path=["Planeje uma média","Encontre σ, E e confiança","Calcule n = (zσ/E)²","Arredonde para cima"];
   }else if(seed.kind==="sampleProp"){
     let p=seed.p,err=seed.error,conf=seed.conf;
     if(!real){p=rand([.15,.20,.30,.40,.50]);err=rand([.02,.03,.04,.05]);conf=rand([90,95,99])}
     if(!real)q.prompt="Com os dados mostrados, qual o número mínimo de OBSERVAÇÕES para estimar uma proporção?";
     const raw=(zCritical(conf)**2*p*(1-p))/err**2,n=Math.ceil(raw-1e-10);
     items=pickOptions(format(n,0)+" observações",[format(n-1,0)+" observações",format(Math.floor(n/2),0)+" observações",format(n+between(10,80),0)+" observações",format(Math.round(n*1.1),0)+" observações"]);
     q.context="Proporção anterior: "+pct(p,0)+" · erro máximo: "+pct(err,0)+" · confiança: "+conf+"%.";
     q.why="Para planejar uma PROPORÇÃO: n = z² × p(1−p) / E². Resultado ≈ "+format(raw,2)+"; arredondando para cima, "+n+" observações.";
     q.cue="Pergunta 'quantos?' e fornece taxa conhecida → n de proporção.";
     q.path=["Planeje uma porcentagem","Encontre p, E e confiança","Calcule z²p(1−p)/E²","Arredonde para cima"];
   }else if(seed.kind==="pearson"){
     let pairs=listPairs(seed.dataset);
     if(!real){
       const mult=rand([-2,-1.2,.85,1.5,2.4]);
       pairs=pairs.map(([x,y],i)=>[x,Math.max(.01,Math.round((Math.abs(mult)*y)+(i%3)*Math.abs(mult)*2))]);
       if(mult<0){const maxY=Math.max(...pairs.map(p=>p[1]));pairs=pairs.map(([x,y])=>[x,maxY-y+10])}
     }
     if(!real)q.prompt="Na variação de treino destes dados, qual a direção e força da correlação?";
     const {r}=stats(pairs),power=Math.abs(r)>=.7?"forte":Math.abs(r)>=.3?"moderada":"fraca";
     const direction=r>.02?"positiva":r<-.02?"negativa":"próxima de zero";
     const label=power+" e "+direction;
     items=pickOptions(label,shuffle(["forte e positiva","forte e negativa","moderada e positiva","moderada e negativa","fraca e positiva","fraca e negativa","próxima de zero"]).filter(x=>x!==label));
     q.context=pairs.length+" pares (X, Y). Primeiros dados: "+pairs.slice(0,4).map(([x,y])=>"("+x+"; "+y+")").join(", ")+"…";
     q.why="Calculando o coeficiente de Pearson para os "+pairs.length+" pares, r ≈ "+format(r,3)+". O sinal mostra o sentido e |r| indica a intensidade; aqui a relação é "+label+".";
     q.cue="Duas colunas quantitativas + pedido de força/direção → Pearson.";
     q.path=["Identifique pares X e Y","Faça o gráfico de dispersão","Calcule r (−1 a +1)","Explique sinal e intensidade"];
     q.pairs=pairs;q.diagram="scatter";
   }else if(seed.kind==="regression"){
     let pairs=listPairs(seed.dataset),target=seed.predict;
     if(!real){const multiplier=rand([.65,.8,1.2,1.4]);pairs=pairs.map(([x,y])=>[x,Math.round(y*multiplier)]);target=Math.round(target*rand([.9,1,1.1]))}
     if(!real)q.prompt="Para X = "+format(target,0)+", qual valor de Y a reta ajustada prevê?";
     const {a,b}=stats(pairs),pred=a*target+b,d=seed.dataset==="bugs"?1:0;
     items=pickOptions(format(pred,d),[format(pred+(d?2:60),d),format(pred-(d?2:60),d),format(pred+(d?4:100),d),format(pred-(d?4:100),d)]);
     q.context=pairs.length+" pares observados. Use X = "+format(target,0)+". Primeiros dados: "+pairs.slice(0,3).map(([x,y])=>"("+x+"; "+y+")").join(", ")+"…";
     q.why="A reta ajustada tem inclinação a ≈ "+format(a,4)+" e intercepto b ≈ "+format(b,3)+". Portanto y ≈ "+format(a,4)+" × "+format(target,0)+" + ("+format(b,3)+") = "+format(pred,d)+".";
     q.cue="Um X novo e um Y previsto → regressão, não apenas correlação.";
     q.path=["Defina X e Y","Ajuste y = ax + b","Substitua X = "+format(target,0),"Interprete Y previsto"];
     q.pairs=pairs;q.diagram="line";
   }
   if(!items.length)items=pickOptions("Revisar o enunciado",["Voltar à teoria","Analisar os dados","Ler os conceitos"]);
   q.opts=items.map(x=>x.text);q.right=Math.max(0,items.findIndex(x=>x.correct));
   if(!q.path)q.path=["O que o enunciado pede?",q.cue||"Encontre as pistas",topic(q.t).title,"Interprete a conclusão"];
   return q;
 }
 function pointsSVG(pairs,withLine){
   const xs=pairs.map(p=>p[0]),ys=pairs.map(p=>p[1]),minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
   const xp=x=>36+(x-minx)/(maxx-minx||1)*226,yp=y=>180-(y-miny)/(maxy-miny||1)*134;
   const dots=pairs.map(([x,y])=>'<circle cx="'+xp(x).toFixed(1)+'" cy="'+yp(y).toFixed(1)+'" r="'+(pairs.length>20?3:4)+'" fill="#ff7885" stroke="#f1d4cb" stroke-width="1"/>').join("");
   let line="";
   if(withLine){const {a,b}=stats(pairs);line='<path d="M'+xp(minx).toFixed(1)+' '+yp(a*minx+b).toFixed(1)+' L'+xp(maxx).toFixed(1)+' '+yp(a*maxx+b).toFixed(1)+'" stroke="#edc19a" stroke-width="2.8" stroke-dasharray="5 4" fill="none"/>'}
   return '<path d="M32 22V183H269" fill="none" stroke="#a17c85" stroke-width="2"/>'+line+dots+'<text x="266" y="199" font-size="12" fill="#e4b6ac">X</text><text x="12" y="24" font-size="12" fill="#e4b6ac">Y</text>';
 }
 function draw(kind,q={}){
   const prefix='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 210" aria-label="Diagrama explicativo" role="img"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#ad1936"/><stop offset="1" stop-color="#fa6d75"/></linearGradient></defs>';
   const end='</svg>';
   if(kind==="scatter"||kind==="line")return prefix+pointsSVG(q.pairs|| (kind==="scatter"?[[1,20],[2,32],[3,46],[4,53],[5,78],[6,90]]:[[1,28],[2,51],[3,72],[4,88],[5,119],[6,132]]),kind==="line")+end;
   if(kind==="bell") {
     let z=Number.isFinite(q.zValue)?q.zValue:1.5;
     const marker=Math.max(29,Math.min(271,150+z*38));
     return prefix+'<path d="M20 181H285" stroke="#9f7b85" stroke-width="2"/><path d="M27 179C50 179 63 172 80 143S120 25 150 24 203 125 222 154 263 179 278 179" fill="none" stroke="#f7a6a8" stroke-width="4"/><path d="M'+marker+' 35V182" stroke="#ff5c65" stroke-width="3" stroke-dasharray="5 6"/><circle cx="'+marker+'" cy="181" r="6" fill="#ff6b78"/><text x="142" y="201" font-size="12" fill="#d7aaa9">média</text><text x="35" y="201" font-size="11" fill="#d7aaa9">−3</text><text x="258" y="201" font-size="11" fill="#d7aaa9">+3</text>'+end;
   }
   if(kind==="interval")return prefix+'<path d="M19 110H285" stroke="#8f6373" stroke-width="3"/><rect x="62" y="82" width="175" height="55" rx="15" fill="#892b4777" stroke="#fd909c" stroke-width="2"/><path d="M62 71V149 M237 71V149" stroke="#f6b39f" stroke-width="4"/><circle cx="150" cy="110" r="12" fill="#ff5d71" stroke="#ffdbca" stroke-width="3"/><text x="51" y="163" font-size="14" fill="#e8c5b6">Limite</text><text x="133" y="66" font-size="14" fill="#fff0dd">Média</text><text x="220" y="163" font-size="14" fill="#e8c5b6">Limite</text><text x="95" y="195" font-size="12" fill="#e1aab5">faixa de confiança</text>'+end;
   if(kind==="pie"){let ratio=q.success&&q.n?q.success/q.n:.7;ratio=Math.max(0,Math.min(1,ratio));return prefix+'<circle cx="135" cy="104" r="66" fill="#362030" stroke="#6b3b4a" stroke-width="2"/><circle cx="135" cy="104" r="66" fill="none" stroke="#ea5269" stroke-width="30" stroke-dasharray="'+(414.69*ratio).toFixed(1)+' 414.69" transform="rotate(-90 135 104)"/><circle cx="135" cy="104" r="39" fill="#261722"/><text x="135" y="108" text-anchor="middle" font-size="21" fill="#fce0cf">'+format(ratio*100,0)+'%</text><text x="135" y="128" text-anchor="middle" font-size="11" fill="#c9a3a5">parte do todo</text><text x="220" y="73" font-size="12" fill="#f4bac3">SIM</text><text x="220" y="126" font-size="12" fill="#a48d9a">NÃO</text>'+end}
   if(kind==="bars")return prefix+'<path d="M32 183H273" stroke="#99747f" stroke-width="3"/>'+[[46,73],[90,118],[134,150],[178,178],[222,195]].map(([x,height],i)=>'<rect x="'+x+'" y="'+(182-height/1.4)+'" width="29" height="'+height/1.4+'" rx="6" fill="'+(i===4?'#f36373':'#8f3148')+'" stroke="#e9a3aa"/>').join("")+'<text x="77" y="32" font-size="13" fill="#dcb9ae">Mais precisão = mais dados</text>'+end;
   return prefix+pointsSVG([[1,10],[2,22],[3,30],[4,40]],true)+end;
 }
 function heroIntro(){
   return '<section class="hero"><div class="hero-text"><p class="eyebrow">✦ SUA JORNADA COMEÇA AQUI</p><h1>Domine a <span style="color:#ff8d97">estatística</span>, sem decorar cegamente.</h1><p>Leia os enunciados, identifique o que eles pedem e escolha o raciocínio correto. Uma missão de cada vez.</p><div class="hero-actions"><button class="btn btn-primary" data-action="continue">Continuar a trilha ›</button><button class="btn btn-outline" data-nav="infinito">Treino infinito ∞</button></div></div><img class="hero-img" src="assets/arle-calma.webp" alt="Arlecchino chibi sorridente, recebendo o estudante" decoding="async"></section>'
 }
 function renderTrail(){
   return '<div class="trail">'+DATA.topics.map((t,i)=>{
      const count=state.progress[t.id]||0;
      return '<section class="trail-world"><div class="world-heading"><strong>'+t.number+' · '+t.title+'</strong><small>'+t.subtitle+' — '+count+'/4 etapas</small></div><div class="path-nodes">'+t.stages.map((stage,j)=>{
        const unlocked=j<=count,done=j<count;
        return '<div class="node-row"><div class="node-wrap"><button class="node '+(done?'done':unlocked?'active':'locked')+'" data-action="stage" data-topic="'+t.id+'" data-stage="'+j+'" '+(!unlocked?'disabled aria-disabled="true"':'')+' aria-label="'+t.title+', etapa '+(j+1)+': '+esc(stage)+'">'+(done?'✓':!unlocked?'♢':j===0?'⌂':j===3?'♛':'✦')+'</button><span class="node-label">'+esc(stage)+'</span></div></div>';
      }).join("")+'</div></section>';
   }).join("")+'</div>'
 }
 function home(){
   return '<div class="view">'+heroIntro()+'<div class="section-top"><div><h2>Seu progresso</h2><p>Aprender é reconhecer padrões, não memorizar símbolos.</p></div><span class="pill">✧ '+(Object.values(state.progress).reduce((a,b)=>a+b,0))+'/24 etapas</span></div>'+
   '<div class="stats-grid"><div class="stat"><strong>'+state.xp+'</strong><small>Experiência</small></div><div class="stat"><strong>'+state.total+'</strong><small>Questões feitas</small></div><div class="stat"><strong>'+(state.total?Math.round(100*state.correct/state.total):0)+'%</strong><small>Acertos</small></div></div>'+
   '<div class="section-top"><div><h2>A trilha carmesim</h2><p>Quatro etapas por território. Avance do conceito à interpretação.</p></div></div>'+renderTrail()+'</div>';
 }
 function intro(){
   const {topic:tid,stage}=state.session,t=topic(tid);
   return '<div class="view"><button class="back" data-nav="trilha">‹ Voltar à trilha</button><p class="eyebrow">TERRITÓRIO '+t.number+' · ETAPA '+(stage+1)+' DE 4</p><div class="story"><div class="story-card"><span class="pill">'+t.icon+' '+esc(t.stages[stage])+'</span><h1 style="margin-top:16px">'+t.title+'</h1><h3 style="color:var(--gold)">O que é?</h3><p>'+t.what+'</p><h3 style="color:var(--gold)">Para que serve?</h3><p>'+t.function+'</p><div class="notice">Imagine: '+t.analogy+'</div></div><div class="story-diagram">'+draw(t.visual)+'<span class="pill">Pense visualmente</span><p class="muted tiny">'+esc(t.short)+'</p><img src="assets/arle-sentada.webp" alt="Arlecchino chibi sentada, acompanhando a explicação" class="intro-mascot" loading="lazy" decoding="async"></div></div>'+
   '<div class="section-top"><div><h2>Como reconhecer?</h2><p>Este é o caminho de decisão para os exercícios.</p></div></div><div class="surface"><p><strong class="gold">Palavras-pista:</strong> '+t.cue+'</p>'+flow(t.steps)+'<div class="formula-box"><strong>Fórmula só depois de entender</strong><code>'+esc(t.formula)+'</code></div><div class="notice"><strong>Armadilha clássica:</strong> '+t.trap+'</div></div>'+
   '<div class="quick-actions"><button class="btn btn-quiet" data-nav="biblioteca">Consultar biblioteca</button><button class="btn btn-primary" data-action="begin">Entendi · testar agora ›</button></div></div>';
 }
 function renderQuiz(){
   const s=state.session,q=s.question,t=topic(q.t);
   const target=s.kind==="lesson"?lessonCount(s.stage):null;
   return '<div class="view"><button class="back" data-nav="'+(s.kind==="lesson"?"trilha":"infinito")+'">‹ Sair do desafio</button><div class="module-counter"><span class="pill">'+(s.kind==="infinite"?"∞ TREINO INFINITO":t.number+" · "+esc(t.title))+'</span><div class="bar-track" aria-label="Progresso"><div class="bar-fill" style="width:"'+(target?100*s.count/target:Math.min(100,s.count%10*10))+'%"></div></div><span class="question-tick">'+(s.count+(s.chosen===null?1:0))+(target?"/"+target:" · ∞")+'</span></div>'+
   '<div class="quiz-layout"><section class="question-card"><div class="question-head"><h2>'+esc(q.label||t.title)+'</h2><span class="pill">✦ +15 XP</span></div><div class="question-context">'+esc(q.context||"Leia atentamente a situação e reconheça o conceito central antes de calcular.")+'</div><p class="question-prompt">'+esc(q.prompt)+'</p><button class="btn btn-quiet" data-action="speak" style="margin:0 0 15px;padding:9px 14px;min-height:40px">♫ Ouvir enunciado</button><div class="choices" role="group" aria-label="Alternativas">'+q.opts.map((o,i)=>'<button class="choice '+(s.chosen!==null?(i===q.right?"correct":i===s.chosen?"incorrect":"dim"):"")+'" data-answer="'+i+'" '+(s.chosen!==null?"disabled":"")+'><span class="key">'+(i+1)+'</span>'+esc(o)+'</button>').join("")+'</div>'+
   (s.chosen===null?'<details style="margin-top:17px;color:var(--soft)"><summary style="cursor:pointer">Precisa de uma pista para interpretar?</summary><p style="padding:10px 0 0;color:var(--gold)">'+esc(q.cue||t.cue)+'</p></details>':'<div class="feedback '+(s.chosen===q.right?"":"bad")+' pop" role="status"><div class="feedback-body"><strong>'+(s.chosen===q.right?"✦ Muito bem! Você identificou o caminho.":"A interpretação correta é: "+esc(q.opts[q.right]))+'</strong><p>'+esc(q.why)+'</p><strong style="font-size:1rem;color:var(--gold)">Fluxograma deste exercício</strong>'+flow(q.path)+'<small>Fonte: '+esc(q.src||"Conteúdo da aula")+'</small></div><img class="feedback-mascot" src="assets/arle-'+(s.chosen===q.right?"vitoria":"irritada")+'.webp" alt="'+(s.chosen===q.right?"Arlecchino comemorando o acerto":"Arlecchino com expressão irritada")+'" loading="lazy" decoding="async"></div>')+
   '<div class="quick-actions">'+(s.chosen!==null?'<button class="btn btn-primary" data-action="next">'+(s.kind==="infinite"?"Próxima questão ∞":"Continuar a trilha ›")+'</button>':'<span class="tiny muted">Use as teclas 1–4 para responder.</span>')+'</div></section>'+
   '<aside class="quiz-aside"><div><h3>Observe a pista</h3><p>'+esc(s.chosen===null?"Olhe o gráfico e faça uma pergunta: estou comparando, prevendo, estimando uma faixa ou procurando um valor incomum?":q.cue||t.cue)+'</p><div class="divider"></div><span class="tag-source">'+esc(q.src||"Aula de Estatística")+'</span><img class="aside-mascot" src="assets/arle-pensativa.webp" alt="Arlecchino pensativa" loading="lazy" decoding="async"></div><div class="diagram">'+draw(q.diagram,q)+'</div></aside></div></div>';
 }
 function renderFinished(){
   const s=state.session,t=topic(s.topic),pctGood=Math.round(s.correct/s.count*100);
   return '<div class="view finished"><p class="eyebrow">✦ ETAPA CONCLUÍDA</p><img src="assets/arle-'+(pctGood>=80?"vitoria":"calma")+'.webp" alt="Arlecchino chibi reconhecendo a etapa concluída" class="finished-mascot" decoding="async"><h1 class="celebrate">'+(pctGood>=80?"Domínio impressionante!":"Uma nova etapa vencida.")+'</h1><p>'+esc(t.stages[s.stage])+' · '+t.title+'</p><div class="stats-grid"><div class="stat"><strong>'+s.correct+'/'+s.count+'</strong><small>Acertos</small></div><div class="stat"><strong>'+pctGood+'%</strong><small>Desempenho</small></div><div class="stat"><strong>+'+s.gained+'</strong><small>XP nesta etapa</small></div></div><p>Entender o motivo de cada resposta vale mais que acertar no chute. Você pode repetir esta etapa quantas vezes quiser.</p><div class="hero-actions" style="justify-content:center"><button class="btn btn-quiet" data-action="repeat">Repetir etapa</button><button class="btn btn-primary" data-action="after-finish">'+(s.stage<3?"Próxima casa da trilha ›":"Ver trilha ›")+'</button></div></div>';
 }
 function infinite(){
  const all=state.selectedTopics.length===0;
  return '<div class="view"><p class="eyebrow">∞ TREINO SEM FIM</p><h1>O ritual infinito</h1><p class="subheading">Questões contínuas, sem cronômetro e sem tela de término. Escolha todos os temas, um ou até dois para praticar com foco.</p><div class="story" style="margin-top:26px"><div class="story-card"><h2>Defina seu território</h2><div class="chips"><button class="chip '+(all?"active":"")+'" data-action="all" aria-pressed="'+all+'">✦ Todos os temas</button>'+DATA.topics.map(t=>'<button class="chip '+(state.selectedTopics.includes(t.id)?"active":"")+'" aria-pressed="'+state.selectedTopics.includes(t.id)+'" data-action="toggle-topic" data-topic="'+t.id+'">'+t.icon+' '+t.title+'</button>').join("")+'</div><p id="topic-warning" style="margin-top:15px;font-size:.85rem;color:var(--gold)">'+(all?"As seis matérias serão misturadas.":state.selectedTopics.length+" tema(s) selecionado(s). Escolha no máximo dois.")+'</p><div class="notice">Os assuntos aparecem em ordem alternada e as respostas recebem uma explicação e fluxograma. Não há fim automático.</div><span class="pill">Dados: '+(state.settings.values==="real"?"exercícios originais":"variações aleatórias")+'</span><div style="margin-top:20px"><button class="btn btn-primary btn-full" data-action="start-infinite">Começar treino infinito ∞</button></div></div><div class="story-diagram" style="align-items:center"><img src="assets/arle-sentada.webp" alt="Arlecchino chibi sentada" class="infinite-mascot" decoding="async"><p class="muted">“Reconhecer o enunciado é metade do caminho.”</p></div></div></div>'
 }
 function library(){
  const t=topic(state.libraryTopic);
  return '<div class="view"><p class="eyebrow">▤ CÓDICE DE ESTUDO</p><h1>Biblioteca de conceitos</h1><p class="subheading">Leia no seu ritmo. Explicações, palavras-pista, fluxogramas e um desenho para cada tema, sem enxurrada de fórmulas.</p><div class="library-nav">'+DATA.topics.map(x=>'<button class="'+(x.id===t.id?"active":"")+'" data-action="library" data-topic="'+x.id+'">'+x.icon+' '+x.title+'</button>').join("")+'</div><div class="story"><div class="story-card"><p class="eyebrow">CAPÍTULO '+t.number+'</p><h2>'+t.title+'</h2><h3 class="gold">O que é?</h3><p>'+t.what+'</p><h3 class="gold">Para que serve?</h3><p>'+t.function+'</p><h3 class="gold">Pense neste exemplo</h3><p>'+t.analogy+'</p></div><div class="story-diagram">'+draw(t.visual)+'<p class="muted">'+t.short+'</p><img class="library-mascot" src="assets/arle-pensativa.webp" alt="Arlecchino pensativa" loading="lazy" decoding="async"></div></div><div class="guide-card"><h3>Como decidir se a questão pede este tema</h3><p><strong class="gold">Procure:</strong> '+t.cue+'</p>'+flow(t.steps)+'<div class="formula-box"><strong>Quando chegar a hora de calcular</strong><code>'+esc(t.formula)+'</code></div><div class="notice"><strong>Não caia nesta armadilha:</strong> '+t.trap+'</div></div><div class="quick-actions"><button class="btn btn-primary" data-action="library-practice" data-topic="'+t.id+'">Praticar este assunto ›</button></div></div>'
 }
 function settings(){
  const real=state.settings.values==="real",reduced=state.settings.reducedMotion;
  return '<div class="view"><p class="eyebrow">⚙ PREFERÊNCIAS</p><h1>Configurações</h1><p class="subheading">Estude exatamente com os dados das aulas ou crie novas combinações para aprender a raciocinar sem decorar respostas.</p><div class="settings-grid" style="margin-top:25px"><div class="setting-block"><h3>Valores dos exercícios</h3><p>Escolha como os números aparecem em perguntas de cálculo.</p><div class="segmented" aria-label="Origem dos números"><button data-action="mode" data-value="real" class="'+(real?"active":"")+'">Dados reais</button><button data-action="mode" data-value="random" class="'+(!real?"active":"")+'">Aleatórios</button></div><p style="margin-top:15px">'+(real?"Usa valores originais dos PDFs e a amostra de 30 registros do Excel.":"Gera variações e recalcula a resposta correta, margem de erro e previsões.")+'</p></div><div class="setting-block"><h3>Experiência</h3><p>Controle efeitos durante os estudos.</p><label class="toggle-row"><span>Som de acerto <small class="muted">(desativado por padrão)</small></span><input class="switch" type="checkbox" data-setting="sound" '+(state.settings.sound?"checked":"")+'></label><label class="toggle-row"><span>Reduzir animações</span><input class="switch" type="checkbox" data-setting="reducedMotion" '+(reduced?"checked":"")+'></label></div><div class="setting-block"><h3>Progresso</h3><p>Salvo neste navegador, sem cadastro ou servidor. Apagar dados de navegação pode eliminá-lo.</p><p><strong>'+Object.values(state.progress).reduce((a,b)=>a+b,0)+'/24</strong> etapas · <strong>'+state.total+'</strong> respostas · <strong>'+state.best+'</strong> melhor sequência.</p><button class="btn btn-quiet" data-action="reset">Reiniciar progresso</button></div><div class="setting-block"><h3>Como interpretar os exercícios originais</h3><p>Os exercícios foram reorganizados para ensinar decisões, preservando os dados numéricos onde indicado. Quando um material apresenta erros de rótulo ou arredondamento, os resultados são recalculados a partir dos números.</p><span class="tag-source">PDFs · slides · planilhas Excel</span></div></div></div>';
 }
 function render(){
   document.body.classList.toggle("reduce-motion",Boolean(state.settings.reducedMotion));
   root.innerHTML=({trilha:home,infinito:infinite,biblioteca:library,configuracoes:settings,intro,quiz:renderQuiz,finished:renderFinished})[state.view]?.()||home();
   const navView=["intro","quiz","finished"].includes(state.view)?state.session?.kind==="infinite"?"infinito":"trilha":state.view;
   document.querySelectorAll("[data-nav]").forEach(el=>el.classList.toggle("active",el.dataset.nav===navView));
   const headerXP=document.getElementById("header-xp"),headerStreak=document.getElementById("header-streak");
   if(headerXP)headerXP.textContent=state.xp;
   if(headerStreak)headerStreak.textContent=state.streak;
 }
 function go(view){if(!["trilha","infinito","biblioteca","configuracoes"].includes(view))view="trilha";state.view=view;save();render();window.scrollTo({top:0,behavior:state.settings.reducedMotion?"instant":"smooth"})}
 function lessonCount(stage){const t=state.session?.topic;const pool=DATA.questions.filter(q=>q.t===t&&q.level<=stage).length;return Math.max(1,Math.min(stage===0?3:stage===1?4:5,pool))}
 function prepareLesson(tid,stage){
   if(!DATA.topics.some(t=>t.id===tid))return;
   const unlocked=state.progress[tid]||0;
   if(stage>unlocked)return;
   state.session={kind:"lesson",topic:tid,stage,asked:[],count:0,correct:0,gained:0,chosen:null,question:null};state.view="intro";render();window.scrollTo(0,0)
 }
 function begin(){
   const s=state.session;if(!s)return;
   state.view="quiz";nextQuestion();
 }
 function startInfinite(){
   state.session={kind:"infinite",topic:null,stage:3,asked:[],count:0,correct:0,gained:0,chosen:null,question:null};state.view="quiz";nextQuestion()
 }
 function nextQuestion(){
   const s=state.session;if(!s)return;
   const target=s.kind==="lesson"?lessonCount(s.stage):Infinity;
   if(s.count>=target){
     state.progress[s.topic]=Math.max(state.progress[s.topic]||0,s.stage+1);save();state.view="finished";render();window.scrollTo(0,0);return;
   }
   let list=DATA.questions.filter(q=>s.kind==="infinite"?(state.selectedTopics.length===0||state.selectedTopics.includes(q.t)):(q.t===s.topic&&q.level<=s.stage));
   if(!list.length)list=DATA.questions.filter(q=>q.t===(s.topic||"corr"));
   const remaining=list.filter(q=>!s.asked.includes(DATA.questions.indexOf(q)));
   const pool=remaining.length?remaining:list;
   const chosen=rand(pool);
   if(!remaining.length)s.asked=[];
   s.asked.push(DATA.questions.indexOf(chosen));
   s.question=buildQuestion(chosen);s.chosen=null;
   render();window.scrollTo({top:0,behavior:state.settings.reducedMotion?"instant":"smooth"});
 }
 function playSound(){
   if(!state.settings.sound)return;
   try{
     const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
     const ctx=new AC(),o=ctx.createOscillator(),g=ctx.createGain();
     o.type="sine";o.frequency.setValueAtTime(600,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(920,ctx.currentTime+.13);
     g.gain.setValueAtTime(.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);
     o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.2);o.onended=()=>ctx.close();
   }catch(_){}
 }
 function answer(index){
   const s=state.session;
   if(state.view!=="quiz"||!s||s.chosen!==null||index<0||index>=s.question.opts.length)return;
   s.chosen=index;
   const good=index===s.question.right;
   s.correct+=good?1:0;s.count+=1;
   const gain=good?15:3;s.gained+=gain;state.xp+=gain;
   state.total+=1;state.correct+=good?1:0;
   state.streak=good?state.streak+1:0;state.best=Math.max(state.best,state.streak);
   if(good)playSound();save();render();
   const feedback=root.querySelector(".feedback");
   if(feedback)feedback.scrollIntoView({behavior:state.settings.reducedMotion?"instant":"smooth",block:"nearest"});
 }
 function completeNext(){
   const s=state.session;if(!s)return go("trilha");
   if(s.stage<3)prepareLesson(s.topic,s.stage+1);
   else go("trilha");
 }
 function updateTopic(tid){
   if(!DATA.topics.some(t=>t.id===tid))return;
   const pos=state.selectedTopics.indexOf(tid);
   if(pos>=0)state.selectedTopics.splice(pos,1);
   else if(state.selectedTopics.length<2)state.selectedTopics.push(tid);
   else{const el=document.getElementById("topic-warning");if(el)el.textContent="Escolha no máximo dois temas. Desmarque um primeiro.";return}
   save();render();
 }
 function pressAction(el){
   if(el.dataset.nav){go(el.dataset.nav);return}
   if(el.dataset.answer!==undefined){answer(Number(el.dataset.answer));return}
   const action=el.dataset.action;
   switch(action){
     case"continue":{const t=DATA.topics.find(x=>(state.progress[x.id]||0)<4)||DATA.topics[0];prepareLesson(t.id,Math.min(3,state.progress[t.id]||0));break}
     case"stage":prepareLesson(el.dataset.topic,Number(el.dataset.stage));break;
     case"begin":begin();break;
     case"next":nextQuestion();break;
     case"repeat":prepareLesson(state.session.topic,state.session.stage);break;
     case"after-finish":completeNext();break;
     case"speak":{
       const q=state.session?.question;
       if(q&&window.speechSynthesis&&window.SpeechSynthesisUtterance){
         window.speechSynthesis.cancel();
         const utterance=new window.SpeechSynthesisUtterance((q.context||"")+" "+q.prompt);
         utterance.lang="pt-BR";utterance.rate=.93;
         window.speechSynthesis.speak(utterance);
       }
       break;
     }
     case"start-infinite":startInfinite();break;
     case"toggle-topic":updateTopic(el.dataset.topic);break;
     case"all":state.selectedTopics=[];save();render();break;
     case"library":state.libraryTopic=el.dataset.topic;save();render();break;
     case"library-practice":prepareLesson(el.dataset.topic,Math.min(3,state.progress[el.dataset.topic]||0));break;
     case"mode":state.settings.values=el.dataset.value==="random"?"random":"real";save();render();break;
     case"reset":if(window.confirm("Apagar todo o progresso, XP e preferências salvos neste navegador?")){state=defaultState();save();render()}break;
   }
 }
 document.addEventListener("click",e=>{const el=e.target.closest("button[data-nav],button[data-action],button[data-answer]");if(el&&!el.disabled)pressAction(el)});
 document.addEventListener("change",e=>{
   const el=e.target;if(el.matches("input[data-setting]")){
     state.settings[el.dataset.setting]=el.checked;
     save();render();
   }
 });
 document.addEventListener("keydown",e=>{
   if(state.view==="quiz"&&state.session){
     if(state.session.chosen===null&&/^[1-4]$/.test(e.key)&&!e.altKey&&!e.ctrlKey){answer(Number(e.key)-1)}
     else if(state.session.chosen!==null&&e.key==="Enter"){e.preventDefault();nextQuestion()}
   }
 });
 if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)state.settings.reducedMotion=true;
 render();
})();
