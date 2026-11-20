/**
 * Testes sem dependências externas.
 * Execute: node --test tests/smoke.test.js
 *
 * O navegador é simulado apenas no necessário: os cálculos e a lógica
 * de progressão são os mesmos executados no site real.
 */
"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
function makeApp(){
  const listeners={};
  const app={innerHTML:"",querySelector(){return null}};
  const store=new Map();
  const window={scrollTo(){},confirm(){return true},matchMedia(){return {matches:false}}};
  const document={body:{classList:{toggle(){}}},getElementById(id){return id==="app"?app:null},querySelectorAll(){return []},addEventListener(name,fn){listeners[name]=fn}};
  const localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
  const sandbox={window,document,localStorage,console,Math};
  vm.runInNewContext(read("js/dados.js"),sandbox,{filename:"dados.js"});
  vm.runInNewContext(read("js/excel.js"),sandbox,{filename:"excel.js"});
  vm.runInNewContext(read("js/conceitos.js"),sandbox,{filename:"conceitos.js"});
  vm.runInNewContext(read("js/ajuda.js"),sandbox,{filename:"ajuda.js"});
  vm.runInNewContext(read("js/guiado.js"),sandbox,{filename:"guiado.js"});
  vm.runInNewContext(read("js/fluxo.js"),sandbox,{filename:"fluxo.js"});
  const source=read("js/app.js").replace(/render\(\);\s*\}\)\(\);\s*$/,"window.__test={buildQuestion,makeFallback,go,answer,prepareLesson,begin,nextQuestion,startGuided,startGuidedTopic,startInfinite,submitGuided,advanceGuided,getGuided:()=>guidedSession,getState:()=>state,root};render();})();");
  assert.match(source,/window\.__test/,"Não foi possível montar o teste de integração");
  vm.runInNewContext(source,sandbox,{filename:"app.js"});
  return {window,app,storage:store,debug:window.__test,listeners};
}
test("seis temas, 24 casas e página inicial visível",()=>{
  const {window,app}=makeApp();
  assert.equal(window.STUDY_DATA.topics.length,6);
  assert.equal(window.STUDY_DATA.topics.reduce((n,t)=>n+t.stages.length,0),24);
  assert.equal(window.STUDY_DATA.questions.length,53);
  assert.match(app.innerHTML,/Domine a/);
  assert.equal((app.innerHTML.match(/data-action="stage"/g)||[]).length,24);
});
test("todo exercício apresenta quatro alternativas únicas, gabarito válido e explicação",()=>{
  const {window,debug}=makeApp();
  const state=debug.getState();
  for(const mode of ["real","random"]){
    state.settings.values=mode;
    for(const seed of window.STUDY_DATA.questions){
      for(let k=0;k<5;k++){
        const q=debug.buildQuestion(seed);
        assert.equal(q.opts.length,4,seed.kind+" "+mode);
        assert.equal(new Set(q.opts).size,4,seed.kind+" "+mode);
        assert.ok(Number.isInteger(q.right)&&q.right>=0&&q.right<4);
        assert.ok(q.why.length>10);
        assert.equal(q.path.length,4);
        assert.doesNotMatch(q.opts.join(" ")+" "+q.why,/NaN|Infinity/);
      }
    }
  }
});
test("modo aleatório mantém número da pergunta coerente com dados alterados",()=>{
  const {window,debug}=makeApp();
  debug.getState().settings.values="random";
  for(const seed of window.STUDY_DATA.questions.filter(x=>["z","mean","prop","sampleMean","sampleProp","regression","compareZ"].includes(x.kind))){
    const q=debug.buildQuestion(seed);
    assert.ok(q.context?.length>15);
    assert.ok(q.prompt?.length>10);
    if(seed.kind==="z")assert.match(q.prompt,/números mostrados/);
  }
});
test("lição guia cada decisão, destaca valores e libera a etapa",()=>{
  const {debug,app}=makeApp();
  debug.prepareLesson("corr",0);
  assert.match(app.innerHTML,/O que é\?/);
  debug.begin();
  assert.match(app.innerHTML,/Tradução do enunciado/);
  const session=debug.getGuided();
  assert.ok(session.model.steps.length>=4);
  for(let i=0;i<session.model.steps.length;i++){
    const g=debug.getGuided();
    debug.submitGuided(g.model.steps[g.index].right);
    assert.match(app.innerHTML,/Correto\./);
    debug.advanceGuided();
  }
  assert.match(app.innerHTML,/EXERCÍCIO CONCLUÍDO/);
  assert.equal(debug.getState().progress.corr,1);
  assert.ok(debug.getState().xp>0);
});
test("biblioteca, treino infinito e configurações navegam",()=>{
  const {debug,app}=makeApp();
  debug.go("biblioteca");assert.match(app.innerHTML,/Biblioteca de conceitos/);
  debug.go("infinito");assert.match(app.innerHTML,/O ritual infinito/);
  debug.go("configuracoes");assert.match(app.innerHTML,/Dados reais/);
});

test("explicação em português claro aparece em todos os temas e nas duas telas",()=>{
  const {window,debug,app}=makeApp();
  for(const t of window.STUDY_DATA.topics){
    assert.ok(t.plain?.startsWith("Serve pra calcular"),"Texto de português claro ausente em "+t.id);
    assert.match(t.plain,/É usado quando o exercício mete o louco/);
    debug.getState().progress[t.id]=0;
    debug.prepareLesson(t.id,0);
    assert.match(app.innerHTML,/Pra que serve \(no português claro\)\?/);
    assert.match(app.innerHTML,/Serve pra calcular/);
    debug.getState().libraryTopic=t.id;
    debug.go("biblioteca");
    assert.match(app.innerHTML,/Pra que serve \(no português claro\)\?/);
  }
});


test("ordem de prioridade preserva os temas e o progresso por ID",()=>{
  const {window,debug,app}=makeApp();
  const expected=["amostra","prop","media","corr","reg","z"];
  assert.deepEqual(Array.from(window.STUDY_DATA.topics,t=>t.id),expected);
  assert.match(app.innerHTML,/Prioridade 1 · 10 de novembro/);
  debug.getState().progress.corr=2;
  debug.go("trilha");
  assert.equal(debug.getState().progress.corr,2);
});
test("cada cálculo real e aleatório oferece fluxo e SVG com resultado coerente",()=>{
  const {window,debug}=makeApp();
  const data=window.STUDY_DATA;
  for(const mode of ["real","random"]){
    debug.getState().settings.values=mode;
    for(const seed of data.questions){
      const q=debug.buildQuestion(seed);
      assert.doesNotMatch(q.opts.join(" "),/NaN|Infinity/);
      const flow=window.DUO_FLOW.stepsFor(seed.t,q);
      assert.ok(flow.steps.length>=3,seed.t+" "+seed.kind);
      assert.ok(flow.steps.every(step=>step.label&&step.detail),seed.kind);
      const html=window.DUO_FLOW.render(seed.t,q,0);
      assert.match(html,/Fluxo do cálculo/);
      assert.match(html,/data-action="calc-step"/);
      assert.match(html,/<svg /);
      if(q.calc){
        assert.equal(flow.steps.at(-1).value.includes("NaN"),false,seed.kind);
      }
    }
  }
});
test("precache offline inclui todos os recursos reais e o modo instalável",()=>{
  const manifest=JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display,"standalone");
  assert.ok(manifest.icons.some(x=>x.src.endsWith(".svg")));
  const listeners={};
  const sandbox={self:{addEventListener:(name,cb)=>{listeners[name]=cb},location:{origin:"https://example.test"}}};
  vm.runInNewContext(read("sw.js")+"\nself.__filesToCache=OFFLINE_ASSETS;",sandbox,{filename:"sw.js"});
  const precache=Array.from(sandbox.self.__filesToCache);
  for(const item of precache){
    assert.ok(fs.existsSync(path.join(root,item)),item+" está no precache mas não no repositório");
  }
  assert.ok(precache.some(x=>x.endsWith("fluxo.js")));
  assert.ok(precache.some(x=>x.endsWith("offline.js")));
  assert.ok(precache.some(x=>x.endsWith("manifest.webmanifest")));
  assert.ok(listeners.install&&listeners.activate&&listeners.fetch);
});
test("biblioteca e lições exibem visualização conectada com cálculos",()=>{
  const {debug,app}=makeApp();
  debug.prepareLesson("amostra",0);
  assert.match(app.innerHTML,/Fluxo do cálculo/);
  assert.match(app.innerHTML,/Calcular quantas observações|Desvio padrão|Tamanho da amostra/);
  debug.go("biblioteca");
  assert.match(app.innerHTML,/calc-sequence/);
});


test("após instalar, abre a trilha sem internet pelo cache do service worker",async()=>{
  const listeners={};
  const saved=new Map();
  const base="https://duostatic-carmesim.pages.dev/";
  const cache={
    addAll:async entries=>{for(const item of entries)saved.set(new URL(item,base).href,new Response("guardado: "+item,{status:200}));},
    match:async req=>saved.get(typeof req==="string"?new URL(req,base).href:req.url),
    put:async(req,response)=>saved.set(req.url,response)
  };
  const sandbox={
    URL,Response,
    caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true},
    fetch:async()=>{throw Error("sem internet")},
    self:{location:{origin:new URL(base).origin},skipWaiting:async()=>{},clients:{claim:async()=>{}},addEventListener:(name,cb)=>{listeners[name]=cb}}
  };
  vm.runInNewContext(read("sw.js"),sandbox,{filename:"sw.js"});
  let installPromise;
  listeners.install({waitUntil:p=>{installPromise=p}});
  await installPromise;
  assert.ok(saved.has(base));
  let navigation;
  listeners.fetch({
    request:{method:"GET",url:base,mode:"navigate"},
    respondWith:p=>{navigation=p}
  });
  const result=await navigation;
  assert.equal(result.status,200);
  assert.match(await result.text(),/guardado/);
});

test("todas as partes dos arquivos Excel entram no banco com perguntas guiadas",()=>{
 const {window}=makeApp();
 const cases=window.EXCEL_CASES;
 assert.equal(cases.filter(c=>c.topic==="prop"&&!c.example).length,6);
 assert.equal(cases.filter(c=>c.topic==="media"&&!c.example).length,9);
 for(const suffix of ["1a","1b","1c","2a","2b","2c","3a","3b","4a","4b","4c","4d","4e","5a","5b","5c","6a","6b","6c","6d","6e","6f"]){
   assert.ok(cases.some(c=>c.id==="excel-corr-"+suffix),"Parte ausente "+suffix);
 }
 assert.equal(cases.length,41);
 for(const c of cases){
   for(const randomized of [false,true]){
     const m=window.DUO_GUIDED.build(c,randomized);
     assert.ok(m.steps.length>=4,c.id);
     assert.ok(m.translation.length>30,c.id);
     assert.ok(m.result&&m.meaning,c.id);
     for(const st of m.steps){
       assert.equal(st.options.length,4,c.id+" "+st.question);
       assert.equal(new Set(st.options).size,4,c.id+" "+st.question);
       assert.ok(st.options[st.right],c.id);
     }
   }
 }
});
test("erro permite tentar novamente sem mostrar a resposta; acerto destaca número",()=>{
 const {window,debug,app}=makeApp();
 debug.startGuided(window.EXCEL_CASES.find(c=>c.id==="excel-prop-1"),"excel");
 const initial=debug.getGuided();
 const wrong=(initial.model.steps[0].right+1)%4;
 debug.submitGuided(wrong);
 assert.match(app.innerHTML,/Não é essa/);
 assert.doesNotMatch(app.innerHTML,/guide-correct/);
 debug.submitGuided(initial.model.steps[0].right);
 assert.match(app.innerHTML,/Correto\./);
 debug.advanceGuided();
 const next=debug.getGuided();
 debug.submitGuided(next.model.steps[next.index].right);
 assert.match(app.innerHTML,/guide-reveal/);
 assert.match(app.innerHTML,/1000/);
});
test("amostra e escore Z também possuem resolução guiada",()=>{
 const {debug,app}=makeApp();
 for(const id of ["amostra","z"]){
   debug.prepareLesson(id,0);debug.begin();
   assert.match(app.innerHTML,/Tradução do enunciado/);
   assert.ok(debug.getGuided().model.steps.length>=6);
 }
});

test("enunciado encurta após o primeiro passo, pode expandir e mantém a marcação dos dados",()=>{
  const {window,debug,app}=makeApp();
  const original=window.EXCEL_CASES.find(c=>c.id==="excel-prop-1");
  debug.startGuided(original,"excel");
  assert.match(app.innerHTML,/guide-statement/);
  const g=debug.getGuided();
  debug.submitGuided(g.model.steps[0].right);
  debug.advanceGuided();
  assert.match(app.innerHTML,/guide-statement is-compact/);
  assert.match(app.innerHTML,/Ver enunciado completo/);
  debug.submitGuided(debug.getGuided().model.steps[1].right);
  assert.match(app.innerHTML,/guide-reveal/);
});
test("dados completos das duas planilhas podem ser consultados sem ocupar a tela por padrão",()=>{
  const {window,debug,app}=makeApp();
  debug.startGuided(window.EXCEL_CASES.find(c=>c.id==="excel-corr-4a"),"excel");
  assert.match(app.innerHTML,/30 registros/);
  assert.match(app.innerHTML,/<details class="guide-source-data">/);
  debug.startGuided(window.EXCEL_CASES.find(c=>c.id==="excel-tabela-1"),"excel");
  assert.match(app.innerHTML,/31 registros/);
});

test("cenários dos PDFs explicam quem age, por quê e o que quer descobrir",()=>{
  const {window,debug,app}=makeApp();
  const state=debug.getState();
  for(const tid of ["amostra","z"]){
    for(const mode of ["real","random"]){
      state.settings.values=mode;
      for(let n=0;n<50;n++){
        const item=debug.makeFallback(tid);
        assert.equal(item.reconstructed,true);
        assert.ok(item.statement.length>135,item.id);
        assert.match(item.statement,/equipe|instituto|técnico|serviço online/i);
        assert.match(item.statement,/média|médio|porcentagem|taxa|acessos|desvios/i);
        assert.doesNotMatch(item.statement,/Proporção anterior:|Valor observado:|desvio padrão conhecido:/i);
        const model=window.DUO_GUIDED.build(item,false);
        assert.ok(model.steps.length>=8,item.id);
        assert.ok(model.steps[0].guide,item.id);
        assert.ok(model.translation.length>35,item.id);
        for(const st of model.steps){
          assert.equal(st.options.length,4,item.id+": "+st.question);
          assert.equal(new Set(st.options).size,4,item.id+": "+st.question);
          assert.ok(st.options[st.right],item.id+": "+st.question);
        }
      }
    }
  }
  const item=debug.makeFallback("amostra");
  debug.startGuided(item,"lesson");
  assert.match(app.innerHTML,/Situação recriada|Exemplo adaptado/);
  assert.match(app.innerHTML,/guide-step-context/);
  assert.doesNotMatch(app.innerHTML,/Dados originais/);
});
test("contextualização abrange todos os 41 casos Excel sem apagar o enunciado original",()=>{
  const {window}=makeApp();
  const cases=window.EXCEL_CASES;
  assert.equal(cases.length,41);
  for(const c of cases){
    assert.ok(c.context && c.context.length>60,c.id);
    assert.ok(c.statement && c.statement.length>30,c.id);
    const model=window.DUO_GUIDED.build(c,false);
    assert.ok(model.translation.length>50,c.id);
  }
});

test("abas explicam os conceitos sem pressupor conhecimento e sem revelar a resposta",()=>{
  const {window,debug,app}=makeApp();
  const example={topic:"amostra",type:"sampleProp",title:"Pesquisa de opinião",source:"PDF Tamanho da Amostra",
    statement:"Uma pesquisa anterior encontrou 30% das pessoas com uma opinião; a nova pesquisa deseja uma margem de erro de 2% e confiança de 95%.",p:.30,err:.02,conf:95};
  const model=window.DUO_GUIDED.build(example,false);
  assert.ok(model.steps.length>=9);
  assert.ok(model.steps.some(s=>s.question.includes("RESTANTE")&&s.options[s.right]==="70%"));
  assert.ok(model.steps.some(s=>s.options[s.right].includes("30%")&&s.options[s.right].includes("70%")));
  assert.ok(model.steps.some(s=>s.why.includes("28%")&&s.why.includes("32%")));
  assert.ok(!model.steps.some(s=>s.question.includes("margem de erro os")));
  for(const st of model.steps){
    assert.equal(new Set(st.options).size,4,st.question);
    assert.doesNotMatch(st.question,/n = z|p = x|E =|z²/);
    assert.doesNotMatch(st.options.join(" "),/n = z|p = x|E =|z²/);
  }
  const html=window.DUO_PLAIN.glossary(model);
  assert.match(html,/O que é nível de confiança/);
  assert.match(html,/O que é margem de erro/);
  assert.match(html,/O que é uma pesquisa ou estudo/);
  assert.match(html,/30%/);
  assert.match(html,/70%/);
  assert.match(html,/svg/);
  debug.startGuided(example,"excel");
  assert.match(app.innerHTML,/guide-glossary/);
  assert.match(app.innerHTML,/guide-definition/);
});
test("o texto da margem acompanha os valores reais, não usa números de outro exercício",()=>{
  const {window}=makeApp();
  const item={topic:"amostra",type:"sampleProp",title:"Taxa de rejeição",source:"Treino",
    statement:"Um grupo testou um sistema.",p:.4,err:.04,conf:90};
  const model=window.DUO_GUIDED.build(item,false);
  const margin=model.steps.find(s=>s.question.includes("erro máximo permitido"));
  assert.ok(margin);
  assert.match(margin.question,/4 pontos percentuais/);
  assert.match(margin.why,/40%/);
  assert.match(margin.why,/36%/);
  assert.match(margin.why,/44%/);
});
test("fluxogramas e biblioteca evitam apresentar letras como fórmulas aos iniciantes",()=>{
 const {window,debug,app}=makeApp();
 const raw=window.STUDY_DATA.questions.find(q=>q.kind==="sampleProp");
 const model=debug.buildQuestion(raw);
 const html=window.DUO_FLOW.render("amostra",model,4);
 assert.match(html,/Fluxo do cálculo/);
 assert.doesNotMatch(html,/n = z²|E = z|p = casos/);
 debug.getState().libraryTopic="prop";
 debug.go("biblioteca");
 assert.match(app.innerHTML,/Como fazer a conta, em palavras/);
 assert.doesNotMatch(app.innerHTML,/Quando chegar a hora de calcular/);
});

test("erro padrão de 89 em 1000 é ensinado por números, sem p.p. corrompido",()=>{
 const {window,debug,app}=makeApp();
 const c=window.EXCEL_CASES.find(x=>x.id==="excel-prop-1");
 assert.ok(c);
 const model=window.DUO_GUIDED.build(c,false);
 const ix=model.steps.findIndex(s=>s.question.includes("Quanta variação costuma ocorrer"));
 assert.ok(ix>=0,"Exercício precisa da etapa de erro padrão");
 const current=model.steps[ix];
 assert.match(current.options[current.right],/^0,90 pontos percentuais$/);
 assert.doesNotMatch(current.options.join(" "),/proporção\.proporção|p\.p\./);
 const guide=window.DUO_HELP.help(model,current,ix);
 assert.match(guide,/89/);
 assert.match(guide,/1\.000/);
 assert.match(guide,/raiz quadrada/);
 assert.match(guide,/0,90 pontos percentuais/);
 assert.match(guide,/Ainda NÃO é a margem/);
 debug.startGuided(c,"excel");
 assert.match(app.innerHTML,/Como descobrir a resposta/);
 assert.match(app.innerHTML,/Consultar tabela de valores/);
 assert.match(app.innerHTML,/guide-solve/);
 assert.match(app.innerHTML,/guide-values/);
});
test("tabela de referência mostra 90, 95 e 99 por cento com a linha correta",()=>{
 const {window}=makeApp();
 const c=window.EXCEL_CASES.find(x=>x.id==="excel-prop-1");
 const model=window.DUO_GUIDED.build(c,false);
 const table=window.DUO_HELP.table(model);
 for(const value of ["90%","95%","99%","1,645","1,960","2,575",'class="guide-value-active"',"linha destacada"]) assert.ok(table.includes(value),value);
 for(const conf of [90,95,99]){
   const changed=window.DUO_GUIDED.build({...c,conf},false);
   const t=window.DUO_HELP.table(changed);
   assert.ok(t.includes('<tr class="guide-value-active" aria-current="true"><td>'+conf+'%</td>'),conf);
 }
});
test("todo passo das planilhas e exemplos numéricos fornece ajuda sob demanda",()=>{
 const {window}=makeApp();
 const inputs=[...window.EXCEL_CASES,
   {topic:"amostra",type:"sampleProp",title:"Pesquisa de opinião",p:.30,err:.02,conf:95,source:"Aula",statement:"Uma pesquisa encontrou 30% de intenção"},
   {topic:"amostra",type:"sampleMean",title:"Latência",sd:1250,err:100,conf:95,source:"Aula",statement:"API"},
   {topic:"z",type:"z",title:"Servidor lento",value:280,mean:200,sd:40,unit:"ms",source:"Aula",statement:"Servidor lento"}
 ];
 for(const item of inputs)for(const random of [false,true]){
   const model=window.DUO_GUIDED.build(item,random);
   for(let i=0;i<model.steps.length;i++){
     const st=model.steps[i],view=window.DUO_HELP.help(model,st,i);
     assert.match(view,/Como descobrir a resposta/);
     assert.match(view,/Resposta desta etapa/);
     assert.match(view,/<ol>/);
     assert.doesNotMatch(view,/NaN|Infinity|proporção\.proporção/);
     assert.ok(st.options[st.right],item.id||item.title);
   }
 }
});
