// SIMULAÇÃO DE USUÁRIO LOGADO (Utilizado para identificar criador e participante)
const USUARIO_ATUAL = "usuario_demo@isonomy.com";

let abaAtual = "todos";

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventosPadrao();
    renderizarEventos();
});

// Alterna exibição do formulário
function alternarFormulario() {
    const secaoForm = document.getElementById('secao-form');
    secaoForm.classList.toggle('id-form-oculto');
}

// Cria novos eventos e salva no LocalStorage
function criarNovoEvento(e) {
    e.preventDefault();

    const novoEvento = {
        id: 'evt-' + Date.now(),
        titulo: document.getElementById('titulo').value,
        tipo: document.getElementById('tipo').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        local: document.getElementById('local').value,
        organizador: document.getElementById('organizador').value,
        contato: document.getElementById('contato').value,
        motivo: document.getElementById('motivo').value,
        criador: USUARIO_ATUAL,
        participantes: []
    };

    const eventos = JSON.parse(localStorage.getItem('isonomy_eventos')) || [];
    eventos.unshift(novoEvento);
    localStorage.setItem('isonomy_eventos', JSON.stringify(eventos));

    document.getElementById('form-evento').reset();
    alternarFormulario();
    renderizarEventos();
}

// Controla as abas de filtro
function filtrarAba(aba, elementoBotao) {
    abaAtual = aba;
    document.querySelectorAll('.btn-aba').forEach(btn => btn.classList.remove('ativa'));
    elementoBotao.classList.add('ativa');
    renderizarEventos();
}

// Alterna a participação no evento
function alternarParticipacao(idEvento) {
    let eventos = JSON.parse(localStorage.getItem('isonomy_eventos')) || [];

    eventos = eventos.map(evt => {
        if (evt.id === idEvento) {
            const index = evt.participantes.indexOf(USUARIO_ATUAL);
            if (index > -1) {
                evt.participantes.splice(index, 1);
            } else {
                evt.participantes.push(USUARIO_ATUAL);
            }
        }
        return evt;
    });

    localStorage.setItem('isonomy_eventos', JSON.stringify(eventos));
    renderizarEventos();
}

// Exclui o evento (Apenas o Criador)
function deletarEvento(idEvento) {
    if (confirm("Tem certeza de que deseja excluir este evento permanentemente?")) {
        let eventos = JSON.parse(localStorage.getItem('isonomy_eventos')) || [];
        eventos = eventos.filter(evt => evt.id !== idEvento);
        localStorage.setItem('isonomy_eventos', JSON.stringify(eventos));
        renderizarEventos();
    }
}

// Renderiza a lista de eventos de acordo com a aba selecionada
function renderizarEventos() {
    const grid = document.getElementById('grid-eventos');
    const eventos = JSON.parse(localStorage.getItem('isonomy_eventos')) || [];

    let eventosFiltrados = eventos;

    if (abaAtual === "participando") {
        eventosFiltrados = eventos.filter(e => e.participantes.includes(USUARIO_ATUAL));
    } else if (abaAtual === "criados") {
        eventosFiltrados = eventos.filter(e => e.criador === USUARIO_ATUAL);
    }

    if (eventosFiltrados.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px 0;">
            Nenhum evento encontrado nesta categoria.
        </p>`;
        return;
    }

    grid.innerHTML = '';

    eventosFiltrados.forEach(evt => {
        const estaParticipando = evt.participantes.includes(USUARIO_ATUAL);
        const eCriador = evt.criador === USUARIO_ATUAL;
        const dataFormatada = new Date(evt.data + 'T00:00:00').toLocaleDateString('pt-BR');

        const card = `
            <article class="card-evento">
                <div>
                    <div class="card-topo">
                        <span class="card-tipo">${evt.tipo}</span>
                        ${eCriador ? `<button class="btn-excluir" onclick="deletarEvento('${evt.id}')" title="Excluir Evento">🗑️ Excluir</button>` : ''}
                    </div>
                    <h3 class="card-titulo">${evt.titulo}</h3>
                    <div class="card-info">
                        <p><strong>📅 Data:</strong> ${dataFormatada} às ${evt.hora}</p>
                        <p><strong>📍 Local:</strong> ${evt.local}</p>
                        <p><strong>👤 Organizador:</strong> ${evt.organizador} (${evt.contato})</p>
                        <p style="margin-top:8px;"><strong>Objetivo:</strong> ${evt.motivo}</p>
                    </div>
                </div>
                <div class="card-rodape">
                    <span class="participantes-count">👥 ${evt.participantes.length} confirmado(s)</span>
                    <button class="btn-participar ${estaParticipando ? 'confirmado' : ''}" 
                            onclick="alternarParticipacao('${evt.id}')">
                        ${estaParticipando ? '✓ Confirmado' : 'Quero Participar'}
                    </button>
                </div>
            </article>
        `;
        grid.innerHTML += card;
    });
}

// Inicializa o evento padrão com o endereço 100% fictício
function inicializarEventosPadrao() {
    if (!localStorage.getItem('isonomy_eventos')) {
        const padrao = [
            {
                id: 'evt-1',
                titulo: '(EXEMPLO - EVENTO NÃO VÁLIDO) Palestra: Liderança Feminina nas Carreiras STEM',
                tipo: 'Palestra',
                data: '2026-11-15',
                hora: '14:00',
                local: 'Auditório Central, Rua Imaginária, nº 123, Bairro do Futuro (ENDEREÇO FICTÍCIO / APENAS DEMONSTRATIVO)',
                organizador: 'Comissão Isonomy',
                contato: 'contato@isonomy.com',
                motivo: 'Incentivar e orientar jovens estudantes sobre o mercado de tecnologia e ciência.',
                criador: 'sistema',
                participantes: []
            }
        ];
        localStorage.setItem('isonomy_eventos', JSON.stringify(padrao));
    }
}