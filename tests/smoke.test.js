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
  const source=read("js/app.js").replace(/render\(\);\s*\}\)\(\);\s*$/,"window.__test={buildQuestion,go,answer,prepareLesson,begin,nextQuestion,getState:()=>state,root};render();})();");
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
test("lição ensina, mostra feedback e libera etapa concluída",()=>{
  const {debug,app}=makeApp();
  debug.prepareLesson("corr",0);
  assert.match(app.innerHTML,/O que é\?/);
  debug.begin();
  assert.match(app.innerHTML,/question-prompt/);
  for(let i=0;i<2;i++){debug.answer(0);assert.match(app.innerHTML,/Fluxograma deste exercício/);debug.nextQuestion();}
  assert.match(app.innerHTML,/ETAPA CONCLUÍDA/);
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
