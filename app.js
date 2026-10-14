(()=>{'use strict';
const KEY='agrocontrol_demo_v2';
const seed={
  machines:[
    {id:1,name:'John Deere 6155J',type:'Trator',code:'TR-001',year:2022,hours:2480,status:'Ativa'},
    {id:2,name:'Case IH Axial-Flow 7250',type:'Colheitadeira',code:'CO-002',year:2021,hours:1820,status:'Ativa'},
    {id:3,name:'Jacto Uniport 3030',type:'Pulverizador',code:'PU-003',year:2020,hours:3190,status:'Manutenção'},
    {id:4,name:'Volvo VM 270',type:'Caminhão',code:'CA-004',year:2019,hours:4360,status:'Ativa'},
    {id:5,name:'New Holland T7.245',type:'Trator',code:'TR-005',year:2023,hours:990,status:'Ativa'}
  ],
  expenses:[
    {id:11,machineId:1,category:'Combustível',amount:2300,date:'2026-10-03',note:'Abastecimento'},
    {id:12,machineId:2,category:'Peças',amount:4200,date:'2026-10-05',note:'Conjunto de filtros'},
    {id:13,machineId:3,category:'Manutenção',amount:1950,date:'2026-10-08',note:'Reparo preventivo'},
    {id:14,machineId:4,category:'Combustível',amount:1780,date:'2026-10-09',note:'Diesel'},
    {id:15,machineId:5,category:'Peças',amount:830,date:'2026-10-10',note:'Peças diversas'},
    {id:16,machineId:1,category:'Manutenção',amount:620,date:'2026-10-12',note:'Troca de óleo'}
  ],
  maintenance:[
    {id:21,machineId:3,description:'Revisão do sistema hidráulico',due:'2026-10-12',status:'Pendente'},
    {id:22,machineId:2,description:'Troca de filtros',due:'2026-10-20',status:'Pendente'},
    {id:23,machineId:1,description:'Revisão de 2.500 horas',due:'2026-10-25',status:'Pendente'},
    {id:24,machineId:4,description:'Inspeção de freios',due:'2026-09-30',status:'Concluída'}
  ]
};
let state=load(),page='machines',query='',formType='',editing=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date=s=>s?new Date(s+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const today=()=>new Date().toISOString().slice(0,10);
const titleMap={dashboard:'Visão geral',machines:'Máquinas',expenses:'Despesas',maintenance:'Manutenções',reports:'Relatórios'};
const subtMap={dashboard:'Acompanhe indicadores da operação, custos e prioridades do dia.',machines:'Gerencie sua frota agrícola e o histórico de equipamentos.',expenses:'Registre e acompanhe os custos da sua operação.',maintenance:'Organize serviços, revisões e manutenções preventivas.',reports:'Indicadores consolidados para auxiliar suas decisões.'};
const heroBtnMap={dashboard:['Nova despesa','expense'],machines:['Cadastrar máquina','machine'],expenses:['Registrar despesa','expense'],maintenance:['Nova manutenção','maintenance'],reports:['Exportar CSV','csv']};

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&Array.isArray(x.machines)&&Array.isArray(x.expenses)&&Array.isArray(x.maintenance)?x:structuredClone(seed)}catch{return structuredClone(seed)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
const nameOf=id=>state.machines.find(m=>m.id===Number(id))?.name||'Equipamento removido';
const machineOf=id=>state.machines.find(m=>m.id===Number(id));
const total=()=>state.expenses.reduce((s,e)=>s+Number(e.amount),0);
const pending=()=>state.maintenance.filter(m=>m.status==='Pendente').length;
const active=()=>state.machines.filter(m=>m.status==='Ativa').length;
const costByMachine=id=>state.expenses.filter(e=>e.machineId===id).reduce((s,e)=>s+Number(e.amount),0);

const thumbMap={
  'TR-001':'assets/jd6155j.png',
  'CO-002':'assets/caseih7250.png',
  'PU-003':'assets/jacto3030.png',
  'CA-004':'assets/volvo270.png',
  'TR-005':'assets/newholland7245.png'
};

const iconMap={
  dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h4v7H4zM10 4h4v16h-4zM16 9h4v11h-4z"/></svg>`,
  tractor:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17" cy="16.5" r="3.5"/><path d="M10 17h3m-4-9h3l2 4h4l2 3M9 8V5h5"/></svg>`,
  wallet:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z"/><path d="M4 8h14a2 2 0 0 1 2 2v1h-5a2 2 0 1 0 0 4h5v1a2 2 0 0 1-2 2H4"/></svg>`,
  wrench:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0 3.9 5.1L10 20 4 14l8.6-8.6a4 4 0 0 0 2.1.9Z"/><path d="M20 4l-3 3"/></svg>`,
  chart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-4"/></svg>`,
  leaf:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12c0-5 5-8 14-8-1 9-4 14-9 14-3.3 0-5-2.1-5-6Z"/><path d="M8 14c2-1 4.5-3.5 7-7"/></svg>`,
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v4M17 3v4M4 9h16"/><rect x="4" y="5" width="16" height="16" rx="2"/></svg>`,
  'chevron-down':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>`,
  filter:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16l-6 7v5l-4 2v-7z"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="m12 6 4 4"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/></svg>`,
  close:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  print:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V4h10v4"/><rect x="5" y="12" width="14" height="7" rx="2"/><path d="M7 19h10v2H7z"/></svg>`,
  export:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>`,
  menu:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  sort:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7 4-4 4 4"/><path d="m16 17-4 4-4-4"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>`,
  grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`
};
const icon=(name,cls='')=>`<span class="${cls}">${iconMap[name]||''}</span>`;

function installStaticIcons(){
  $$('[data-icon]').forEach(el=>{const name=el.getAttribute('data-icon');el.innerHTML=iconMap[name]||''});
}
function pageHero(){
  const [label,action]=heroBtnMap[page];
  let btn='';
  if(page==='reports') btn=`<button class="btn btn-primary" id="exportCSV">${icon('export','icon-left')}${label}</button>`;
  else btn=`<button class="btn btn-primary" data-add="${action}">${icon('plus','icon-left')}${label}</button>`;
  return `<section class="hero"><div class="hero-art"></div><div class="hero-row"><div class="hero-copy"><div class="eyebrow">AGROCONTROL / ${escapeHtml(titleMap[page]).toUpperCase()}</div><h1>${escapeHtml(titleMap[page])}</h1><p>${escapeHtml(subtMap[page])}</p></div>${btn}</div></section>`;
}
function metric(label,value,iconName,foot){
  return `<div class="card metric"><div class="metric-head"><div class="metric-main"><div class="metric-badge">${icon(iconName)}</div><div><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div></div><div class="metric-go">${icon('arrow')}</div></div></div>`;
}
function statusTag(label){
  const cls=label==='Ativa'||label==='Concluída'?'good':label==='Manutenção'?'warn':label==='Pendente'?'bad':'info';
  return `<span class="tag ${cls}">${escapeHtml(label)}</span>`;
}
function th(label,sortable=true){return `<th>${label}${sortable?icon('sort','sort-icon'):''}</th>`}
function table(heads,rows,extraClass=''){return `<div class="table-wrap"><table class="data-table ${extraClass}"><thead><tr>${heads.join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${heads.length}" class="empty">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`}
function actionButtons(type,id){
  return `<div class="actions"><button class="small-action" data-edit="${type}:${id}">${icon('edit')}Editar</button><button class="small-action danger" data-delete="${type}:${id}">${icon('trash')}Excluir</button></div>`;
}
function machineCell(m){
  const src=thumbMap[m.code]||thumbMap['TR-001'];
  return `<td><div class="item-cell"><div class="machine-thumb"><img src="${src}" alt="${escapeHtml(m.name)}"></div><div><strong>${escapeHtml(m.name)}</strong><span class="sub">${escapeHtml(m.code)}</span></div></div></td>`;
}
function rowMachine(m){return `<tr>${machineCell(m)}<td>${escapeHtml(m.type)}</td><td>${escapeHtml(m.year)}</td><td>${Number(m.hours).toLocaleString('pt-BR')} h</td><td>${statusTag(m.status)}</td><td>${actionButtons('machine',m.id)}</td></tr>`}
function rowExpense(e){return `<tr>${machineCell(machineOf(e.machineId)||{name:nameOf(e.machineId),type:'Trator',code:'--'})}<td>${escapeHtml(e.category)}</td><td>${date(e.date)}</td><td><strong>${money(e.amount)}</strong></td><td>${actionButtons('expense',e.id)}</td></tr>`}
function rowMaintenance(m){return `<tr>${machineCell(machineOf(m.machineId)||{name:nameOf(m.machineId),type:'Trator',code:'--'})}<td>${escapeHtml(m.description)}</td><td>${date(m.due)}</td><td>${statusTag(m.status)}</td><td>${actionButtons('maintenance',m.id)}</td></tr>`}
function searchTools(ph){return `<div class="panel-tools"><div class="search-wrap">${icon('search')}<input class="search" id="search" placeholder="${escapeHtml(ph)}" value="${escapeHtml(query)}"></div><button class="filter-btn" type="button">${icon('filter')}Filtrar${icon('chevron-down','chev')}</button></div>`}
function panelTitle(iconName,title,sub){return `<div class="panel-title"><div class="metric-badge">${icon(iconName)}</div><div><h2>${title}</h2><p>${sub}</p></div></div>`}

function dashboard(){
  const categories=['Combustível','Peças','Manutenção','Outros'];
  const colors=['#1e7b55','#72b689','#b3d8b8','#eadb9a'];
  const sums=categories.map(c=>state.expenses.filter(e=>e.category===c).reduce((s,e)=>s+Number(e.amount),0));
  const grand=total();
  let start=0;
  const gradient=sums.map((v,i)=>{let a=start;start+=grand?v/grand*100:0;return `${colors[i]} ${a}% ${start}%`}).join(',');
  const perMachine=state.machines.map(m=>({name:m.code,val:costByMachine(m.id)}));
  const max=Math.max(1,...perMachine.map(x=>x.val));
  const pendingList=state.maintenance.filter(m=>m.status==='Pendente').sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
  return `${pageHero()}<section class="page-shell"><div class="cards">${metric('Máquinas cadastradas',state.machines.length,'tractor','Equipamentos na operação')}${metric('Despesas registradas',money(grand),'wallet','Total do histórico demonstrativo')}${metric('Manutenções pendentes',pending(),'wrench','Revisões a acompanhar')}${metric('Máquinas operacionais',active(),'leaf','Status ativo')}</div><div class="grid-main"><section class="panel"><div class="panel-head">${panelTitle('chart','Custos por equipamento','Distribuição das despesas registradas')}<span class="mini-label">DADOS DO DEMO</span></div><div class="chart-area">${perMachine.map(x=>`<div class="bar-col"><div class="bar" style="height:${Math.max(2,Math.round(x.val/max*90))}%" data-tip="${money(x.val)}"></div><span class="bar-label">${escapeHtml(x.name)}</span></div>`).join('')}</div><div class="chart-summary">Total de despesas registradas: <strong>${money(grand)}</strong></div></section><section class="panel"><div class="panel-head">${panelTitle('grid','Despesas por categoria','Composição geral dos custos')}</div><div class="donut-row"><div class="donut" style="background:conic-gradient(${grand?gradient:'#edf1ee 0% 100%'})"><div class="donut-center"><div><strong>${grand?'100%':'0%'}</strong><small>DISTRIBUIÇÃO</small></div></div></div><div class="legend">${categories.map((c,i)=>`<div class="legend-item"><span class="dot" style="background:${colors[i]}"></span>${c}<b>${grand?Math.round(sums[i]/grand*100):0}%</b></div>`).join('')}</div></div></section></div><div class="grid-main"><section class="panel"><div class="panel-head">${panelTitle('tractor','Frota em destaque','Equipamentos acompanhados na operação')}<button class="btn btn-soft btn-inline" data-goto="machines">Ver todas</button></div>${table([th('Equipamento'),th('Tipo'),th('Ano'),th('Horas'),th('Situação'),th('Ações',false)],state.machines.slice(0,4).map(rowMachine))}</section><section class="panel"><div class="panel-head">${panelTitle('clock','Próximas manutenções','Atividades que precisam de atenção')}</div><div class="alert-list">${pendingList.length?pendingList.map(m=>`<div class="alert"><div class="alert-icon">${icon('wrench')}</div><div><b>${escapeHtml(nameOf(m.machineId))}</b><small>${escapeHtml(m.description)}</small></div><span class="right">${date(m.due)}</span></div>`).join(''):`<div class="empty">Nenhuma manutenção pendente.</div>`}</div></section></div></section>`;
}
function machines(){
  const arr=state.machines.filter(m=>(m.name+' '+m.type+' '+m.code).toLowerCase().includes(query.toLowerCase()));
  return `${pageHero()}<section class="page-shell"><div class="cards">${metric('Total de equipamentos',state.machines.length,'tractor','Cadastrados')}${metric('Em operação',active(),'leaf','Status ativa')}${metric('Em manutenção',state.machines.filter(m=>m.status==='Manutenção').length,'wrench','Status manutenção')}${metric('Tipos de máquinas',new Set(state.machines.map(m=>m.type)).size,'grid','Categorias na frota')}</div><section class="panel"><div class="panel-head">${panelTitle('wallet','Frota cadastrada','Gerencie os equipamentos da propriedade.')} ${searchTools('Buscar por nome, tipo ou identificação...')}</div>${table([th('Equipamento'),th('Tipo'),th('Ano'),th('Horas'),th('Situação'),th('Ações',false)],arr.map(rowMachine))}</section></section>`;
}
function expenses(){
  const arr=state.expenses.filter(e=>(nameOf(e.machineId)+' '+e.category+' '+e.note).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
  return `${pageHero()}<section class="page-shell"><div class="cards">${metric('Total registrado',money(total()),'wallet','Todas as despesas')}${metric('Lançamentos',state.expenses.length,'chart','Registros financeiros')}${metric('Média por lançamento',money(state.expenses.length?total()/state.expenses.length:0),'grid','Custo médio')}${metric('Categorias',new Set(state.expenses.map(e=>e.category)).size,'grid','Tipos de despesas')}</div><section class="panel"><div class="panel-head">${panelTitle('wallet','Histórico de despesas','Registros vinculados aos equipamentos.')} ${searchTools('Buscar equipamento, categoria ou observação...')}</div>${table([th('Equipamento'),th('Categoria'),th('Data'),th('Valor'),th('Ações',false)],arr.map(rowExpense))}</section></section>`;
}
function maintenance(){
  const arr=state.maintenance.filter(m=>(nameOf(m.machineId)+' '+m.description+' '+m.status).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.due.localeCompare(b.due));
  return `${pageHero()}<section class="page-shell"><div class="cards">${metric('Manutenções cadastradas',state.maintenance.length,'wrench','No histórico')}${metric('Pendentes',pending(),'clock','Aguardando execução')}${metric('Concluídas',state.maintenance.filter(m=>m.status==='Concluída').length,'leaf','Já finalizadas')}${metric('Equipamentos atendidos',new Set(state.maintenance.map(m=>m.machineId)).size,'tractor','Máquinas relacionadas')}</div><section class="panel"><div class="panel-head">${panelTitle('wrench','Cronograma de manutenção','Programação e execução de serviços.')} ${searchTools('Buscar por equipamento ou serviço...')}</div>${table([th('Equipamento'),th('Serviço'),th('Data prevista'),th('Situação'),th('Ações',false)],arr.map(rowMaintenance))}</section></section>`;
}
function reports(){
  const list=state.machines.map(m=>({m,v:costByMachine(m.id)})).sort((a,b)=>b.v-a.v);
  return `${pageHero()}<section class="page-shell"><div class="notice"><strong>Informação:</strong> os relatórios utilizam os dados armazenados neste navegador. Valores de demonstração não representam uma propriedade real.</div><div class="cards">${metric('Gasto total',money(total()),'wallet','Despesas registradas')}${metric('Custo médio por máquina',money(state.machines.length?total()/state.machines.length:0),'tractor','Sobre toda a frota')}${metric('Máquinas',state.machines.length,'grid','No cadastro')}${metric('Manutenções pendentes',pending(),'wrench','Em aberto')}</div><div class="report-grid"><section class="panel"><div class="panel-head">${panelTitle('chart','Ranking de custos','Equipamentos com maiores despesas')}</div>${table([th('Equipamento'),th('Despesas acumuladas',false)],list.map(x=>`<tr>${machineCell(x.m)}<td><strong>${money(x.v)}</strong></td></tr>`),'rank-table')}</section><section class="panel"><div class="panel-head">${panelTitle('grid','Resumo da operação','Informações gerais dos registros')}</div><div class="summary-stack"><div class="summary-line"><span>Equipamentos ativos</span><b>${active()} de ${state.machines.length}</b></div><div class="summary-line"><span>Registros de despesas</span><b>${state.expenses.length}</b></div><div class="summary-line"><span>Manutenções concluídas</span><b>${state.maintenance.filter(x=>x.status==='Concluída').length}</b></div></div><div style="margin-top:18px"><button class="btn btn-soft" id="printReport">${icon('print','icon-left')}Imprimir relatório</button></div></section></div></section>`;
}

function render(){
  $('#crumb').textContent=titleMap[page];
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  $('#content').innerHTML=({dashboard,machines,expenses,maintenance,reports})[page]();
}
function goto(p){page=p;query='';$('#sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}

function buildField({label,name,type='text',value='',full=false,options=[]}){
  const isSelect=options.length>0;
  const opts=isSelect?options.map(o=>{const val=typeof o==='object'?o.value:o; const text=typeof o==='object'?o.label:o; return `<option value="${escapeHtml(val)}" ${String(value)===String(val)?'selected':''}>${escapeHtml(text)}</option>`}).join(''):'';
  return `<div class="field ${full?'full':''}"><label for="f-${name}">${label}</label>${isSelect?`<select id="f-${name}" name="${name}" required>${opts}</select>`:`<input id="f-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${type==='number'?'min="0" step="any"':''} required>`}</div>`;
}
function openModal(type,id){
  formType=type; editing=id??null;
  const maps={machine:'machines',expense:'expenses',maintenance:'maintenance'};
  const data=(editing!==null?state[maps[type]].find(x=>x.id===editing):{})||{};
  const machineOptions=state.machines.map(m=>({value:m.id,label:m.name}));
  let fields=[];
  if(type==='machine') fields=[
    {label:'Nome / Modelo',name:'name',value:data.name||''},
    {label:'Identificação',name:'code',value:data.code||''},
    {label:'Tipo',name:'type',value:data.type||'Trator',options:['Trator','Colheitadeira','Pulverizador','Caminhão']},
    {label:'Ano',name:'year',type:'number',value:data.year||2024},
    {label:'Horímetro (horas)',name:'hours',type:'number',value:data.hours??0},
    {label:'Situação',name:'status',value:data.status||'Ativa',options:['Ativa','Manutenção','Inativa']}
  ];
  if(type==='expense'){
    if(!machineOptions.length){toast('Cadastre uma máquina antes de registrar despesas.');return}
    fields=[
      {label:'Máquina',name:'machineId',value:data.machineId||machineOptions[0].value,options:machineOptions},
      {label:'Categoria',name:'category',value:data.category||'Combustível',options:['Combustível','Peças','Manutenção','Outros']},
      {label:'Valor (R$)',name:'amount',type:'number',value:data.amount??0},
      {label:'Data',name:'date',type:'date',value:data.date||today()},
      {label:'Observação',name:'note',value:data.note||'',full:true}
    ];
  }
  if(type==='maintenance'){
    if(!machineOptions.length){toast('Cadastre uma máquina antes de registrar manutenções.');return}
    fields=[
      {label:'Máquina',name:'machineId',value:data.machineId||machineOptions[0].value,options:machineOptions},
      {label:'Data prevista',name:'due',type:'date',value:data.due||today()},
      {label:'Descrição do serviço',name:'description',value:data.description||'',full:true},
      {label:'Situação',name:'status',value:data.status||'Pendente',options:['Pendente','Concluída']}
    ];
  }
  $('#modalTitle').textContent=(editing===null?'Novo cadastro: ':'Editar: ')+({machine:'Máquina',expense:'Despesa',maintenance:'Manutenção'})[type];
  $('#modalFields').innerHTML=fields.map(buildField).join('');
  $('#modalBackdrop').classList.remove('hidden');
}
function closeModal(){$('#modalBackdrop').classList.add('hidden')}
function toast(s){const t=$('#toast'); t.textContent=s; t.classList.remove('hidden'); clearTimeout(toast._timer); toast._timer=setTimeout(()=>t.classList.add('hidden'),3200)}
function submit(e){
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  if(formType==='machine'){d.year=Number(d.year); d.hours=Number(d.hours); if(d.year<1950||d.year>2100){toast('Informe um ano válido.'); return;}}
  if(formType==='expense'){d.machineId=Number(d.machineId); d.amount=Number(d.amount); if(d.amount<=0){toast('O valor deve ser maior que zero.'); return;}}
  if(formType==='maintenance'){d.machineId=Number(d.machineId)}
  const list=state[{machine:'machines',expense:'expenses',maintenance:'maintenance'}[formType]];
  if(editing===null) list.push({id:Date.now(),...d}); else {const index=list.findIndex(x=>x.id===editing); if(index>=0) list[index]={id:editing,...d}}
  save(); closeModal(); query=''; render(); toast('Registro salvo com sucesso!');
}
function remove(type,id){
  const key={machine:'machines',expense:'expenses',maintenance:'maintenance'}[type];
  const obj=state[key].find(x=>x.id===id); if(!obj) return;
  if(type==='machine'&&(state.expenses.some(x=>x.machineId===id)||state.maintenance.some(x=>x.machineId===id))){toast('Exclua primeiro as despesas e manutenções dessa máquina.'); return}
  if(!confirm('Deseja excluir este registro?')) return;
  state[key]=state[key].filter(x=>x.id!==id); save(); render(); toast('Registro excluído.');
}
function csv(){
  const rows=[['Máquina','Identificação','Categoria','Data','Valor (R$)','Observação'],...state.expenses.map(e=>[nameOf(e.machineId),machineOf(e.machineId)?.code||'',e.category,e.date,e.amount,e.note])];
  const data='\uFEFF'+rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'})); a.download='agrocontrol-despesas.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); toast('Relatório CSV exportado!');
}

function bind(){
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-page],[data-goto],[data-add],[data-edit],[data-delete],#exportCSV,#printReport');
    if(!el) return;
    if(el.dataset.page) goto(el.dataset.page);
    else if(el.dataset.goto) goto(el.dataset.goto);
    else if(el.dataset.add) openModal(el.dataset.add);
    else if(el.dataset.edit){const [t,id]=el.dataset.edit.split(':'); openModal(t,Number(id))}
    else if(el.dataset.delete){const [t,id]=el.dataset.delete.split(':'); remove(t,Number(id))}
    else if(el.id==='exportCSV') csv();
    else if(el.id==='printReport') window.print();
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='search'){
      const pos=e.target.selectionStart;
      query=e.target.value; render();
      const s=$('#search'); s?.focus(); s?.setSelectionRange(pos,pos);
    }
  });
  $('#modalForm').addEventListener('submit',submit);
  $('#closeModal').addEventListener('click',closeModal);
  $('#cancelModal').addEventListener('click',closeModal);
  $('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop') closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal()});
  $('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
}

function init(){
  installStaticIcons();
  $('#menuToggle').innerHTML=iconMap.menu;
  $('#closeModal').innerHTML=iconMap.close;
  $('#today').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  bind();
  render();
}
init();
})();
