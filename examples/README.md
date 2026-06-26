# Arquivos de Exemplo

Esta pasta contém exemplos de arquivos de configuração e templates para facilitar o provisionamento rápido do Flavos OS 2.0.

---

## 📂 Arquivos Disponíveis

1. **`config.example.toml`**:
   - Exemplo do arquivo de configuração do Flavos Core Agent.
   - Define a porta do servidor, whitelist de serviços que podem ser reiniciados via API, ativação de auditoria e parâmetros extras de segurança do MVP.
   - Modo de uso: Deve ser copiado para `/etc/flavos/agent.toml` no Void Linux e ter suas permissões ajustadas para leitura exclusiva do usuário do Agent.

---

## 🔒 Boas Práticas
Ao copiar o arquivo de exemplo para produção:
- Altere a porta se necessário.
- Defina uma whitelist restrita de serviços contendo apenas o estritamente necessário.
- Nunca habilite `allow_shell` ou `allow_terminal` em ambientes reais.
