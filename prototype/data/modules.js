/* Fonte única de conteúdo do Hub. Só texto e URLs: nenhuma regra de negócio.
   As URLs são EXATAMENTE as do site atual (nenhuma funcionalidade muda). */
window.EQ_DATA = {
  // Números reais de produção: para publicar, o dono autoriza e preenche (showNumbers:true).
  // O valor de teste fica em data/numbers.local.js, que NÃO vai para produção.
  showNumbers: false,
  numbersAsOf: "",
  numbers: [],

  // Destaque do Canteiro. Pontos baseados nas descrições já publicadas dos módulos de obras; Carlos confirma o escopo atual.
  featured: {
    id: "canteiro",
    url: "https://canteiro.equatec-eng.com.br/",
    points: [
      "Controle físico-financeiro por obra",
      "EAP, cronograma e acompanhamento de prazos",
      "Compras e financeiro no mesmo ambiente",
      "Custos e progresso medidos contra o planejado",
      "Documentos e relatórios da obra organizados",
      "Permissão por obra e por usuário"
    ]
  },

  links: {
    login: "/login",
    signup: "/cadastro",
    whatsapp: "https://wa.me/5522998578981",
    linkedin: "https://www.linkedin.com/in/carlos-machado-95917433/"
  },

  families: {
    obras:    "Obras e engenharia",
    ssma:     "Segurança e saúde",
    ativos:   "Ativos e qualidade",
    pessoas:  "Pessoas",
    comunid:  "Comunidade"
  },

  // status: "producao" | "gratuito"
  modules: [
    { id: "rdo", name: "Equatec RDO", short: "rdo", family: "obras",
      host: "rdo.equatec-eng.com.br", url: "https://rdo.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Relatório diário de obra, do campo à gestão.",
      problem: "RDO em papel e planilha perde horas, some com evidências e não fecha com o ponto e os contratos.",
      does: "Relatórios diários, equipes, contratos, ponto, recursos, OSE e assinaturas no mesmo lugar, com acompanhamento operacional.",
      tags: ["RDO e OSE", "Ponto e recursos", "3 bases independentes"], status: "producao" },

    { id: "gestorrt", name: "Gestor de RT", short: "rt", family: "obras",
      host: "gestorrt.equatec-eng.com.br", url: "https://gestorrt.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Responsabilidade técnica, CREA e ART sob controle.",
      problem: "Prazos de ART, acervo técnico e planos de ação espalhados entre planilhas e pastas.",
      does: "Gestão de responsabilidade técnica, CREA, ART, acervo técnico, planos de ação, cases, projetos e atividades de engenharia.",
      tags: ["CREA e ART", "Acervo técnico", "Base independente"], status: "producao" },

    { id: "canteiro", name: "Canteiro Equatec", short: "obras", family: "obras",
      host: "canteiro.equatec-eng.com.br", url: "https://canteiro.equatec-eng.com.br/", cta: "Acessar módulo",
      what: "Gestão de obras no canteiro: planejamento, compras e financeiro.",
      problem: "Prazo, compra e custo da obra vivem em sistemas diferentes e só se encontram no fim do mês.",
      does: "Planejamento, compras, financeiro, documentos e acompanhamento da obra em um ambiente integrado. (Descrição provisória: Carlos confirma o escopo atual do Canteiro.)",
      tags: ["Planejamento e prazos", "Compras e financeiro", "Documentos"], status: "producao" },

    { id: "ssma", name: "Ferramentas SSMA", short: "ssma", family: "ssma",
      host: "ferramentas.equatec-eng.com.br", url: "https://ferramentas.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Formulários e inspeções de segurança, saúde e meio ambiente.",
      problem: "Inspeção em papel não gera indicador, e desvio não registrado se repete.",
      does: "Formulários digitais (PAC, Safety Tour, inspeções), auditorias, desvios, metas e relatórios, com acesso mobile.",
      tags: ["Formulários SSMA", "Acesso mobile", "Relatórios"], status: "producao" },

    { id: "aso", name: "Equatec ASO", short: "aso", family: "ssma",
      host: "aso.equatec-eng.com.br", url: "https://aso.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Exames ocupacionais com alerta antes do vencimento.",
      problem: "Exame vencido descoberto na auditoria, e não no mês anterior.",
      does: "Funcionários, exames, clínicas, agendamentos, férias, alertas de vencimento e relatórios de conformidade.",
      tags: ["Alertas de vencimento", "Agendamentos", "Relatórios"], status: "producao" },

    { id: "ferramentaria", name: "SGAF Ferramentaria", short: "sgaf", family: "ativos",
      host: "ferramentaria.equatec-eng.com.br", url: "https://ferramentaria.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Ferramentas e ativos com rastreabilidade de ponta a ponta.",
      problem: "Ferramenta sem dono, calibração vencida e estoque que não bate.",
      does: "Ativos, ferramentas, estoque, movimentações, manutenções e calibrações, com histórico rastreável.",
      tags: ["Movimentações", "Calibrações", "Rastreabilidade"], status: "producao" },

    { id: "rtm", name: "RTM Equatec", short: "rtm", family: "ativos",
      host: "rtm.equatec-eng.com.br", url: "https://rtm.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Relatórios técnicos de montagem, RQS e profissionais.",
      problem: "Registro técnico sem padrão e sem vínculo com o profissional que executou.",
      does: "Relatórios técnicos, RTM, RQS, profissionais, instrumentos, inspeções e rastreabilidade da qualidade.",
      tags: ["RTM e RQS", "Profissionais", "Inspeções"], status: "producao" },

    { id: "qualidade", name: "Qualidade e RTM", short: "qual", family: "ativos",
      host: "qualidade.equatec-eng.com.br", url: "https://qualidade.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Qualidade integrada: soldagem, END, documentos e RECs.",
      problem: "Soldadores, END, consumíveis e documentos controlados em arquivos soltos.",
      does: "Gestão da qualidade e rastreabilidade técnica: RECs, soldagem, inspeções, consumíveis, instrumentos e documentos.",
      tags: ["Soldagem e END", "Consumíveis", "Documentos técnicos"], status: "producao" },

    { id: "treinamentos", name: "Treinamentos / SGT", short: "sgt", family: "pessoas",
      host: "treinamentos.equatec-eng.com.br", url: "https://treinamentos.equatec-eng.com.br", cta: "Acessar módulo",
      what: "Treinamentos, turmas, provas e certificados.",
      problem: "Certificado vencido e turma sem lista de presença confiável.",
      does: "Treinamentos, turmas, grades curriculares, avaliações, certificados e progresso profissional.",
      tags: ["Turmas e provas", "Certificação", "Base independente"], status: "producao" },

    { id: "convite", name: "Equatec Convites", short: "conv", family: "comunid",
      host: "convite.equatec-eng.com.br", url: "https://convite.equatec-eng.com.br/plataforma.php", cta: "Solicitar cadastro gratuito",
      what: "Convites com confirmação de presença e lista em PDF.",
      problem: "Confirmar presença por mensagem e contar na mão.",
      does: "Crie convites com seu flyer, acompanhe confirmações e visitas e baixe a lista de presença em PDF. Cadastro gratuito, sujeito à aprovação.",
      tags: ["Uso gratuito", "Eventos por organizador", "Cadastro com aprovação"], status: "gratuito" }
  ],

  // Próximos módulos (decisão do Carlos). Rótulo público: "Próximos módulos".
  roadmap: [
    { id: "contratos-cm", name: "Gestão de Contratos de Construção e Montagem", sub: "Caldeiraria e Soldagem",
      text: "Controle de contratos de construção e montagem industrial, da medição à rastreabilidade de soldagem e caldeiraria.",
      tags: ["Medição", "Soldagem", "Caldeiraria"] },
    { id: "crm", name: "CRM para a sua operação", sub: "Do lead à venda",
      text: "Mapeamento completo do funil, da captação do lead até a venda, com integração por IA.",
      tags: ["Funil completo", "Captação de leads", "Integração com IA"] },
    { id: "agentes", name: "Agentes de IA para Gestão de Contratos", sub: "Copilotos especialistas",
      text: "Agentes que leem contratos, cobram prazos e respondem dúvidas de gestão com memória técnica.",
      tags: ["Contratos", "Prazos", "Memória técnica"] },
    { id: "predial", name: "Gestão de Manutenção Predial", sub: "Rotinas automatizadas",
      text: "Automação de rotinas de manutenção, relatórios automáticos, abertura e atendimento de chamados com visão CRM e monitoramento das agendas da equipe.",
      tags: ["Chamados", "Rotinas", "Agenda da equipe", "Relatórios automáticos"] },
    { id: "bi-ia", name: "Business Intelligence com IA", sub: "Foco em contratos",
      text: "Indicadores de gestão de contratos na palma da mão, com integração com IA para explicar desvios e sugerir ação.",
      tags: ["Indicadores", "Mobile", "IA"] }
  ],

  method: [
    { t: "Diagnóstico", d: "Contexto, desafios, dados existentes e objetivos antes de propor a solução." },
    { t: "Mapeamento", d: "Fluxos, responsabilidades, sistemas e pontos críticos do ambiente." },
    { t: "Planejamento", d: "Escopo, entregáveis, indicadores de sucesso e governança da implantação." },
    { t: "Implementação", d: "Execução com rigor técnico, validações progressivas e entregas controladas." },
    { t: "Evolução", d: "Monitoramento de resultados e melhoria contínua da operação." }
  ]
};
