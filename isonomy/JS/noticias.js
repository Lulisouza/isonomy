
// ==========================================
// ISONOMY - SISTEMA DE NOTÍCIAS (noticias.js)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Busca notícias reais da internet assim que a página abre
    carregarNoticiasReais();

    // 2. Escuta a digitação no campo de busca automaticamente
    const campoBusca = document.getElementById('campo-busca');
    if (campoBusca) {
        campoBusca.addEventListener('input', filtrarNoticias);
    }
});

// --- 1. BUSCAR NOTÍCIAS REAIS EM TEMPO REAL ---
async function carregarNoticiasReais() {
    const gridNoticias = document.getElementById('grid-noticias');
    if (!gridNoticias) return;

    const termoBusca = encodeURIComponent('igualdade de genero');
    const rssUrl = `https://news.google.com/rss/search?q=${termoBusca}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        gridNoticias.innerHTML = '<p class="carregando">Carregando notícias em tempo real...</p>';

        const resposta = await fetch(apiUrl);
        const dados = await resposta.json();

        if (dados.status !== 'ok' || !dados.items || dados.items.length === 0) {
            gridNoticias.innerHTML = '<p>Não foi possível carregar as notícias no momento.</p>';
            return;
        }

        gridNoticias.innerHTML = ''; // Limpa a mensagem de carregamento

        dados.items.forEach((noticia, index) => {
            const descricaoLimpa = noticia.description.replace(/<[^>]*>?/gm, '').substring(0, 140) + '...';
            const dataFormatada = new Date(noticia.pubDate).toLocaleDateString('pt-BR');
            const idNoticia = `news-${index}`;

            const cardHTML = `
                <article class="card-noticia" data-titulo="${noticia.title}">
                    <div class="noticia-conteudo">
                        <span class="tag">${noticia.author || 'Imprensa'}</span>
                        <h3>${noticia.title}</h3>
                        <p>${descricaoLimpa}</p>
                        <div class="noticia-rodape">
                            <span class="data">${dataFormatada}</span>
                            <a href="${noticia.link}" target="_blank" class="btn-ler">Ler matéria</a>
                            <button class="btn-favorito" onclick="alternarFavorito(this, '${idNoticia}')">
                                ♥ <span class="texto-fav">Favoritar</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;

            gridNoticias.innerHTML += cardHTML;
        });

        // Restaura o estado visual dos favoritos após os cards serem criados
        carregarFavoritosSalvos();

    } catch (erro) {
        console.error('Erro ao buscar notícias:', erro);
        gridNoticias.innerHTML = '<p>Ocorreu um erro ao conectar com o serviço de notícias.</p>';
    }
}

// --- 2. BARRA DE PESQUISA EM TEMPO REAL ---
function filtrarNoticias() {
    const campoBusca = document.getElementById('campo-busca');
    if (!campoBusca) return;

    const termo = campoBusca.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card-noticia');

    cards.forEach(card => {
        const titulo = (card.getAttribute('data-titulo') || card.innerText).toLowerCase();
        
        if (titulo.includes(termo)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 3. SISTEMA DE FAVORITOS (Alternar e Salvar) ---
function alternarFavorito(botao, idNoticia) {
    let favoritos = JSON.parse(localStorage.getItem('noticias_favoritas')) || [];
    const textoFav = botao.querySelector('.texto-fav');

    if (favoritos.includes(idNoticia)) {
        // Remover dos favoritos
        favoritos = favoritos.filter(id => id !== idNoticia);
        botao.classList.remove('favoritado');
        if (textoFav) textoFav.innerText = 'Favoritar';
    } else {
        // Adicionar aos favoritos
        favoritos.push(idNoticia);
        botao.classList.add('favoritado');
        if (textoFav) textoFav.innerText = 'Favorito';
    }

    localStorage.setItem('noticias_favoritas', JSON.stringify(favoritos));
}

// --- 4. RESTAURAR FAVORITOS SALVOS ---
function carregarFavoritosSalvos() {
    const favoritos = JSON.parse(localStorage.getItem('noticias_favoritas')) || [];

    favoritos.forEach(idNoticia => {
        const botao = document.querySelector(`button[onclick*="${idNoticia}"]`);

        if (botao) {
            botao.classList.add('favoritado');
            const textoFav = botao.querySelector('.texto-fav');
            if (textoFav) textoFav.innerText = 'Favorito';
        }
    });
}