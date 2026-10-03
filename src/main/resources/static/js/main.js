const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataBR = d => d ? d.split('-').reverse().join('/') : '';

let lista = [], total = null, editando = null;

/* HTTP: toda chamada à API passa por aqui */
const MOTIVOS = { 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed', 500: 'Internal Server Error' };

async function api(metodo, url, corpo) {
  const ini = performance.now();
  let res;
  try {
    const r = await fetch(url, { method: metodo, headers: corpo ? { 'Content-Type': 'application/json' } : {}, body: corpo ? JSON.stringify(corpo) : undefined });
    const txt = await r.text();
    let dados = null;
    try { dados = txt ? JSON.parse(txt) : null; } catch { /* resposta sem JSON */ }
    res = { status: r.status, ok: r.ok, dados, texto: txt, tipo: r.headers.get('content-type') || '', motivo: r.statusText || MOTIVOS[r.status] || '' };
  } catch (e) {
    res = { status: 0, ok: false, dados: null, texto: '', tipo: '', motivo: '' };
  }
  res.ms = Math.round(performance.now() - ini);
  $('api-ponto').className = 'ponto ' + (res.status === 0 ? 'off' : 'on');
  $('api-texto').textContent = res.status === 0 ? 'API fora do ar' : `API conectada, última resposta ${res.status} em ${res.ms} ms`;
  return res;
}

function avisar(texto, tipo) {
  const a = $('aviso');
  a.className = 'aviso' + (tipo === 'erro' ? ' erro' : '');
  a.textContent = texto; a.hidden = false;
  clearTimeout(avisar.t); avisar.t = setTimeout(() => { a.hidden = true; }, 6000);
}

/* Rotas */
function rota() {
  const [, p, id] = location.hash.split('/');
  return { pagina: ['consulta', 'cadastro', 'requisicoes'].includes(p) ? p : 'consulta', id };
}

function rotear() {
  const { pagina, id } = rota();
  document.querySelectorAll('[data-pagina]').forEach(s => { s.hidden = s.dataset.pagina !== pagina; });
  document.querySelectorAll('[data-nav]').forEach(a => a.setAttribute('aria-selected', a.dataset.nav === pagina));
  if (pagina === 'consulta') carregarLista();
  else if (pagina === 'cadastro') abrirForm(id);
}
addEventListener('hashchange', rotear);

/* Consulta */
const contarNotif = () => { $('cont-notif').textContent = total ?? '-'; };

async function carregarLista() {
  const q = new URLSearchParams();
  if ($('f-agravo').value.trim()) q.set('agravo', $('f-agravo').value.trim());
  if ($('f-paciente').value.trim()) q.set('nomePaciente', $('f-paciente').value.trim());
  if ($('f-dup').checked) q.set('duplicadas', 'true');
  const qs = q.toString();
  const r = await api('GET', '/notificacao' + (qs ? '?' + qs : ''));
  if (!r.ok) { $('tb').innerHTML = '<tr><td colspan="8" class="vazio">Não foi possível carregar as notificações.</td></tr>'; return; }
  if (!qs) total = r.dados.length;
  const idBusca = $('f-id').value.trim();
  lista = idBusca ? r.dados.filter(n => String(n.id) === idBusca) : r.dados;
  contarNotif();
  $('tb').innerHTML = lista.map(linha).join('') || '<tr><td colspan="8" class="vazio">Nenhuma notificação encontrada.</td></tr>';
  $('tb-total').textContent = lista.length + (lista.length === 1 ? ' notificação' : ' notificações');
}

const linha = n => `<tr><td>${n.id}</td><td>${esc(n.agravo)}</td><td>${esc(n.nomePaciente)}</td><td>${esc(n.sexo)}</td><td>${dataBR(n.dataNotificacao)}</td><td>${esc(n.ufResidencia ? `${n.municipioResidencia ?? ''} - ${n.ufResidencia}` : n.paisResidencia)}</td><td class="acao"><a href="#/cadastro/${n.id}" class="btn pequeno">Alterar</a></td><td class="acao"><button class="btn pequeno perigo" data-excluir="${n.id}">Excluir</button></td></tr>`;

$('tb').addEventListener('click', e => { const b = e.target.closest('[data-excluir]'); if (b) excluir(Number(b.dataset.excluir)); });

async function excluir(id) {
  const n = lista.find(x => x.id === id);
  if (!confirm(`Excluir a notificação #${id}${n ? ' (' + n.nomePaciente + ')' : ''}?`)) return;
  const r = await api('DELETE', `/notificacao/${id}`);
  if (r.ok && total !== null) total--;
  avisar(r.ok ? `Notificação #${id} excluída.` : (r.dados?.detail || `Não foi possível excluir (status ${r.status}).`), r.ok ? '' : 'erro');
  carregarLista();
}

let timer;
['f-id', 'f-agravo', 'f-paciente'].forEach(i => $(i).addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(carregarLista, 300); }));
$('f-dup').addEventListener('change', carregarLista);

/* Cadastro */
const GESTANTE = ['1º trimestre', '2º trimestre', '3º trimestre', 'Idade gestacional ignorada', 'Não', 'Não se aplica', 'Ignorado'];
const CAMPOS = [['agravo', 'Agravo'], ['nomePaciente', 'Nome do paciente'], ['sexo', 'Sexo', 'sexo'], ['dataNascimento', 'Data de nascimento', 'date'],
  ['nomeMae', 'Nome da mãe'], ['dataNotificacao', 'Data da notificação', 'date'], ['idade', 'Idade', 'number'], ['gestante', 'Gestante', 'gestante'],
  ['ufResidencia', 'UF de residência', 'uf'], ['municipioResidencia', 'Município de residência'], ['paisResidencia', 'País (se reside fora do Brasil)']];

const opcoes = lista => '<option value="">Selecione</option>' + lista.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
const campoHtml = (n, t) =>
  t === 'sexo' ? `<select id="${n}" name="${n}">${opcoes([['F', 'F - Feminino'], ['M', 'M - Masculino'], ['I', 'I - Ignorado']])}</select>`
  : t === 'gestante' ? `<select id="${n}" name="${n}">${opcoes(GESTANTE.map(g => [g, g]))}</select>`
  : `<input id="${n}" name="${n}" type="${t === 'date' || t === 'number' ? t : 'text'}"${t === 'uf' ? ' maxlength="2"' : ''}${t === 'number' ? ' min="0"' : ''}>`;

$('campos').innerHTML = CAMPOS.map(([n, rot, t]) => `<div><label for="${n}">${rot}</label>${campoHtml(n, t)}<p data-erro="${n}" class="erro-campo"></p></div>`).join('');
$('ufResidencia').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

const limparErros = () => document.querySelectorAll('[data-erro]').forEach(p => { p.textContent = ''; });

async function abrirForm(id) {
  editando = id ? Number(id) : null;
  $('form').reset(); limparErros();
  $('form-titulo').textContent = editando ? `Alterar notificação #${editando}` : 'Nova notificação';
  if (!editando) return;
  const r = await api('GET', `/notificacao/${editando}`);
  if (!r.ok) { avisar(r.dados?.detail || 'Notificação não encontrada.', 'erro'); location.hash = '#/consulta'; return; }
  CAMPOS.forEach(([n]) => { $(n).value = r.dados[n] ?? ''; });
}

$('form').addEventListener('submit', async e => {
  e.preventDefault(); limparErros();
  const corpo = {};
  CAMPOS.forEach(([n, , t]) => { const v = $(n).value.trim(); corpo[n] = v === '' ? null : t === 'number' ? Number(v) : v; });
  const r = editando ? await api('PUT', `/notificacao/${editando}`, corpo) : await api('POST', '/notificacao', corpo);
  if (r.ok) {
    if (!editando && total !== null) total++;
    avisar(editando ? `Notificação #${editando} atualizada.` : 'Notificação cadastrada.');
    location.hash = '#/consulta';
  } else if (r.status === 400 && r.dados?.erros) {
    Object.entries(r.dados.erros).forEach(([c, m]) => { const p = document.querySelector(`[data-erro="${c}"]`); if (p) p.textContent = m; });
    avisar('Corrija os campos destacados.', 'erro');
  } else if (r.status === 404) {
    avisar(r.dados?.detail || 'Notificação não encontrada.', 'erro'); location.hash = '#/consulta';
  } else avisar(`Não foi possível salvar (status ${r.status}).`, 'erro');
});

rotear();

const OK = { agravo: 'Dengue', nomePaciente: 'Teste Professor', sexo: 'F', dataNascimento: '1990-05-12', nomeMae: 'Mae Teste', dataNotificacao: '2026-09-28', idade: 36, gestante: 'Não', ufResidencia: 'PB', municipioResidencia: 'João Pessoa', paisResidencia: 'Brasil' };

/* [nome, descrição, método, url(ctx), corpo(ctx), status esperado, guardar(dados, ctx)] */
const TESTES = [
  ['Listar todas', 'Retorna todas as notificações cadastradas.', 'GET', () => '/notificacao', null, 200],
  ['Filtrar por agravo e paciente', 'Filtros por trecho, sem diferenciar maiúsculas de minúsculas.', 'GET', () => '/notificacao?agravo=dengue&nomePaciente=maria', null, 200],
  ['RN01: somente duplicadas', 'Lista as notificações com mesmo agravo, paciente, nascimento e mãe, com até 3 dias de diferença.', 'GET', () => '/notificacao?duplicadas=true', null, 200],
  ['RN01: duplicadas + outro filtro', 'O filtro de duplicidade combinado com o filtro por nome do paciente.', 'GET', () => '/notificacao?duplicadas=true&nomePaciente=maria', null, 200],
  ['Cadastrar', 'Cria uma notificação e devolve o registro com o id gerado.', 'POST', () => '/notificacao', () => OK, 201, (d, c) => { c.id = d?.id; }],
  ['Buscar por id', 'Busca o registro recém-cadastrado.', 'GET', c => `/notificacao/${c.id}`, null, 200],
  ['Alterar', 'Substitui o registro inteiro (PUT). Aqui a idade muda de 36 para 37.', 'PUT', c => `/notificacao/${c.id}`, () => ({ ...OK, idade: 37 }), 200],
  ['Dados inválidos', 'Agravo em branco: a API responde 400 em Problem Detail com o campo em "erros".', 'POST', () => '/notificacao', () => ({ ...OK, agravo: '' }), 400],
  ['RN02: idade obrigatória', 'Sem data de nascimento e sem idade.', 'POST', () => '/notificacao', () => ({ ...OK, dataNascimento: null, idade: null }), 400],
  ['RN02: gestante obrigatória', 'Sexo feminino, com idade suficiente, sem informar gestante.', 'POST', () => '/notificacao', () => ({ ...OK, gestante: null }), 400],
  ['RN03: UF obrigatória', 'Reside no Brasil, mas sem UF e sem município.', 'POST', () => '/notificacao', () => ({ ...OK, ufResidencia: null, municipioResidencia: null }), 400],
  ['Id inexistente', 'Busca por um id que não existe: 404 em Problem Detail.', 'GET', () => '/notificacao/999999', null, 404],
  ['Excluir', 'Remove o registro de teste; resposta 204 sem corpo.', 'DELETE', c => `/notificacao/${c.id}`, null, 204],
  ['Confirmar exclusão', 'Buscar de novo o mesmo id deve dar 404.', 'GET', c => `/notificacao/${c.id}`, null, 404],
];

const bloco = t => t.length > 3000 ? t.slice(0, 3000) + '\n… (resposta truncada)' : t;
const json = v => JSON.stringify(v, null, 2);

function textoRequisicao(m, url, corpo) {
  let t = `${m} ${url} HTTP/1.1\nHost: ${location.host}`;
  if (corpo) t += `\nContent-Type: application/json\n\n${json(corpo)}`;
  return t;
}

function textoResposta(r) {
  if (r.status === 0) return 'Sem resposta: não foi possível conectar à API.';
  let t = `HTTP/1.1 ${r.status} ${r.motivo}`.trim() + `  (${r.ms} ms)`;
  if (r.tipo) t += `\nContent-Type: ${r.tipo}`;
  if (r.texto) t += `\n\n${r.dados !== null ? json(r.dados) : r.texto}`;
  else t += '\n\n(sem corpo)';
  return bloco(t);
}


$('lista-req').innerHTML = TESTES.map(([nome, desc, m, url, corpo, esperado], i) =>
  `<details class="req" open>
    <summary>
      <span class="metodo ${m.toLowerCase()}">${m}</span>
      <span class="req-nome">${esc(nome)}</span>
      <code class="req-url">${esc(url({ id: '{id}' }))}</code>
      <span class="req-esperado">esperado ${esperado}</span>
      <span id="res-${i}" class="req-res">Aguardando</span>
    </summary>
    <div class="req-corpo">
      <p class="descricao">${esc(desc)}</p>
      <div class="par">
        <div><h2>Requisição</h2><pre id="rq-${i}">${esc(textoRequisicao(m, url({ id: '{id}' }), corpo ? corpo() : null))}</pre></div>
        <div><h2>Resposta</h2><pre id="rp-${i}" class="vazia">Ainda não executada. Clique em "Executar requisições".</pre></div>
      </div>
    </div>
  </details>`).join('');

const mostrar = (i, texto, classe = '') => { const c = $('res-' + i); c.textContent = texto; c.className = 'req-res ' + classe; };

$('btn-alternar').addEventListener('click', () => {
  const cartoes = document.querySelectorAll('.req');
  const abrir = [...cartoes].some(d => !d.open);
  cartoes.forEach(d => { d.open = abrir; });
  $('btn-alternar').textContent = abrir ? 'Recolher tudo' : 'Expandir tudo';
});

$('btn-testes').addEventListener('click', async () => {
  $('btn-testes').disabled = true;
  $('resumo').textContent = 'Executando...';
  TESTES.forEach((_, i) => { mostrar(i, 'Aguardando'); $('rp-' + i).className = 'vazia'; $('rp-' + i).textContent = 'Aguardando...'; });
  const ctx = {}; let passaram = 0, executadas = 0;
  for (const [i, [, , m, url, corpo, esperado, guardar]] of TESTES.entries()) {
    if (url(ctx).includes('undefined')) {
      mostrar(i, 'Não executada', 'falhou');
      $('rp-' + i).textContent = 'Não executada: depende do cadastro, que não foi concluído.';
      continue;
    }
    mostrar(i, 'Executando...');
    const dadosEnvio = corpo ? corpo(ctx) : null;
    const urlReal = url(ctx);
    $('rq-' + i).textContent = textoRequisicao(m, urlReal, dadosEnvio);
    const r = await api(m, urlReal, dadosEnvio);
    executadas++;
    const passou = r.status === esperado;
    if (passou) passaram++;
    mostrar(i, `${passou ? 'Passou' : 'Falhou'}: ${r.status || 'sem resposta'}`, passou ? 'passou' : 'falhou');
    $('rp-' + i).className = passou ? '' : 'erro-resp';
    $('rp-' + i).textContent = textoResposta(r);
    if (guardar) guardar(r.dados, ctx);
  }
  $('cont-req').textContent = executadas;
  $('resumo').textContent = `${passaram} de ${TESTES.length} passaram`;
  $('btn-testes').disabled = false;
});