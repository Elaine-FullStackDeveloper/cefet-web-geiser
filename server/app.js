// importação de dependência(s)
import express from 'express';
import { readFile } from 'fs';

const app = express();

// variáveis globais deste módulo
const PORT = 3000
const db = {}


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

readFile('server/data/jogadores.json', (err, data) => {
    if (err) {
        console.log(err);
    }
    else {
        db.jogadores = JSON.parse(data);
    }
});

readFile('server/data/jogosPorJogador.json', (err, data) => {
    if (err) {
        console.log(err);
    }
    else {
        db.jogosPorJogador = JSON.parse(data);
    }
});


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
// dica: 2 linhas
app.set('view engine', 'hbs');
app.set('views', 'server/views');


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)

app.get('/', (req, res) => {
    res.render('index.hbs', db.jogadores, (err, html) => {
        if (err) {
            res.status(500).send(`Error: ${err}`);
        }
        else {
            res.send(html);
        }
    });
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

app.get('/jogador/:numero_identificador', (req, res) => {
    const steamid = req.params.numero_identificador;
    /*
     * busca o jogador na lista de jogadores pelo steamid
     * retorna o objeto jogador caso o jogador exista na lista
     * retorna undefined caso contrário
    */
    const jogador = db.jogadores.players.find(player => player.steamid === steamid);
    
    if (jogador) {
        const jogosPorJogador = db.jogosPorJogador[steamid];

        let detalhes = {};
        detalhes.jogador = jogador;
        detalhes.quantidadeJogos = jogosPorJogador.game_count;
        // conta a quantidade de jogos cujo tempo de jogo é zero
        detalhes.naoJogados = jogosPorJogador.games.filter(game => game.playtime_forever === 0).length;
        // ordena a lista de jogos de forma decrescente, e seleciona apenas os cinco primeiros
        detalhes.topCincoJogados = jogosPorJogador.games.sort((a, b) => {
            return b.playtime_forever - a.playtime_forever;
        }).slice(0,5);

        // mudando o tempo de jogo para horas mantendo o resultado inteiro
        for (let jogo of detalhes.topCincoJogados) {
            jogo.playtime_forever = (jogo.playtime_forever / 60).toFixed(0);
        }

        detalhes.jogoFavorito = detalhes.topCincoJogados[0];

        res.render('jogador.hbs', detalhes, (err, html) => {
            if (err) {
                res.status(500).send(`Error: ${err}`);
            }
            else {
                res.send(html);
            }
        });
    }
    else {
        res.status(404).send(`Jogador com id ${steamid} não foi encontrado!`)
    }
    
});


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);
});
