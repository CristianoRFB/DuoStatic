/* DuoStatic — instalação opcional e uso offline. Não precisa de conta. */
(function(){
 "use strict";
 let offlineReady=false;
 let installEvent=null;
 const swSupported=("serviceWorker" in navigator);
 const installed=()=>window.matchMedia?.("(display-mode: standalone)")?.matches===true || window.navigator.standalone===true;
 const online=()=>navigator.onLine!==false;
 function updateUI(){
   const badge=document.getElementById("offline-status");
   if(badge){
     badge.textContent=online()?(offlineReady?"● Offline pronto":"● Conectado"):"● Sem internet";
     badge.title=online()?
       (offlineReady?"Este aparelho já guardou as lições, desenhos e exercícios para uso sem internet.":"Conecte-se uma vez para preparar a versão offline.") :
       (offlineReady?"Use a trilha sem internet. O progresso fica salvo neste aparelho.":"O conteúdo pode não estar disponível: ainda não foi armazenado.");
     badge.classList.toggle("offline-ok",offlineReady);
     badge.classList.toggle("offline-now",!online());
   }
   const info=document.getElementById("offline-detail");
   if(info)info.textContent=
     !swSupported?"Este navegador não suporta o modo offline automático.":
     !online()&&offlineReady?"Você está sem internet, mas os exercícios e os materiais do jogo foram guardados neste dispositivo.":
     !online()?"O navegador está sem internet e ainda não confirmou o armazenamento completo dos arquivos.":
     offlineReady?"Pronto para estudar offline neste aparelho. O progresso fica neste navegador e não é sincronizado entre dispositivos.":
     "Abra o DuoStatic uma vez com internet. Ele está preparando as lições, imagens e gráficos para funcionar sem conexão.";
   const button=document.getElementById("install-duostatic");
   if(button){
     button.textContent=installed()?"Já instalado":"Instalar aplicativo";
     button.disabled=installed();
   }
 }
 async function install(){
   if(installed()){updateUI();return}
   const info=document.getElementById("offline-detail");
   if(installEvent){
     const ev=installEvent;installEvent=null;
     try{
       await ev.prompt();
       const choice=await ev.userChoice;
       if(info)info.textContent=choice?.outcome==="accepted"?
         "Instalação aceita. Depois de preparada, a versão offline ficará disponível.":
         "Instalação cancelada. Você ainda pode usar o modo offline pelo navegador.";
     }catch(e){if(info)info.textContent="Não foi possível iniciar a instalação automática. Use a opção 'Instalar aplicativo' ou 'Adicionar à tela inicial' no menu do navegador."}
   }else if(info){
     info.textContent="Para instalar: no Chrome, abra o menu ⋮ e escolha 'Instalar aplicativo' ou 'Adicionar à tela inicial'. No Safari do iPhone, use Compartilhar → Adicionar à Tela de Início. O estudo offline também funciona sem instalar.";
   }
 }
 window.DUO_OFFLINE={install,updateUI};
 window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installEvent=event;updateUI()});
 window.addEventListener("appinstalled",()=>{installEvent=null;updateUI()});
 window.addEventListener("online",updateUI);
 window.addEventListener("offline",updateUI);
 updateUI();
 if(swSupported){
   navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"})
    .then(registration=>navigator.serviceWorker.ready.then(async()=>{
      offlineReady=true;
      updateUI();
      // Atualizações de conteúdo não alteram o progresso local.
      try{await registration.update()}catch(_){}
    }))
    .catch(err=>{
      console.warn("Modo offline indisponível neste acesso:",err);
      const info=document.getElementById("offline-detail");
      if(info)info.textContent="Não foi possível armazenar o site para uso offline. Verifique a conexão e recarregue a página.";
      updateUI();
    });
 }
})();
