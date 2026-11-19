/* ===============================================================
   DUOSTATIC | LABORATÓRIO VISUAL DE CÁLCULO
   Cada nó mostra O QUE identificar, a conta e o sentido do resultado.
   Recebe os números já calculados pelo mecanismo de exercícios.
   SVG vetorial sem dependências, reativo à etapa selecionada.
   =============================================================== */
(function () {
 "use strict";
 const fmt=(n,d=2)=>Number(n).toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});
 const pct=(n,d=1)=>fmt(100*n,d)+"%";
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const step=(label,value,detail,math="")=>({label,value:String(value??"—"),detail,math});
 const stepsFor=(id,q)=>{
   const c=q?.calc, t=window.STUDY_DATA.topics.find(x=>x.id===id);
   if(!c){
     const names=q?.path||t?.steps||["Leia o enunciado","Reconheça as pistas","Escolha o método","Interprete a resposta"];
     return {kind:"concept", data:{},steps:names.map((name,i)=>step(name,i===0?"Comece aqui":i===names.length-1?"Conclusão":"Interpretação",[t?.what,t?.cue,t?.function,t?.trap][i%4]||"Pergunte o que a questão quer saber."))};
   }
   if(c.kind==="sampleProp")return {kind:"amostra",data:c,steps:[
     step("Pergunta","Quantos testes?","A pergunta quer planejar o número mínimo de observações, antes da pesquisa."),
     step("Proporção p",pct(c.p,0),"A porcentagem esperada de casos favoráveis. Se for desconhecida, p = 50% é a escolha conservadora."),
     step("Confiança z",fmt(c.z,3),c.conf+"% de confiança corresponde ao valor crítico z indicado na aula."),
     step("Erro máximo E",pct(c.err,1),"Converta a porcentagem para decimal: "+pct(c.err,1)+" vira "+fmt(c.err,3)+"."),
     step("Calcular n",fmt(c.raw,2),"Agora substitua todos os dados. O resultado pode não ser inteiro.","n = z² × p × (1−p) / E²"),
     step("Arredondar",fmt(c.n,0)+" pessoas/testes","Arredonde SEMPRE para cima. O arredondamento para baixo pode ultrapassar o erro permitido.","n mínimo = "+fmt(c.n,0))
   ]};
   if(c.kind==="sampleMean")return {kind:"amostra",data:c,steps:[
     step("Pergunta","Quantas medições?","O exercício quer o número mínimo de medidas para estimar uma MÉDIA."),
     step("Desvio σ",fmt(c.sd,0),"O desvio mostra quanto os valores individuais costumam variar."),
     step("Confiança z",fmt(c.z,3),"Com "+c.conf+"% de confiança, busque o z crítico."),
     step("Erro máximo E",fmt(c.err,0),"O quanto você aceita errar na estimativa da média."),
     step("Calcular n",fmt(c.raw,2),"Use o quadrado da razão entre z × desvio e erro máximo.","n = (z × σ / E)²"),
     step("Arredondar",fmt(c.n,0)+" medições","O resultado mínimo deve ser inteiro: suba para o próximo inteiro.","n mínimo = "+fmt(c.n,0))
   ]};
   if(c.kind==="prop")return {kind:"proporcao",data:c,steps:[
     step("Amostra n",fmt(c.n,0),"Quantos elementos foram observados ao todo? Este é o denominador."),
     step("Casos x",fmt(c.success,0),"Quantos pertencem exatamente ao grupo que a pergunta quer medir?"),
     step("Proporção p",pct(c.p,1),"Divida os casos favoráveis pelo total. Isso produz a porcentagem observada.","p = "+fmt(c.success,0)+" ÷ "+fmt(c.n,0)+" = "+fmt(c.p,4)),
     step("Valor z",fmt(c.z,3),"Busque o valor crítico do nível de confiança informado ("+c.conf+"%)."),
     step("Margem E",pct(c.margin,2)+" p.p.","A margem indica quanto a proporção amostral pode variar para criar os limites do IC.","E = z × √[p(1−p)/n]"),
     step("Intervalo IC",pct(c.lo,1)+" – "+pct(c.hi,1),"Calcule o limite inferior e superior. Ambos são porcentagens da população.","IC = p − E até p + E")
   ]};
   if(c.kind==="mean")return {kind:"media",data:c,steps:[
     step("Média amostral",fmt(c.mean,2)+" "+c.unit,"Este é o centro da estimativa, não o resultado de todos os indivíduos."),
     step("Desvio padrão",fmt(c.sd,2)+" "+c.unit,"Indica quanto os dados variam em relação à média."),
     step("Amostra n",fmt(c.n,0),"Mais observações costumam diminuir a margem de erro."),
     step("Valor z",fmt(c.z,3),"Para "+c.conf+"% de confiança, use o valor z crítico da aula."),
     step("Margem E",fmt(c.margin,2)+" "+c.unit,"É a distância da média amostral até cada extremo do intervalo.","E = z × desvio padrão / √n"),
     step("Intervalo IC",fmt(c.lo,2)+" a "+fmt(c.hi,2)+" "+c.unit,"Subtraia e some a margem da média, respeitando as unidades.","IC = média − E até média + E")
   ]};
   if(c.kind==="z")return {kind:"escore",data:c,steps:[
     step("Valor observado",fmt(c.v,2)+" "+c.unit,"É o caso individual que estamos analisando."),
     step("Média do grupo",fmt(c.mean,2)+" "+c.unit,"É o valor de referência do grupo."),
     step("Desvio padrão",fmt(c.sd,2)+" "+c.unit,"Diz o tamanho de um desvio típico nessa distribuição."),
     step("Diferença",fmt(c.v-c.mean,2)+" "+c.unit,"Subtraia média do valor observado. O sinal indica o lado da média.","valor − média"),
     step("Escore Z",fmt(c.z,2),"Divida a diferença pelo desvio padrão.","z = (valor − média) / desvio"),
     step("Interpretação",c.z>0?"Acima da média":c.z<0?"Abaixo da média":"Na média","Está "+fmt(Math.abs(c.z),2)+" desvio(s) da média. Ser diferente não significa ser ruim.","|z| indica a distância")
   ]};
   if(c.kind==="compareZ")return {kind:"escore",data:{...c,z:c.za},steps:[
     step("Grupo A","valor "+fmt(c.a[0],1),"Cada grupo tem média e desvio próprios."),
     step("Grupo B","valor "+fmt(c.b[0],1),"Não compare os valores absolutos antes de padronizar."),
     step("Z do grupo A",fmt(c.za,2),"Distância relativa do valor A até sua própria média.","z(A) = (A−média A)/desvio A"),
     step("Z do grupo B",fmt(c.zb,2),"Distância relativa do valor B até sua própria média.","z(B) = (B−média B)/desvio B"),
     step("Comparar Z",fmt(c.za,2)+" × "+fmt(c.zb,2),"Compare os escores, porque ambos estão em unidades de desvio padrão."),
     step("Conclusão",c.za===c.zb?"Empate":c.za>c.zb?"Grupo A":"Grupo B","Quem obteve o maior escore se destacou relativamente mais, se valores maiores são desejáveis.")
   ]};
   if(c.kind==="pearson")return {kind:"correlacao",data:c,steps:[
     step("Variável X","Coluna X","Identifique a primeira grandeza numérica, como usuários ativos."),
     step("Variável Y","Coluna Y","Identifique a segunda grandeza numérica, como tempo de resposta."),
     step("Pares (X,Y)",fmt(c.pairs.length,0)+" pares","Cada X precisa estar associado ao Y da mesma observação."),
     step("Dispersão","Gráfico","Veja os pontos: sobem juntos, descem ou se espalham?"),
     step("Coeficiente r",fmt(c.r,3),"O número entre −1 e +1 resume direção e força da associação linear.","r de Pearson"),
     step("Interpretação",c.r<0?"Negativa":c.r>0?"Positiva":"Sem sinal","O sinal mostra o sentido, enquanto |r| mostra a intensidade. Associação não é causalidade.")
   ]};
   if(c.kind==="regression")return {kind:"regressao",data:c,steps:[
     step("X conhecido","Valor de entrada","Identifique qual variável é conhecida e pode servir de entrada."),
     step("Y desejado","Previsão","O enunciado quer ESTIMAR uma resposta, não medir apenas a relação."),
     step("Inclinação a",fmt(c.a,4),"Quanto Y tende a mudar quando X aumenta uma unidade."),
     step("Intercepto b",fmt(c.b,3),"Valor previsto de Y quando X = 0; nem sempre é interpretável no mundo real."),
     step("Substituir X",fmt(c.target,0),"Troque X pelo número pedido. Evite extrapolações distantes dos dados."),
     step("Y previsto",fmt(c.pred,2),"Resultado esperado da reta para o X escolhido.","y = "+fmt(c.a,4)+" × "+fmt(c.target,0)+" + ("+fmt(c.b,3)+")")
   ]};
   return {kind:"concept",data:c,steps:(q.path||[]).map(name=>step(name,"→","Interprete as pistas da questão."))};
 };
 const txt=(x,y,v,sz=14,fill="#e7c5bf",extra="")=>'<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-size="'+sz+'" font-family="Georgia,serif" '+extra+'>'+esc(v)+'</text>';
 function plotPairs(c,reg,selected){
   const pairs=c.pairs||[],minX=Math.min(...pairs.map(p=>p[0]),reg?c.target:Infinity),maxX=Math.max(...pairs.map(p=>p[0]),reg?c.target:-Infinity);
   const minY=Math.min(...pairs.map(p=>p[1]),reg?c.pred:Infinity),maxY=Math.max(...pairs.map(p=>p[1]),reg?c.pred:-Infinity);
   const px=x=>47+466*(x-minX)/(maxX-minX||1),py=y=>172-118*(y-minY)/(maxY-minY||1);
   const dots=pairs.map(([x,y])=>'<circle cx="'+px(x).toFixed(1)+'" cy="'+py(y).toFixed(1)+'" r="'+(pairs.length>18?3.4:5)+'" fill="#f36d80" stroke="#ffd3bb" stroke-width="1"/>').join("");
   let line="";
   if(reg&&selected>=2){
     const y0=c.a*minX+c.b,y1=c.a*maxX+c.b;
     line='<path d="M'+px(minX).toFixed(1)+' '+py(y0).toFixed(1)+' L'+px(maxX).toFixed(1)+' '+py(y1).toFixed(1)+'" stroke="#ecd09d" stroke-width="2.5" stroke-dasharray="6 4"/>';
   }
   if(reg&&selected>=4){
     const xp=px(c.target).toFixed(1),yp=py(c.pred).toFixed(1);
     line+='<path d="M'+xp+' '+yp+' V173 M47 '+yp+' H'+xp+'" stroke="#86e8b5" stroke-dasharray="4 5" stroke-width="2"/><circle cx="'+xp+'" cy="'+yp+'" r="8" fill="#83efb6" stroke="#fff" stroke-width="2"/>';
   }
   return '<path d="M40 26V178H531" stroke="#917787" stroke-width="2" fill="none"/>'+line+dots+
     txt(521,198,"X",12)+txt(27,26,"Y",12)+(selected>=4?txt(64,26,reg?"Y previsto: "+fmt(c.pred,2):"r = "+fmt(c.r,3),16,"#a2ffd1"):"");
 }
 function sceneSvg(kind,data,selected,stepCount){
   const c=data||{},highlight=selected>=stepCount-2;
   let body="";
   if(kind==="correlacao"||kind==="regressao")body=plotPairs(c,kind==="regressao",selected);
   else if(kind==="proporcao"){
     const r=Math.max(0,Math.min(1,c.p||0)),arc=(2*Math.PI*63);
     body='<circle cx="133" cy="105" r="63" fill="none" stroke="#483441" stroke-width="24"/>'+
       '<circle cx="133" cy="105" r="63" fill="none" stroke="#f45c72" stroke-width="24" stroke-dasharray="'+(r*arc).toFixed(1)+' '+arc.toFixed(1)+'" transform="rotate(-90 133 105)"/>'+
       txt(133,110,pct(r,1),25,"#fff0ec",'text-anchor="middle"')+txt(133,130,"na amostra",12,"#c8a6a3",'text-anchor="middle"')+
       txt(263,61,"Proporção observada",15,"#e9c5b2")+
       '<path d="M263 143H521" stroke="#654252" stroke-width="13" stroke-linecap="round"/>'+
       '<rect x="'+(263+258*Math.max(0,c.lo||0)).toFixed(1)+'" y="137" width="'+Math.max(2,258*((c.hi||0)-(c.lo||0))).toFixed(1)+'" height="12" fill="#90dfb9" rx="6" opacity="'+(highlight?1:.35)+'"/>'+
       '<circle cx="'+(263+258*r).toFixed(1)+'" cy="143" r="7" fill="#f8baae"/>'+
       txt(263,175,highlight?pct(c.lo,1):"Limite − E",13,highlight?"#9effcd":"#d3b0a8")+
       txt(526,175,highlight?pct(c.hi,1):"Limite + E",13,highlight?"#9effcd":"#d3b0a8",'text-anchor="end"');
   }
   else if(kind==="media"){
     const x0=63,x1=517,center=290,half=135;
     body='<path d="M'+x0+' 122H'+x1+'" stroke="#866b7c" stroke-width="3"/>'+
       '<rect x="'+(center-half)+'" y="97" width="'+(2*half)+'" height="50" rx="11" fill="#83324d77" stroke="#e88e9b" opacity="'+(highlight?1:.4)+'"/>'+
       '<path d="M'+(center-half)+' 81V155 M'+(center+half)+' 81V155" stroke="#ffbc9e" stroke-width="3"/>'+
       '<circle cx="'+center+'" cy="122" r="11" fill="#f25268" stroke="#fbe0d5" stroke-width="3"/>'+
       txt(center,65,"média = "+fmt(c.mean,2),19,"#fff0e9",'text-anchor="middle"')+
       txt(center-half,177,highlight?fmt(c.lo,2):"− margem",14,"#99f3c7",'text-anchor="middle"')+
       txt(center+half,177,highlight?fmt(c.hi,2):"+ margem",14,"#99f3c7",'text-anchor="middle"')+
       txt(center,201,highlight?"Limites do intervalo de confiança":"A margem abre o corredor em torno da média",12,"#e5c2bc",'text-anchor="middle"');
   }
   else if(kind==="amostra"){
     const finalN=Math.max(1,c.n||100),barHeight=125,small=Math.max(28,barHeight/4);
     body='<path d="M80 178H510" stroke="#896c7a" stroke-width="2"/>'+
       '<rect x="139" y="'+(178-small)+'" width="112" height="'+small+'" rx="8" fill="#92445b"/>'+
       '<rect x="321" y="'+(178-barHeight)+'" width="112" height="'+barHeight+'" rx="8" fill="#e14e6b"/>'+
       txt(195,195,"Erro 2 × maior",13,"#e8c7c2",'text-anchor="middle"')+
       txt(377,195,"Erro exigido",13,"#e8c7c2",'text-anchor="middle"')+
       txt(195,178-small-12,"≈ "+fmt(finalN/4,0),17,"#dbc2bb",'text-anchor="middle"')+
       txt(377,178-barHeight-12,selected>=4?fmt(finalN,0):"n = ?",20,selected>=4?"#99f3c7":"#ffe0d5",'text-anchor="middle"')+
       txt(280,24,"Metade da margem exige cerca de 4 vezes mais dados",13,"#e6b5b5",'text-anchor="middle"');
   }
   else if(kind==="escore"){
     let path=[],max=130;
     for(let i=0;i<=120;i++){const z=-3.4+i*6.8/120,x=42+i*496/120,y=171-max*Math.exp(-z*z/2);path.push((i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1))}
     const vx=42+496*(Math.max(-3.4,Math.min(3.4,c.z||0))+3.4)/6.8;
     body='<path d="M35 172H545" stroke="#8f7080" stroke-width="2"/>'+
       '<path d="'+path.join(" ")+'" stroke="#ff9cad" stroke-width="3.5" fill="none"/>'+
       '<path d="M'+vx.toFixed(1)+' 35V174" stroke="#8ee7b7" stroke-width="2.5" stroke-dasharray="6 4"/>'+
       '<circle cx="'+vx.toFixed(1)+'" cy="174" r="6" fill="#93f6bd"/>'+
       txt(290,193,"z = 0",13,"#eee0d9",'text-anchor="middle"')+
       txt(44,193,"−3",13)+txt(520,193,"+3",13)+
       txt(290,25,selected>=4?"z = "+fmt(c.z||0,2):"Qual a distância da média?",17,selected>=4?"#9df2bf":"#ffe5dc",'text-anchor="middle"');
   }
   else{
     const labels=["O que pede?","Dados do enunciado","Método","Conclusão"];
     body=labels.map((label,i)=>'<rect x="'+(16+i*142)+'" y="74" width="127" height="69" rx="11" fill="'+(selected===i?"#205943":"#31252f")+'" stroke="'+(selected===i?"#77e7b0":"#835164")+'"/>'+txt(79+i*142,108,label,12,"#f8e9df",'text-anchor="middle"')).join("");
   }
   return '<svg class="calc-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 220" role="img" aria-label="Gráfico estatístico interativo da etapa '+(selected+1)+'">'+body+'</svg>';
 }
 function render(topicId,q,currentStep=0){
   const built=stepsFor(topicId,q),steps=built.steps;
   if(!steps.length)return "";
   const selected=Math.max(0,Math.min(currentStep,steps.length-1)),current=steps[selected];
   const headers=steps.map((s,i)=>{
     const status=i===selected?"is-current":i<selected?"is-done":"is-ahead";
     return '<button class="calc-node '+status+'" type="button" data-action="calc-step" data-step="'+i+'" aria-pressed="'+(i===selected)+'" aria-label="Etapa '+(i+1)+": "+esc(s.label)+'"><span class="calc-node-label">'+esc(s.label)+'</span><span class="calc-node-value">'+(i<=selected?esc(s.value):"—")+'</span></button>';
   }).join('<span class="calc-connector" aria-hidden="true"><i></i></span>');
   return '<section class="calculation-lab" aria-label="Fluxo do cálculo"><div class="calc-top"><div><p class="eyebrow">ACOMPANHAMENTO</p><h3>Fluxo do cálculo</h3></div><span class="calc-status">Etapa '+(selected+1)+' de '+steps.length+'</span></div>'+
     '<div class="calc-scroll" tabindex="0" aria-label="Etapas do cálculo, deslize para os lados"><div class="calc-sequence">'+headers+'</div></div>'+
     '<p class="calc-hint">Toque em qualquer bloco para entender aquela parte. O verde mostra a etapa atual.</p>'+
     '<div class="calc-content"><div class="calc-detail"><span class="calc-step-tag">'+(selected+1)+' / '+steps.length+'</span><h4>'+esc(current.label)+'</h4><strong class="calc-highlight">'+esc(current.value)+'</strong><p>'+esc(current.detail)+'</p>'+
     (current.math?'<div class="calc-math">'+esc(current.math)+'</div>':"")+
     '<div class="calc-actions"><button type="button" class="btn btn-quiet" data-action="calc-step" data-step="'+Math.max(0,selected-1)+'" '+(selected===0?"disabled":"")+'>‹ Voltar</button><button type="button" class="btn btn-primary" data-action="calc-step" data-step="'+Math.min(steps.length-1,selected+1)+'" '+(selected===steps.length-1?"disabled":"")+'>Próxima etapa ›</button></div></div>'+
     '<div class="calc-chart">'+sceneSvg(built.kind,built.data,selected,steps.length)+'</div></div></section>';
 }
 window.DUO_FLOW={stepsFor,render,sceneSvg};
})();
