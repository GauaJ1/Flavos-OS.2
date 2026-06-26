# Flavos Web Console

Esta pasta abrigará futuramente o painel administrativo visual do projeto, denominado **Flavos Web Console**.

---

## 🛠️ Stack Planejada

- **Framework:** [React](https://react.dev/) com TypeScript.
- **Ferramenta de Build:** [Vite](https://vitejs.dev/) (para build rápida e desenvolvimento otimizado).
- **Estilização:** [TailwindCSS](https://tailwindcss.com/) (para layout moderno e responsivo).
- **Biblioteca de Gráficos:** Chart.js, Recharts ou similar para renderizar os dados da telemetria de CPU/RAM em tempo real.

---

## 🖥️ Telas Futuras do Console

1. **Tela de Autenticação (Login):** Entrada segura informando o Host do Agent e o Bearer Token correspondente.
2. **Dashboard Principal (Métricas):** Gráficos de telemetria atualizados via WebSocket mostrando a saúde geral do servidor.
3. **Painel de Controle de Serviços:** Lista de serviços permitidos com botões de início, parada e reinício, bem como visualização rápida do estado operacional (PID, Uptime).
4. **Visualizador de Logs:** Área dedicada para inspecionar as últimas linhas dos logs de cada serviço monitorado.
5. **Histórico de Auditoria:** Tela de pesquisa/tabela exibindo quem executou alterações no servidor, facilitando a análise de segurança.

---

## 🚦 Status Atual

- **Status:** `🔴 Não Iniciado` (Fase de Planejamento e Especificação concluída).
- **Próximos passos para o Dashboard:** O projeto React será inicializado na **Fase 7 — Flavos Web Console MVP** após o Core Agent estar maduro o suficiente com seus endpoints funcionais e autenticação implementada.
