// ===== DADOS GLOBAIS =====
const participantes = {}; // { nome: { contribuicao: 0, deve: 0, status: 'pendente' } }

// ===== FUNÇÕES DE UI =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'calculo') atualizarCalculoCarne();
  if (id === 'adicionais') atualizarAdicionais();
  if (id === 'contribuicoes') atualizarSelectContribuinte();
  if (id === 'participantes') atualizarTabelaParticipantes();
}

// ===== PARTICIPANTES =====
function adicionarParticipante() {
  const nome = document.getElementById('nomeParticipante').value.trim();
  if (!nome) return alert('Digite um nome válido!');
  if (participantes[nome]) return alert('Esta pessoa já foi adicionada!');
  
  participantes[nome] = { contribuicao: 0, deve: 0, status: 'pendente' };
  document.getElementById('nomeParticipante').value = '';
  atualizarTabelaParticipantes();
  atualizarSelectContribuinte();
  atualizarTudo();
}

function removerParticipante() {
  const nome = prompt('Digite o nome exato da pessoa para remover:');
  if (nome && participantes[nome]) {
    delete participantes[nome];
    atualizarTabelaParticipantes();
    atualizarSelectContribuinte();
    atualizarTudo();
  } else if (nome) {
    alert('Pessoa não encontrada.');
  }
}

function atualizarTabelaParticipantes() {
  const tbody = document.querySelector('#tabelaParticipantes tbody');
  tbody.innerHTML = '';
  let totalContribuido = 0;

  Object.keys(participantes).forEach(nome => {
    const p = participantes[nome];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${nome}</td>
      <td>R$ ${p.contribuicao.toFixed(2)}</td>
      <td class="${p.status === 'pago' ? 'paid' : 'pending'}">${p.status}</td>
    `;
    tbody.appendChild(tr);
    totalContribuido += p.contribuicao;
  });

  document.getElementById('totalArrecadado').textContent = totalContribuido.toFixed(2);
}

// ===== CÁLCULO DE CARNE =====
function atualizarCalculoCarne() {
  const qtdPessoas = Object.key(participantes).length;
  if (qtdPessoas === 0) return;

  const gramasPorPessoa = parseInt(document.getElementById('tipoChurrasco').value);
  const totalGramas = qtdPessoas * gramasPorPessoa;
  const totalKg = Math.ceil(totalGramas / 1000);

  document.getElementById('totalCarne').textContent = totalKg;

  const precoKg = parseFloat(document.getElementById('precoCarne').value) || 0;
  const custoCarne = totalKg * precoKg;
  document.getElementById('custoCarne').textContent = custoCarne.toFixed(2);

  calcularValorPorPessoa();
}

// ===== GASTOS ADICIONAIS =====
function atualizarAdicionais() {
  const qtdPessoas = Object.keys(participantes).length;
  if (qtdPessoas === 0) return;

  // Carvão: 2kg a cada 5 pessoas
  const pacotesCarvao = Math.ceil(qtdPessoas / 5);
  const precoCarvao = parseFloat(document.getElementById('precoCarvao').value) || 0;
  const totalCarvao = pacotesCarvao * precoCarvao;

  // Bebidas: 1L por pessoa
  const totalBebida = qtdPessoas * (parseFloat(document.getElementById('precoBebida').value) || 0);

  // Pão de alho: 1 por pessoa
  const precoPaoAlho = parseFloat(document.getElementById('precoPaoAlho').value) || 0;
  const totalPaoAlho = qtdPessoas * precoPaoAlho;

  // Sal grosso: 1 pacote fixo
  const totalSal = parseFloat(document.getElementById('precoSal').value) || 0;

  // Descartáveis: 1 kit fixo
  const totalDescartaveis = parseFloat(document.getElementById('precoDescartaveis').value) || 0;

  // Atualiza UI
  document.getElementById('qtdCarvao').textContent = pacotesCarvao;
  document.getElementById('totalCarvao').textContent = totalCarvao.toFixed(2);

  document.getElementById('qtdBebida').textContent = qtdPessoas;
  document.getElementById('totalBebida').textContent = totalBebida.toFixed(2);

  document.getElementById('qtdPaoAlho').textContent = qtdPessoas;
  document.getElementById('totalPaoAlho').textContent = totalPaoAlho.toFixed(2);

  document.getElementById('qtdSal').textContent = 1;
  document.getElementById('totalSal').textContent = totalSal.toFixed(2);

  document.getElementById('qtdDescartaveis').textContent = 1;
  document.getElementById('totalDescartaveis').textContent = totalDescartaveis.toFixed(2);

  const totalAdicionais = totalCarvao + totalBebida + totalPaoAlho + totalSal + totalDescartaveis;
  document.getElementById('totalAdicionais').textContent = totalAdicionais.toFixed(2);

  calcularValorPorPessoa();
}

// ===== CÁLCULO DO VALOR POR PESSOA =====
function calcularValorPorPessoa() {
  const qtdPessoas = Object.keys(participantes).length;
  if (qtdPessoas === 0) return;

  const custoCarne = parseFloat(document.getElementById('custoCarne').textContent) || 0;
  const totalAdicionais = parseFloat(document.getElementById('totalAdicionais').textContent) || 0;

  const custoTotal = custoCarne + totalAdicionais;
  const valorPorPessoa = custoTotal / qtdPessoas;

  Object.keys(participantes).forEach(nome => {
    const p = participantes[nome];
    p.deve = valorPorPessoa;
    p.status = p.contribuicao >= valorPorPessoa ? 'pago' : 'pendente';
  });

  atualizarTabelaParticipantes();
}

// ===== CONTRIBUIÇÕES =====
function atualizarSelectContribuinte() {
  const select = document.getElementById('selectContribuinte');
  select.innerHTML = '<option value="">Selecione...</option>';
  Object.keys(participantes).forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = `${nome} (deve R$ ${participantes[nome].deve.toFixed(2)})`;
    select.appendChild(opt);
  });
}

function registrarContribuicao() {
  const nome = document.getElementById('selectContribuinte').value;
  const valor = parseFloat(document.getElementById('valorContribuicao').value) || 0;

  if (!nome || valor <= 0) return alert('Selecione uma pessoa e insira um valor válido.');

  participantes[nome].contribuicao += valor;
  if (participantes[nome].contribuicao >= participantes[nome].deve) {
    participantes[nome].status = 'pago';
  }

  document.getElementById('valorContribuicao').value = '';
  atualizarTabelaParticipantes();
  atualizarSelectContribuinte();
  atualizarTudo();
}

// ===== RESUMO FINAL =====
function gerarResumo() {
  const qtdPessoas = Object.keys(participantes).length;
  if (qtdPessoas === 0) return alert('Adicione pelo menos um participante!');

  let resumo = `<h3>Resumo do Churrasco - ${qtdPessoas} pessoas</h3>`;

  const totalKg = document.getElementById('totalCarne').textContent亮点;
  const custoCarne = document.getElementById('custoCarne').textContent;
  resumo += `<p><strong>Carne:</strong> ${totalKg} kg → R$ ${custoCarne}</p>`;

  resumo += `<p><strong>Adicionais:</strong> R$ ${document.getElementById('totalAdicionais').textContent}</p>`;

  const totalGeral = (parseFloat(custoCarne) + parseFloat(document.getElementById('totalAdicionais').textContent)).toFixed(2);
  const valorPorPessoa = (totalGeral / qtdPessoas).toFixed(2);
  resumo += `<p class="total"><strong>Custo Total:</strong> R$ ${totalGeral}</p>`;
  resumo += `<p><strong>Valor por pessoa:</strong> R$ ${valorPorPessoa}</p>`;

  let totalArrecadado = 0;
  let faltamPagar = [];
  Object.keys(participantes).forEach(nome => {
    const p = participantes[nome];
    totalArrecadado += p.contribuicao;
    if (p.status === 'pendente') {
      const falta = (p.deve - p.contribuicao).toFixed(2);
      faltamPagar.push(`${nome} (falta R$ ${falta})`);
    }
  });

  resumo += `<p><strong>Arrecadado:</strong> R$ ${totalArrecadado.toFixed(2)}</p>`;
  if (faltamPagar.length > 0) {
    resumo += `<p class="pending"><strong>Faltam pagar:</strong> ${faltamPagar.join(', ')}</p>`;
  } else {
    resumo += `<p class="paid"><strong>Todos pagaram!</strong> Success</p>`;
  }

  document.getElementById('resumoConteudo').innerHTML = resumo;
}

// ===== ATUALIZA TUDO =====
function atualizarTudo() {
  atualizarCalculoCarne();
  atualizarAdicionais();
  atualizarTabelaParticipantes();
  atualizarSelectContribuinte();
}

// ===== INICIALIZAÇÃO =====
document.getElementById('tipoChurrasco').addEventListener('change', atualizarCalculoCarne);
document.getElementById('precoCarne').addEventListener('input', atualizarCalculoCarne);
['precoCarvao','precoBebida','precoPaoAlho','precoSal','precoDescartaveis'].forEach(id => {
  document.getElementById(id).addEventListener('input', atualizarAdicionais);
});