<!-- This comment prevents rendering issues -->

<div align="center">

# 🏥 FilaZero Saúde

### O Moderno Sistema de Gestão de Filas | The Modern Healthcare Queue Management System

![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production_Ready-success.svg?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg?style=flat-square)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&style=flat-square)
![PocketBase](https://img.shields.io/badge/PocketBase-0.21.5-B8DBE4?logo=pocketbase&style=flat-square)

**Elimine salas de espera. Maximize eficiência. Encante pacientes.**
**Eliminate waiting rooms. Maximize efficiency. Delight patients.**

[Features](#-key-features) • [Demo](#-live-demo) • [Tech Stack](#-technology-stack) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

<br />

---

# 🇧🇷 Português

**FilaZero Saúde** é uma plataforma SaaS B2B completa e pronta para produção, projetada para modernizar a gestão de filas em clínicas e hospitais. Nossa solução elimina o caos das salas de espera físicas através de uma orquestração digital em tempo real.

### 🚀 Destaques do Produto

- **💰 Oportunidade de Venda Rápida**: Avaliado em **$35,000 - $45,000 USD** (Abaixo do custo de dev).
- **✅ Pronto para Uso**: Código 100% funcional, testado e documentado.
- **⚡ Tecnologia Moderna**: Stack leve e performática (React 18 + PocketBase).
- **🌍 Mercado Gigante**: 200 mil clínicas no Brasil (~$1.2B Mercado Global).

## 📚 Documentação Completa (PT-BR)

### 💼 Negócios & Venda

| Documento | Descrição |
|-----------|-----------|
| **[📄 PROPOSTA_AQUISICAO.md](./docs/pt-br/business/PROPOSTA_AQUISICAO.md)** | Resumo executivo, destaques e termos de venda rápida. |
| **[💰 AVALIACAO.md](./docs/pt-br/business/AVALIACAO.md)** | Análise detalhada de preço ($35-45K) e custos de desenvolvimento. |
| **[📈 PLANO_NEGOCIOS.md](./docs/pt-br/business/PLANO_NEGOCIOS.md)** | Modelo de receita, projeções financeiras e estratégia. |
| **[📊 ANALISE_MERCADO.md](./docs/pt-br/business/ANALISE_MERCADO.md)** | Tamanho do mercado (TAM/SAM) e análise competitiva. |

### 🛠️ Técnica & Engenharia

| Documento | Descrição |
|-----------|-----------|
| **[🏛️ ARQUITETURA_TECNICA.md](./docs/pt-br/technical/ARQUITETURA_TECNICA.md)** | Diagramas, segurança, banco de dados e stack. |
| **[🚀 GUIA_DEPLOYMENT.md](./docs/pt-br/technical/GUIA_DEPLOYMENT.md)** | Como fazer deploy em VPS, Vercel e Docker. |
| **[🔌 DOCUMENTACAO_API.md](./docs/pt-br/technical/DOCUMENTACAO_API.md)** | Referência completa da API REST e WebSocket. |

---

# 🇺🇸 English

**FilaZero Saúde** is a production-ready B2B SaaS platform designed to modernize queue management for healthcare clinics. It transforms chaotic physical waiting rooms into smooth, digital patient flow experiences in real-time.

### 🚀 Product Highlights

- **💰 Quick Sale Opportunity**: Valued at **$35,000 - $45,000 USD** (Below dev cost).
- **✅ Production Ready**: 100% functional, tested, and documented codebase.
- **⚡ Modern Tech**: Lightweight and high-performance stack (React 18 + PocketBase).
- **🌍 Huge Market**: 200k clinics in Brazil alone (~$1.2B Global Market).

## 📚 Complete Documentation (EN)

### 💼 Business & Sales

| Document | Description |
|----------|-------------|
| **[📄 ACQUISITION_PITCH.md](./docs/en/business/ACQUISITION_PITCH.md)** | Executive summary, investment highlights & quick sale terms. |
| **[💰 VALUATION.md](./docs/en/business/VALUATION.md)** | Detailed pricing analysis ($35-45K) and valuation justification. |
| **[📈 BUSINESS_PLAN.md](./docs/en/business/BUSINESS_PLAN.md)** | Revenue model, financial projections, and growth strategy. |
| **[📊 MARKET_ANALYSIS.md](./docs/en/business/MARKET_ANALYSIS.md)** | Market size (TAM/SAM), competitive landscape & trends. |

### 🛠️ Technical & Engineering

| Document | Description |
|----------|-------------|
| **[🏛️ TECHNICAL_ARCHITECTURE.md](./docs/en/technical/TECHNICAL_ARCHITECTURE.md)** | System diagrams, security, database schema & stack. |
| **[🚀 DEPLOYMENT_GUIDE.md](./docs/en/technical/DEPLOYMENT_GUIDE.md)** | Step-by-step deploy guide for VPS, Vercel & Docker. |
| **[🔌 API_DOCUMENTATION.md](./docs/en/technical/API_DOCUMENTATION.md)** | Complete REST and WebSocket API reference. |

---

## 💎 Key Features / Funcionalidades

<table>
<tr>
<td width="50%" valign="top">

### 📱 Patient Mobile Experience

*Experiência Móvel do Paciente*

- **Instant Ticket Generation**<br>Geração instantânea via QR Code/URL, sem baixar app.
- **Real-Time Tracking**<br>Acompanhamento da posição na fila ao vivo no celular.
- **Wait Time Estimates**<br>Estimativa inteligente de tempo de espera.
- **Remote Queuing**<br>Aguarde no carro ou em casa com segurança.

</td>
<td width="50%" valign="top">

### 🖥️ Reception Dashboard

*Painel da Recepção*

- **Live Queue Visualization**<br>Visualização completa do fluxo de pacientes.
- **One-Click Calling**<br>Chame pacientes para o consultório com um clique.
- **Multi-Role Access**<br>Perfis de acesso seguros (Admin/Recepção).
- **Offline Mode**<br>Continua funcionando mesmo se a internet cair.

</td>
</tr>
</table>

## 🛠 Tech Stack / Tecnologias

- **Frontend**: React 18, Vite, Context API, Tailwind-like CSS
- **Backend**: PocketBase (Go + SQLite in WAL mode)
- **Real-time**: Native WebSockets (Server-Sent Events)
- **Deploy**: Docker Container, VPS, or Vercel (Frontend)

## 🚀 Quick Start / Início Rápido

```bash
# 1. Backend (PocketBase)
cd backend
./pocketbase serve

# 2. Frontend (React)
cd frontend
npm install && npm run dev
```

---

<div align="center">

### 📞 Contact / Contato

**Gabriel Lima Ferreira** - Full-Stack .NET Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/devferreirag/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:contato.ferreirag@outlook.com)

*For acquisition inquiries, please contact via LinkedIn or Email.*

</div>
