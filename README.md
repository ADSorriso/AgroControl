# AgroControl — Demonstração

Painel responsivo de gestão de equipamentos agrícolas, despesas, manutenções e relatórios com dados **fictícios**.

## Como abrir
1. Extraia o ZIP.
2. Abra `index.html` no Chrome, Edge ou Firefox.
3. Para publicar no GitHub Pages, envie `index.html`, `styles.css` e `app.js` para a raiz do repositório e ative Pages em Settings → Pages.

## O que funciona
- Navegação entre 5 telas.
- Cadastro, edição e exclusão de máquinas.
- Cadastro, edição e exclusão de despesas e manutenções.
- Dashboard com totais e gráficos calculados a partir dos registros.
- Relatórios, impressão pelo navegador e exportação de despesas em CSV.
- Layout responsivo e dados armazenados em `localStorage` deste navegador.

## Limitações importantes
Este é um protótipo **sem servidor, sem login e sem banco de dados online**. Não use para dados reais de clientes nem como sistema de produção. Os dados ficam apenas no navegador/dispositivo atual e podem ser apagados com a limpeza do navegador. Não há sincronização, backup remoto nem isolamento entre usuários. Google Fonts requer conexão para fontes personalizadas, mas o painel usa fontes alternativas quando offline.

## Próxima etapa
Validar com potenciais clientes usando informações fictícias. Após validar, planejar autenticação, permissões por fazenda, banco Supabase, política de backups e hospedagem comercial.


Correção da marca: folha vetorial SVG incorporada diretamente em index.html; sem imagem fotográfica, mantendo a área de 48×48 px no topo da barra lateral.
